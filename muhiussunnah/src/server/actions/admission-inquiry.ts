"use server";

/**
 * Admission inquiry pipeline (lead funnel).
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

const inquirySchema = z.object({
  schoolSlug: z.string().min(1),
  student_name: z.string().trim().min(2).max(200),
  guardian_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  guardian_phone: z.string().trim().min(5).max(50),
  guardian_email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  class_interested: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  source: z.enum(["walk_in", "phone", "online", "referral", "other"]).default("walk_in"),
  followup_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
});

export async function addInquiryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(inquirySchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("admission_inquiries").insert({
    school_id: auth.active.school_id,
    branch_id: auth.active.branch_id,
    student_name: parsed.student_name,
    guardian_name: parsed.guardian_name ?? null,
    guardian_phone: parsed.guardian_phone,
    guardian_email: parsed.guardian_email ?? null,
    class_interested: parsed.class_interested ?? null,
    source: parsed.source,
    status: "new",
    followup_date: parsed.followup_date ?? null,
    notes: parsed.notes ?? null,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "admission_inquiry",
    meta: { student_name: parsed.student_name, source: parsed.source },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/admission-inquiry`);
  return ok(undefined, "নতুন ভর্তি জিজ্ঞাসা যোগ হয়েছে।");
}

const updateInquirySchema = z.object({
  schoolSlug: z.string().min(1),
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "visited", "admitted", "lost"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
  followup_date: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export async function updateInquiryStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateInquirySchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  const patch: Record<string, unknown> = { status: parsed.status };
  if (parsed.notes !== undefined) patch.notes = parsed.notes;
  if (parsed.followup_date !== undefined) patch.followup_date = parsed.followup_date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("admission_inquiries")
    .update(patch)
    .eq("id", parsed.id)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/admission-inquiry`);
  return ok(undefined, "স্ট্যাটাস আপডেট হয়েছে।");
}
