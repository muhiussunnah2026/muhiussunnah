"use server";

/**
 * Attendance entry + viewing.
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
  status: z.enum(["present", "absent", "late", "leave", "holiday"]),
});

export async function saveAttendanceAction(input: {
  schoolSlug: string;
  section_id: string;
  date: string; // YYYY-MM-DD
  entries: { student_id: string; status: "present" | "absent" | "late" | "leave" | "holiday" }[];
  remarks_by_student?: Record<string, string>;
}): Promise<ActionResult<{ saved: number }>> {
  const { schoolSlug, section_id, date, entries } = input;

  const auth = await authorizeAction({
    schoolSlug,
    action: "update",
    resource: "attendance",
    scope: { type: "section", id: section_id },
  });
  if ("error" in auth) return auth.error as ActionResult<{ saved: number }>;

  const validated = entries.map((e) => entrySchema.parse(e));
  if (validated.length === 0) return fail<{ saved: number }>("কোন attendance এন্ট্রি নেই।");

  const supabase = await supabaseServer();

  const rows = validated.map((e) => ({
    school_id: auth.active.school_id,
    student_id: e.student_id,
    section_id,
    date,
    status: e.status,
    marked_by: auth.active.school_user_id,
    marked_at: new Date().toISOString(),
    source: "manual",
    remarks: input.remarks_by_student?.[e.student_id] ?? null,
  }));

  // Upsert on (student_id, date)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });
  if (error) return fail<{ saved: number }>(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "upsert",
    resourceType: "attendance",
    meta: { section_id, date, count: rows.length },
  });

  revalidatePath(`/teacher/attendance`);
  revalidatePath(`/admin/attendance`);
  return ok({ saved: rows.length }, `${rows.length} জনের attendance সংরক্ষণ করা হয়েছে।`);
}
