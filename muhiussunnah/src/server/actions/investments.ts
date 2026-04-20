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

const investmentSchema = z.object({
  schoolSlug: z.string().min(1),
  title: z.string().trim().min(2).max(200),
  principal: z.coerce.number().min(0.01),
  return_expected: z.coerce.number().optional(),
  start_date: z.string().min(1),
  maturity_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(1000).optional().or(z.literal("").transform(() => undefined)),
});

export async function addInvestmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(investmentSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "investment",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("investments").insert({
    school_id: auth.active.school_id,
    title: parsed.title,
    principal: parsed.principal,
    return_expected: parsed.return_expected ?? null,
    start_date: parsed.start_date,
    maturity_date: parsed.maturity_date ?? null,
    status: "active",
    notes: parsed.notes ?? null,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "investment",
    meta: { title: parsed.title, principal: parsed.principal },
  });
  revalidatePath(`/admin/investments`);
  return ok(undefined, "বিনিয়োগ যোগ হয়েছে।");
}

const returnSchema = z.object({
  schoolSlug: z.string().min(1),
  investment_id: z.string().uuid(),
  date: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  note: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function addInvestmentReturnAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(returnSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "investment",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("investment_returns").insert({
    investment_id: parsed.investment_id,
    date: parsed.date,
    amount: parsed.amount,
    note: parsed.note ?? null,
  });
  if (error) return fail(error.message);

  revalidatePath(`/admin/investments`);
  return ok(undefined, "রিটার্ন রেকর্ড করা হয়েছে।");
}
