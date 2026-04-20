"use server";

/**
 * Daily Sabaq-Sabqi-Manzil log. One row per (student, date).
 *
 * Teachers enter for a whole section at once via bulk upsert.
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

const qualityEnum = z.enum(["excellent", "good", "average", "weak"]);

const entrySchema = z.object({
  student_id: z.string().uuid(),
  sabaq_para: z.number().nullable().optional(),
  sabaq_from: z.string().nullable().optional(),
  sabaq_to: z.string().nullable().optional(),
  sabaq_quality: qualityEnum.nullable().optional(),
  sabqi_para: z.number().nullable().optional(),
  sabqi_quality: qualityEnum.nullable().optional(),
  manzil_paras: z.array(z.number()).nullable().optional(),
  manzil_quality: qualityEnum.nullable().optional(),
  tajweed_notes: z.string().nullable().optional(),
});

type SaveInput = {
  schoolSlug: string;
  date: string;
  entries: z.input<typeof entrySchema>[];
};

export async function saveDailySabaqAction(input: SaveInput): Promise<ActionResult<{ saved: number }>> {
  const auth = await authorizeAction({
    schoolSlug: input.schoolSlug,
    action: "update",
    resource: "sabaq",
  });
  if ("error" in auth) return auth.error as ActionResult<{ saved: number }>;

  if (!input.entries || input.entries.length === 0) {
    return fail<{ saved: number }>("কোন এন্ট্রি নেই।");
  }

  const validated = input.entries.map((e) => entrySchema.parse(e));

  const supabase = await supabaseServer();
  const rows = validated.map((e) => ({
    school_id: auth.active.school_id,
    student_id: e.student_id,
    date: input.date,
    sabaq_para: e.sabaq_para ?? null,
    sabaq_from: e.sabaq_from ?? null,
    sabaq_to: e.sabaq_to ?? null,
    sabaq_quality: e.sabaq_quality ?? null,
    sabqi_para: e.sabqi_para ?? null,
    sabqi_quality: e.sabqi_quality ?? null,
    manzil_paras: e.manzil_paras ?? [],
    manzil_quality: e.manzil_quality ?? null,
    tajweed_notes: e.tajweed_notes ?? null,
    teacher_id: auth.active.school_user_id,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("daily_sabaq")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) return fail<{ saved: number }>(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "upsert",
    resourceType: "daily_sabaq",
    meta: { date: input.date, count: rows.length },
  });

  revalidatePath(`/admin/madrasa/daily-sabaq`);
  revalidatePath(`/teacher/daily-sabaq`);
  return ok({ saved: rows.length }, `${rows.length} জনের সবক সংরক্ষণ হয়েছে।`);
}
