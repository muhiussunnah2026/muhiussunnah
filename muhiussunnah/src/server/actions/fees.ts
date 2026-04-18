"use server";

/**
 * Fees: heads, structures, invoice generation, cash payments.
 *
 * Invoice generation logic:
 *   1. For each active student in the school (or a chosen class/section),
 *      look up the fee_structures that apply (match class OR null class = all).
 *   2. Sum into fee_invoices.total_amount and create fee_invoice_items per head.
 *   3. Generate a unique invoice_no: INV-YYYYMM-XXXXX
 *   4. Skip any student who already has an invoice for the (month, year) tuple.
 */

import { randomUUID } from "node:crypto";
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
// Fee heads
// -----------------------------------------------------------------

const feeHeadSchema = z.object({
  schoolSlug: z.string().min(1),
  name_bn: z.string().trim().min(1).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  type: z.enum(["general", "admission", "session", "exam", "transport", "hostel", "canteen", "other"]).default("general"),
  default_amount: z.coerce.number().min(0).default(0),
  is_recurring: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
  frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional(),
  display_order: z.coerce.number().int().default(0),
});

export async function addFeeHeadAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(feeHeadSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("fee_heads").insert({
    school_id: auth.active.school_id,
    name_bn: parsed.name_bn,
    name_en: parsed.name_en ?? null,
    type: parsed.type,
    default_amount: parsed.default_amount,
    is_recurring: parsed.is_recurring,
    frequency: parsed.frequency ?? null,
    display_order: parsed.display_order,
    is_active: true,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "fee_head",
    meta: { name_bn: parsed.name_bn },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/fees/heads`);
  return ok(undefined, "ফি হেড যোগ হয়েছে।");
}

const updateHeadAmountSchema = z.object({
  schoolSlug: z.string().min(1),
  id: z.string().uuid(),
  default_amount: z.coerce.number().min(0),
});

export async function updateFeeHeadAmountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateHeadAmountSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("fee_heads")
    .update({ default_amount: parsed.default_amount })
    .eq("id", parsed.id)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/fees/heads`);
  return ok(undefined, "আপডেট হয়েছে।");
}

// -----------------------------------------------------------------
// Fee structures (per class per head per frequency)
// -----------------------------------------------------------------

const structureSchema = z.object({
  schoolSlug: z.string().min(1),
  class_id: z.string().uuid(),
  fee_head_id: z.string().uuid(),
  amount: z.coerce.number().min(0),
  frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]),
});

