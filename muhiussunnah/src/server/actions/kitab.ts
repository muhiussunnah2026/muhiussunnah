"use server";

/**
 * Kitab curriculum: add kitabs per stage; track student progress.
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

const addKitabSchema = z.object({
  schoolSlug: z.string().min(1),
  class_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  stage: z.enum(["ibtedaiyyah", "mutawassita", "sanaweeya_aamma", "sanaweeya_khassa", "fazilat", "kamil"]),
  kitab_name: z.string().trim().min(1).max(200),
  author: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  display_order: z.coerce.number().int().default(0),
});

export async function addKitabAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(addKitabSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("kitab_curriculum").insert({
    school_id: auth.active.school_id,
    class_id: parsed.class_id ?? null,
    stage: parsed.stage,
    kitab_name: parsed.kitab_name,
    author: parsed.author ?? null,
    display_order: parsed.display_order,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "kitab",
    meta: { stage: parsed.stage, kitab_name: parsed.kitab_name },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/madrasa/kitab`);
  return ok(undefined, "কিতাব যোগ হয়েছে।");
}

const progressSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
  kitab_id: z.string().uuid(),
  started_on: z.string().optional().or(z.literal("").transform(() => undefined)),
  current_chapter: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  completed_on: z.string().optional().or(z.literal("").transform(() => undefined)),
  grade: z.string().trim().max(5).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function updateKitabProgressAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(progressSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "hifz",
    scope: { type: "student", id: parsed.student_id },
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("student_kitab_progress")
    .upsert(
      {
        student_id: parsed.student_id,
        kitab_id: parsed.kitab_id,
        started_on: parsed.started_on ?? null,
        current_chapter: parsed.current_chapter ?? null,
        completed_on: parsed.completed_on ?? null,
        grade: parsed.grade ?? null,
        teacher_id: auth.active.school_user_id,
        notes: parsed.notes ?? null,
      },
      { onConflict: "student_id,kitab_id" },
    );
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/madrasa/kitab`);
  return ok(undefined, "অগ্রগতি আপডেট হয়েছে।");
}
