"use server";

/**
 * Marks entry + lock/approve.
 *
 * Teachers or admins enter marks via a grid UI. We save on "Save all"
 * (bulk upsert). Optional lock step prevents further edits. Approve
 * step marks the marks row as `approved_by/at` — admin-only.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  type ActionResult,
  ok,
  fail,
  authorizeAction,
  writeAuditLog,
} from "./_helpers";

const entrySchema = z.object({
  student_id: z.string().uuid(),
  marks_obtained: z.number().nullable(),
  is_absent: z.boolean().optional(),
  grade: z.string().optional(),
});

type SaveInput = {
  schoolSlug: string;
  exam_subject_id: string;
  entries: { student_id: string; marks_obtained: number | null; is_absent?: boolean; grade?: string }[];
};

export async function saveMarksAction(input: SaveInput): Promise<ActionResult<{ saved: number }>> {
  const auth = await authorizeAction({
    schoolSlug: input.schoolSlug,
    action: "update",
    resource: "marks",
  });
  if ("error" in auth) return auth.error as ActionResult<{ saved: number }>;

  const validated = input.entries.map((e) => entrySchema.parse(e));
  if (validated.length === 0) return fail<{ saved: number }>("কোন এন্ট্রি নেই।");

  const supabase = await supabaseServer();

  // Verify exam_subject belongs to this school
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: examSubject } = await (supabase as any)
    .from("exam_subjects")
    .select("id, exam_id, full_marks, exams!inner(school_id)")
    .eq("id", input.exam_subject_id)
    .single();
  if (!examSubject || examSubject.exams.school_id !== auth.active.school_id) {
    return fail<{ saved: number }>("পরীক্ষা খুঁজে পাওয়া যায়নি।");
  }

  // Reject changes if locked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lockCheck } = await (supabase as any)
    .from("marks")
    .select("id")
    .eq("exam_subject_id", input.exam_subject_id)
    .eq("locked", true)
    .limit(1);
  if (lockCheck && lockCheck.length > 0) {
    return fail<{ saved: number }>("এই বিষয়ের মার্ক্স লক করা হয়েছে। আগে unlock করতে হবে।");
  }

  const rows = validated.map((e) => ({
    school_id: auth.active.school_id,
    exam_subject_id: input.exam_subject_id,
    student_id: e.student_id,
    marks_obtained: e.is_absent ? null : e.marks_obtained,
    is_absent: e.is_absent ?? false,
    grade: e.grade ?? null,
    entered_by: auth.active.school_user_id,
    entered_at: new Date().toISOString(),
    locked: false,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("marks")
    .upsert(rows, { onConflict: "exam_subject_id,student_id" });
  if (error) return fail<{ saved: number }>(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "upsert",
    resourceType: "marks",
    meta: { exam_subject_id: input.exam_subject_id, count: rows.length },
  });

  revalidatePath(`/school/${input.schoolSlug}/admin/exams`);
  revalidatePath(`/school/${input.schoolSlug}/teacher/marks`);
  return ok({ saved: rows.length }, `${rows.length} জনের মার্ক্স সংরক্ষিত।`);
}

// -----------------------------------------------------------------
// Lock / unlock an exam-subject's marks
// -----------------------------------------------------------------

export async function toggleLockAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const exam_subject_id = formData.get("exam_subject_id")?.toString() ?? "";
  const lock = formData.get("lock")?.toString() === "true";
  if (!schoolSlug || !exam_subject_id) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({ schoolSlug, action: "approve", resource: "marks" });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("marks")
    .update({
      locked: lock,
      approved_by: lock ? auth.active.school_user_id : null,
      approved_at: lock ? new Date().toISOString() : null,
    })
    .eq("exam_subject_id", exam_subject_id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/exams`);
  return ok(undefined, lock ? "মার্ক্স লক করা হয়েছে।" : "মার্ক্স unlock করা হয়েছে।");
}