export async function upsertFeeStructureAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(structureSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // Check for existing structure row for the class+head combo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("fee_structures")
    .select("id")
    .eq("school_id", auth.active.school_id)
    .eq("class_id", parsed.class_id)
    .eq("fee_head_id", parsed.fee_head_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = existing
    ? await (supabase as any)
        .from("fee_structures")
        .update({ amount: parsed.amount, frequency: parsed.frequency })
        .eq("id", existing.id)
    : await (supabase as any).from("fee_structures").insert({
        school_id: auth.active.school_id,
        class_id: parsed.class_id,
        fee_head_id: parsed.fee_head_id,
        amount: parsed.amount,
        frequency: parsed.frequency,
      });

  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/fees/structures`);
  return ok(undefined, "ফি কাঠামো আপডেট হয়েছে।");
}

// -----------------------------------------------------------------
// Invoice generation (batch per month)
// -----------------------------------------------------------------

type GenerateResult = { invoices_created: number; invoices_skipped: number; students_processed: number; errors: string[] };

function makeInvoiceNo(schoolCode: string, month: number, year: number): string {
  const seq = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${schoolCode}-${year}${String(month).padStart(2, "0")}-${seq}`;
}

export async function generateMonthlyInvoicesAction(
  schoolSlug: string,
  input: { month: number; year: number; class_id?: string | null; due_date?: string },
): Promise<ActionResult<GenerateResult>> {
  const auth = await authorizeAction({
    schoolSlug,
    action: "create",
    resource: "fee",
  });
  if ("error" in auth) return auth.error as ActionResult<GenerateResult>;

  const { month, year, class_id, due_date } = input;
  if (!month || month < 1 || month > 12 || !year) {
    return fail<GenerateResult>("সঠিক মাস ও বছর দিন।");
  }

  const supabase = await supabaseServer();

  // Load eligible students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentQuery = (supabase as any)
    .from("students")
    .select("id, name_bn, section_id, sections!inner(class_id)")
    .eq("school_id", auth.active.school_id)
    .eq("status", "active");

  if (class_id) studentQuery = studentQuery.eq("sections.class_id", class_id);

  const { data: students } = await studentQuery;
  const studentList = (students ?? []) as Array<{ id: string; name_bn: string; section_id: string | null; sections: { class_id: string } | null }>;

  // Load structures (filtered if class_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let structureQuery = (supabase as any)
    .from("fee_structures")
    .select("id, class_id, fee_head_id, amount, frequency, fee_heads!inner(name_bn)")
    .eq("school_id", auth.active.school_id);

  if (class_id) structureQuery = structureQuery.eq("class_id", class_id);

  const { data: structures } = await structureQuery;
  const structureList = (structures ?? []) as Array<{ id: string; class_id: string; fee_head_id: string; amount: number; frequency: string; fee_heads: { name_bn: string } }>;

  // Group structures by class
  const byClass = new Map<string, typeof structureList>();
  for (const s of structureList) {
    const arr = byClass.get(s.class_id) ?? [];
    arr.push(s);
    byClass.set(s.class_id, arr);
  }

  // Load schools for code prefix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (supabase as any)
    .from("schools")
    .select("slug, eiin")
    .eq("id", auth.active.school_id)
    .single();
  const schoolCode = (school?.eiin ?? school?.slug ?? "SCH").toString().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const s of studentList) {
    if (!s.sections) continue;
    const structures = byClass.get(s.sections.class_id);
    if (!structures || structures.length === 0) continue;

    // Filter structures by applicability for the given month (monthly/quarterly/annual pattern)
    const applicable = structures.filter((st) => {
      if (st.frequency === "monthly") return true;
      if (st.frequency === "quarterly") return [1, 4, 7, 10].includes(month);
      if (st.frequency === "annual") return month === 1;
      return false; // one_time — needs manual trigger
    });
    if (applicable.length === 0) continue;

    // Check for existing invoice
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("fee_invoices")
      .select("id")
      .eq("student_id", s.id)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();
    if (existing) { skipped++; continue; }

    const total = applicable.reduce((sum, a) => sum + Number(a.amount), 0);
    const invoiceNo = makeInvoiceNo(schoolCode, month, year);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inv, error } = await (supabase as any)
      .from("fee_invoices")
      .insert({
        school_id: auth.active.school_id,
        student_id: s.id,
        invoice_no: invoiceNo,
        month,
        year,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: due_date ?? null,
        total_amount: total,
        paid_amount: 0,
        status: "unpaid",
      })
      .select("id")
      .single();

    if (error || !inv) {
      errors.push(`${s.name_bn}: ${error?.message ?? "unknown"}`);
      continue;
    }

    const items = applicable.map((a) => ({
      invoice_id: inv.id,
      fee_head_id: a.fee_head_id,
      amount: a.amount,
      waiver: 0,
      description: a.fee_heads.name_bn,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("fee_invoice_items").insert(items);

    // Ledger entry (debit = invoice total)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_ledger_entries").insert({
      school_id: auth.active.school_id,
      student_id: s.id,
      date: new Date().toISOString().slice(0, 10),
      ref_type: "invoice",
      ref_id: inv.id,
      debit: total,
      credit: 0,
      note: `${invoiceNo} · ${month}/${year}`,
    });

    created++;
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "bulk_create",
    resourceType: "fee_invoice",
    meta: { month, year, created, skipped, total: studentList.length },
  });

  revalidatePath(`/school/${schoolSlug}/admin/fees/invoices`);
  return ok(
    { invoices_created: created, invoices_skipped: skipped, students_processed: studentList.length, errors: errors.slice(0, 20) },
    `${created} টি invoice তৈরি হয়েছে, ${skipped} টি আগে থেকে ছিল।`,
  );
}

// -----------------------------------------------------------------
// Record cash payment
// -----------------------------------------------------------------

const cashPaymentSchema = z.object({
  schoolSlug: z.string().min(1),
  invoice_id: z.string().uuid(),
  amount: z.coerce.number().min(0.01),
  method: z.enum(["cash", "bkash", "nagad", "rocket", "upay", "card", "bank_transfer", "cheque", "other"]).default("cash"),
  transaction_id: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function recordCashPaymentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(cashPaymentSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "fee",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoice } = await (supabase as any)
    .from("fee_invoices")
    .select("id, student_id, total_amount, paid_amount, due_amount, status, invoice_no, school_id")
    .eq("id", parsed.invoice_id)
    .eq("school_id", auth.active.school_id)
    .single();
  if (!invoice) return fail("ইনভয়েস পাওয়া যায়নি।");

  const receiptNo = `RCPT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: payErr } = await (supabase as any).from("payments").insert({
    school_id: auth.active.school_id,
    invoice_id: invoice.id,
    student_id: invoice.student_id,
    amount: parsed.amount,
    method: parsed.method,
    transaction_id: parsed.transaction_id ?? null,
    paid_at: new Date().toISOString(),
    received_by: auth.active.school_user_id,
    status: "completed",
    receipt_no: receiptNo,
    notes: parsed.notes ?? null,
  });
  if (payErr) return fail(payErr.message);

  const newPaid = Number(invoice.paid_amount) + parsed.amount;
  const newStatus = newPaid >= Number(invoice.total_amount) ? "paid" : newPaid > 0 ? "partial" : "unpaid";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("fee_invoices")
    .update({ paid_amount: newPaid, status: newStatus })
    .eq("id", invoice.id);

  // Ledger: credit entry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("student_ledger_entries").insert({
    school_id: auth.active.school_id,
    student_id: invoice.student_id,
    date: new Date().toISOString().slice(0, 10),
    ref_type: "payment",
    ref_id: invoice.id,
    debit: 0,
    credit: parsed.amount,
    note: `${parsed.method} · ${receiptNo}`,
  });

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "payment",
    resourceId: invoice.id,
    meta: { amount: parsed.amount, method: parsed.method, receipt: receiptNo },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/fees/invoices`);
  revalidatePath(`/school/${parsed.schoolSlug}/admin/fees/invoices/${invoice.id}`);
  return ok({ receiptNo }, `পেমেন্ট সংরক্ষিত (${receiptNo})`);
}
