"use server";

/**
 * Exam setup: create exam, add exam_subjects (routine), publish, delete.
 *
 * Flow:
 *   1. Admin creates exam (name, type, dates)
 *   2. Admin adds exam_subjects — one row per (subject × section) with
 *      date/time/duration/full-marks/pass-marks
 *   3. Teacher / admin enters marks in /teacher|admin marks grid
 *   4. Admin runs "Publish results" which:
 *      - compiles report_cards for every student in every section that has
 *        at least one mark
 *      - computes total, GPA via grading scale, position in class
 *      - sets exams.is_published = true
 *   5. Students/parents can now view results in /portal/results
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  type ActionResult,
  ok,
  fail,
  parseForm,
  authorizeAction,
  writeAuditLog,
} from "./_helpers";

// -----------------------------------------------------------------
// Create an exam
// -----------------------------------------------------------------

const examSchema = z.object({
  schoolSlug: z.string().min(1),
  academic_year_id: z.string().uuid(),
  name: z.string().trim().min(2).max(200),
  type: z.enum(["term", "annual", "model_test", "monthly", "other"]).default("term"),
  start_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  end_date: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export async function addExamAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(examSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "exam",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("exams")
    .insert({
      school_id: auth.active.school_id,
      academic_year_id: parsed.academic_year_id,
      name: parsed.name,
      type: parsed.type,
      start_date: parsed.start_date ?? null,
      end_date: parsed.end_date ?? null,
      is_published: false,
    })
    .select("id")
    .single();
  if (error || !data) return fail(error?.message ?? "পরীক্ষা তৈরি করা যায়নি।");

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "exam",
    resourceId: data.id,
    meta: { name: parsed.name, type: parsed.type },
  });
  revalidatePath(`/admin/exams`);
  return ok({ id: data.id }, "পরীক্ষা তৈরি হয়েছে।", `/admin/exams/${data.id}`);
}

// -----------------------------------------------------------------
// Add routine row: (exam × subject × section, date/time/marks)
// -----------------------------------------------------------------

const routineSchema = z.object({
  schoolSlug: z.string().min(1),
  exam_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  section_id: z.string().uuid(),
  date: z.string().optional().or(z.literal("").transform(() => undefined)),
  start_time: z.string().optional().or(z.literal("").transform(() => undefined)),
  duration_mins: z.coerce.number().int().min(1).max(1000).optional(),
  full_marks: z.coerce.number().int().min(1).default(100),
  pass_marks: z.coerce.number().int().min(0).default(33),
});

export async function addRoutineRowAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(routineSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "exam",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("exam_subjects").insert({
    exam_id: parsed.exam_id,
    subject_id: parsed.subject_id,
    section_id: parsed.section_id,
    date: parsed.date ?? null,
    start_time: parsed.start_time ?? null,
    duration_mins: parsed.duration_mins ?? null,
    full_marks: parsed.full_marks,
    pass_marks: parsed.pass_marks,
  });
  if (error) return fail(error.message);

  revalidatePath(`/admin/exams/${parsed.exam_id}`);
  return ok(undefined, "রুটিন এন্ট্রি যোগ হয়েছে।");
}

export async function deleteRoutineRowAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const id = formData.get("id")?.toString() ?? "";
  const examId = formData.get("exam_id")?.toString() ?? "";
  if (!schoolSlug || !id) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({ schoolSlug, action: "delete", resource: "exam" });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("exam_subjects").delete().eq("id", id);
  if (error) return fail(error.message);

  if (examId) revalidatePath(`/admin/exams/${examId}`);
  return ok(undefined, "মুছে ফেলা হয়েছে।");
}

// -----------------------------------------------------------------
// Publish / unpublish results
// -----------------------------------------------------------------

function computeGradeFromRules(mark: number, full: number, rules: { grade: string; min: number; max: number; gpa: number }[]): { grade: string; gpa: number } {
  const pct = full > 0 ? (mark / full) * 100 : 0;
  const rule = rules.find((r) => pct >= r.min && pct <= r.max);
  return rule ? { grade: rule.grade, gpa: rule.gpa } : { grade: "F", gpa: 0 };
}

export async function publishExamAction(
  schoolSlug: string,
  examId: string,
): Promise<ActionResult<{ report_cards_built: number }>> {
  const auth = await authorizeAction({ schoolSlug, action: "approve", resource: "exam" });
  if ("error" in auth) return auth.error as ActionResult<{ report_cards_built: number }>;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: scale } = await (supabase as any)
    .from("grading_scales")
    .select("rules")
    .eq("school_id", auth.active.school_id)
    .eq("is_default", true)
    .maybeSingle();
  const rules = (scale?.rules ?? []) as { grade: string; min: number; max: number; gpa: number }[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subjectsRows } = await (supabase as any)
    .from("exam_subjects")
    .select("id, subject_id, section_id, full_marks, pass_marks")
    .eq("exam_id", examId);
  const examSubjects = (subjectsRows ?? []) as { id: string; subject_id: string; section_id: string; full_marks: number; pass_marks: number }[];
  if (examSubjects.length === 0) return fail<{ report_cards_built: number }>("পরীক্ষার রুটিন নেই।");

  // Students per section
  const sectionIds = Array.from(new Set(examSubjects.map((s) => s.section_id)));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, section_id, name_bn")
    .in("section_id", sectionIds)
    .eq("status", "active");
  const studentList = (students ?? []) as { id: string; section_id: string; name_bn: string }[];

  // All marks for this exam
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: marks } = await (supabase as any)
    .from("marks")
    .select("student_id, exam_subject_id, marks_obtained, is_absent")
    .in("exam_subject_id", examSubjects.map((s) => s.id));
  const marksList = (marks ?? []) as { student_id: string; exam_subject_id: string; marks_obtained: number | null; is_absent: boolean }[];

  // Attendance percent per student for the exam's date range (optional)
  // Simplified: use all-time attendance percent for the 30 days around the exam.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attRows } = await (supabase as any)
    .from("attendance")
    .select("student_id, status")
    .in("student_id", studentList.map((s) => s.id))
    .gte("date", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const attMap = new Map<string, { present: number; total: number }>();
  for (const a of (attRows ?? []) as { student_id: string; status: string }[]) {
    const cur = attMap.get(a.student_id) ?? { present: 0, total: 0 };
    cur.total++;
    if (a.status === "present" || a.status === "late") cur.present++;
    attMap.set(a.student_id, cur);
  }

  // Compute per-student totals & GPAs
  const studentTotals = new Map<string, { total_marks: number; full_marks: number; gpa_sum: number; subjects: number; section_id: string; name_bn: string }>();
  for (const s of studentList) {
    studentTotals.set(s.id, { total_marks: 0, full_marks: 0, gpa_sum: 0, subjects: 0, section_id: s.section_id, name_bn: s.name_bn });
  }

  const subjectsBySection = new Map<string, typeof examSubjects>();
  for (const es of examSubjects) {
    const arr = subjectsBySection.get(es.section_id) ?? [];
    arr.push(es);
    subjectsBySection.set(es.section_id, arr);
  }

  for (const s of studentList) {
    const agg = studentTotals.get(s.id)!;
    const sectionSubjects = subjectsBySection.get(s.section_id) ?? [];
    for (const es of sectionSubjects) {
      const m = marksList.find((mm) => mm.student_id === s.id && mm.exam_subject_id === es.id);
      if (!m || m.is_absent || m.marks_obtained === null) continue;
      const { gpa } = computeGradeFromRules(Number(m.marks_obtained), es.full_marks, rules);
      agg.total_marks += Number(m.marks_obtained);
      agg.full_marks += es.full_marks;
      agg.gpa_sum += gpa;
      agg.subjects += 1;
    }
  }

  // Rank per section
  const sectionBuckets = new Map<string, { student_id: string; total: number }[]>();
  for (const [student_id, agg] of studentTotals.entries()) {
    const arr = sectionBuckets.get(agg.section_id) ?? [];
    arr.push({ student_id, total: agg.total_marks });
    sectionBuckets.set(agg.section_id, arr);
  }
  const positionMap = new Map<string, number>();
  for (const bucket of sectionBuckets.values()) {
    bucket.sort((a, b) => b.total - a.total);
    let position = 0;
    let prevTotal = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].total !== prevTotal) position = i + 1;
      positionMap.set(bucket[i].student_id, position);
      prevTotal = bucket[i].total;
    }
  }

  // Upsert report_cards
  const rows = Array.from(studentTotals.entries()).map(([student_id, agg]) => {
    const overall_gpa = agg.subjects > 0 ? +(agg.gpa_sum / agg.subjects).toFixed(2) : 0;
    const overallPct = agg.full_marks > 0 ? (agg.total_marks / agg.full_marks) * 100 : 0;
    const { grade: overall_grade } = computeGradeFromRules(overallPct, 100, rules);
    const att = attMap.get(student_id);
    const attendance_pct = att && att.total > 0 ? +((att.present / att.total) * 100).toFixed(2) : null;
    return {
      school_id: auth.active.school_id,
      student_id,
      exam_id: examId,
      overall_gpa,
      overall_grade,
      total_marks_obtained: agg.total_marks,
      total_full_marks: agg.full_marks,
      position_in_class: positionMap.get(student_id) ?? null,
      attendance_pct,
      published_at: new Date().toISOString(),
      published_by: auth.active.school_user_id,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("report_cards")
    .upsert(rows, { onConflict: "student_id,exam_id" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("exams")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("id", examId);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "publish",
    resourceType: "exam",
    resourceId: examId,
    meta: { report_cards: rows.length },
  });

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath(`/portal/results`);
  return ok({ report_cards_built: rows.length }, `✓ ${rows.length} টি report card তৈরি হয়েছে ও প্রকাশ পেয়েছে।`);
}

export async function unpublishExamAction(
  schoolSlug: string,
  examId: string,
): Promise<ActionResult> {
  const auth = await authorizeAction({ schoolSlug, action: "approve", resource: "exam" });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("exams")
    .update({ is_published: false, published_at: null })
    .eq("id", examId)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/admin/exams/${examId}`);
  return ok(undefined, "ফলাফল unpublish করা হয়েছে।");
}
