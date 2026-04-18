"use server";

/**
 * Basic payroll — generate draft salaries for a month, approve, pay.
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
// Generate monthly drafts from base salary stored in school_users.metadata
// -----------------------------------------------------------------

type GenResult = { created: number; skipped: number };

export async function generateMonthlyPayrollAction(
  schoolSlug: string,
  input: { month: number; year: number },
): Promise<ActionResult<GenResult>> {
  const auth = await authorizeAction({
    schoolSlug,
    action: "create",
    resource: "salary",
  });
  if ("error" in auth) return auth.error as ActionResult<GenResult>;

  const { month, year } = input;
  if (month < 1 || month > 12 || !year) return fail<GenResult>("সঠিক মাস ও বছর দিন।");

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from("school_users")
    .select("id, full_name_bn, metadata")
    .eq("school_id", auth.active.school_id)
    .eq("status", "active")
    .not("role", "in", "(STUDENT,PARENT)");

  const staffList = (staff ?? []) as Array<{ id: string; full_name_bn: string | null; metadata: Record<string, unknown> | null }>;

  let created = 0;
  let skipped = 0;

  for (const s of staffList) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("staff_salaries")
      .select("id")
      .eq("school_user_id", s.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();
    if (existing) { skipped++; continue; }

    const basic = Number((s.metadata?.basic_salary as number | undefined) ?? 0);
    const allowances = (s.metadata?.allowances as Record<string, number> | undefined) ?? {};
    const deductions = (s.metadata?.deductions as Record<string, number> | undefined) ?? {};
    const allowanceTotal = Object.values(allowances).reduce((a, b) => a + Number(b || 0), 0);
    const deductionTotal = Object.values(deductions).reduce((a, b) => a + Number(b || 0), 0);
    const gross = basic + allowanceTotal;
    const net = gross - deductionTotal;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("staff_salaries").insert({
      school_user_id: s.id,
      month,
      year,
      basic,
      allowances,
      deductions,
      gross_amount: gross,
      net_amount: net,
      status: "draft",
    });
    if (!error) created++;
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "bulk_create",
    resourceType: "payroll",
    meta: { month, year, created, skipped },
  });

  revalidatePath(`/school/${schoolSlug}/admin/payroll`);
  return ok({ created, skipped }, `${created} টি draft salary তৈরি, ${skipped} টি আগে থেকে ছিল।`);
}

// -----------------------------------------------------------------
// Mark a salary as paid
// -----------------------------------------------------------------

const markPaidSchema = z.object({
  schoolSlug: z.string().min(1),
  id: z.string().uuid(),
  paid_on: z.string().min(1),
  payment_method: z.enum(["cash", "bkash", "nagad", "rocket", "card", "bank_transfer", "cheque", "other"]).default("cash"),
});

export async function markSalaryPaidAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(markPaidSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "approve",
    resource: "salary",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("staff_salaries")
    .update({
      status: "paid",
      paid_on: parsed.paid_on,
      paid_by: auth.active.school_user_id,
      payment_method: parsed.payment_method,
    })
    .eq("id", parsed.id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/payroll`);
  return ok(undefined, "বেতন পরিশোধ সম্পন্ন।");
}
