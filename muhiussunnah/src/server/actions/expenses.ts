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

// -----------------------------------------------------------------
// Expense heads
// -----------------------------------------------------------------

const expenseHeadSchema = z.object({
  schoolSlug: z.string().min(1),
  name_bn: z.string().trim().min(1).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  category: z.enum(["general", "utility", "salary", "asset", "loan", "maintenance", "purchase", "travel", "event", "misc"]).default("general"),
  display_order: z.coerce.number().int().default(0),
});

export async function addExpenseHeadAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(expenseHeadSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "expense",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("expense_heads").insert({
    school_id: auth.active.school_id,
    name_bn: parsed.name_bn,
    name_en: parsed.name_en ?? null,
    category: parsed.category,
    display_order: parsed.display_order,
    is_active: true,
  });
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/expenses`);
  return ok(undefined, "খরচ হেড যোগ হয়েছে।");
}

// -----------------------------------------------------------------
// Expense entry
// -----------------------------------------------------------------

const expenseSchema = z.object({
  schoolSlug: z.string().min(1),
  head_id: z.string().uuid(),
  date: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  paid_to: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  payment_method: z.enum(["cash", "bkash", "nagad", "rocket", "card", "bank_transfer", "cheque", "other"]).default("cash"),
  reference_no: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  description: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function addExpenseAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(expenseSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "expense",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("expenses").insert({
    school_id: auth.active.school_id,
    branch_id: auth.active.branch_id,
    date: parsed.date,
    head_id: parsed.head_id,
    amount: parsed.amount,
    paid_to: parsed.paid_to ?? null,
    payment_method: parsed.payment_method,
    reference_no: parsed.reference_no ?? null,
    description: parsed.description ?? null,
    created_by: auth.active.school_user_id,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "expense",
    meta: { amount: parsed.amount, head_id: parsed.head_id },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/expenses`);
  return ok(undefined, "খরচ রেকর্ড করা হয়েছে।");
}
