/**
 * POST /api/ai/report-comment
 *
 * Body: { exam_id, student_id, schoolSlug }
 * Returns: { comment, source: "ai" | "rule" }
 *
 * Admin/teacher with scope for the student can call this. The endpoint
 * looks up exam marks, assembles a StudentPerformance, hands off to
 * generateReportComment (which falls back gracefully if AI is off).
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { supabaseServer } from "@/lib/supabase/server";
import { generateReportComment, type StudentPerformance } from "@/lib/ai/report-comment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { schoolSlug, exam_id, student_id } = body as { schoolSlug?: string; exam_id?: string; student_id?: string };
  if (!schoolSlug || !exam_id || !student_id) {
    return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
  }

  const session = await getSession(schoolSlug);
  if (!session?.active) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const allowed = await hasPermission({
    schoolSlug,
    action: "update",
    resource: "report_card",
    scope: { type: "student", id: student_id },
  });
  if (!allowed) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (supabase as any)
    .from("students")
    .select("name_bn, sections(name, classes(name_bn))")
    .eq("id", student_id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reportCard } = await (supabase as any)
    .from("report_cards")
    .select("overall_gpa, overall_grade, position_in_class, attendance_pct")
    .eq("student_id", student_id)
    .eq("exam_id", exam_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: marks } = await (supabase as any)
    .from("marks")
    .select("marks_obtained, is_absent, grade, exam_subjects!inner(full_marks, subjects(name_bn))")
    .eq("student_id", student_id)
    .eq("exam_subjects.exam_id", exam_id);

  const subjects = ((marks ?? []) as Array<{ marks_obtained: number | null; is_absent: boolean; grade: string | null; exam_subjects: { full_marks: number; subjects: { name_bn: string } } }>)
    .filter((m) => !m.is_absent && m.marks_obtained !== null)
    .map((m) => ({
      name: m.exam_subjects.subjects.name_bn,
      marks: Number(m.marks_obtained),
      full_marks: m.exam_subjects.full_marks,
      grade: m.grade ?? "—",
    }));

  const perf: StudentPerformance = {
    student_name: student?.name_bn ?? "ছাত্র",
    class_name: student?.sections?.classes?.name_bn,
    overall_gpa: Number(reportCard?.overall_gpa ?? 0),
    overall_grade: reportCard?.overall_grade ?? "—",
    position: reportCard?.position_in_class ?? null,
    attendance_pct: reportCard?.attendance_pct ?? null,
    subjects,
  };

  const result = await generateReportComment(perf);
  return NextResponse.json(result);
}
