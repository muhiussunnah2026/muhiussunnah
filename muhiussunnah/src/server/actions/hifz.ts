"use server";

/**
 * Hifz progress: record per-para status for a student.
 *
 * Status transitions: learning → revising → completed → tested.
 * Only MADRASA_USTADH / CLASS_TEACHER / admin roles can update.
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

const recordSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
  para_no: z.coerce.number().int().min(1).max(30),
  status: z.enum(["learning", "revising", "completed", "tested"]),
  sipara_no: z.coerce.number().int().optional(),
  mark: z.coerce.number().optional(),
  grade: z.string().trim().max(5).optional().or(z.literal("").transform(() => undefined)),
  mistakes_count: z.coerce.number().int().min(0).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function recordHifzAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(recordSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "hifz",
    scope: { type: "student", id: parsed.student_id },
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  const row = {
    school_id: auth.active.school_id,
    student_id: parsed.student_id,
    para_no: parsed.para_no,
    sipara_no: parsed.sipara_no ?? null,
    status: parsed.status,
    tested_on: parsed.status === "tested" ? new Date().toISOString().slice(0, 10) : null,
    tested_by: parsed.status === "tested" ? auth.active.school_user_id : null,
    mark: parsed.mark ?? null,
    grade: parsed.grade ?? null,
    mistakes_count: parsed.mistakes_count ?? 0,
    note: parsed.note ?? null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("hifz_progress")
    .upsert(row, { onConflict: "student_id,para_no" });

  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "upsert",
    resourceType: "hifz_progress",
    resourceId: parsed.student_id,
    meta: { para_no: parsed.para_no, status: parsed.status },
  });

  revalidatePath(`/admin/madrasa/hifz`);
  revalidatePath(`/admin/madrasa/hifz/${parsed.student_id}`);
  return ok(undefined, `পারা ${parsed.para_no} — ${parsed.status}`);
}
