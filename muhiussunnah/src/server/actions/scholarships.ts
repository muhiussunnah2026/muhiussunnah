"use server";

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

const scholarshipSchema = z.object({
  schoolSlug: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("").transform(() => undefined)),
  amount_type: z.enum(["fixed", "percentage"]),
  amount: z.coerce.number().min(0),
});

export async function addScholarshipAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(scholarshipSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("scholarships").insert({
    school_id: auth.active.school_id,
    name: parsed.name,
    description: parsed.description ?? null,
    amount_type: parsed.amount_type,
    amount: parsed.amount,
    criteria: {},
  });
  if (error) return fail(error.message);

  revalidatePath(`/admin/scholarships`);
  return ok(undefined, "বৃত্তি যোগ হয়েছে।");
}

const assignSchema = z.object({
  schoolSlug: z.string().min(1),
  scholarship_id: z.string().uuid(),
  student_id: z.string().uuid(),
  valid_until: z.string().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function assignScholarshipAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(assignSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("student_scholarships").insert({
    student_id: parsed.student_id,
    scholarship_id: parsed.scholarship_id,
    granted_by: auth.active.school_user_id,
    granted_at: new Date().toISOString(),
    valid_until: parsed.valid_until ?? null,
    notes: parsed.notes ?? null,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "student_scholarship",
    meta: { student_id: parsed.student_id, scholarship_id: parsed.scholarship_id },
  });

  revalidatePath(`/admin/scholarships`);
  return ok(undefined, "বৃত্তি প্রদান করা হয়েছে।");
}
