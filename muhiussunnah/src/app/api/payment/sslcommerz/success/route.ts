/**
 * SSLCommerz success callback.
 *
 * Gateway POSTs form-url-encoded data here after a successful payment.
 * We validate via the validator API (to prevent tampering) then update
 * the pending payment + invoice + ledger.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSslCommerzTransaction } from "@/lib/payments/sslcommerz";
import { env } from "@/lib/config/env";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let body: Record<string, string> = {};
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await request.json().catch(() => ({}));
  }

  const tranId = body.tran_id ?? body.transactionId;
  const valId = body.val_id;
  if (!tranId || !valId) {
    return redirectWithError("invalid_callback");
  }

  const validation = await validateSslCommerzTransaction(valId);
  if (!validation.ok) {
    return redirectWithError(validation.error);
  }
  if (validation.tranId !== tranId) {
    return redirectWithError("tran_id_mismatch");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // Find the pending payment
  const { data: payment } = await admin
    .from("payments")
    .select("id, invoice_id, student_id, school_id, amount")
    .eq("transaction_id", tranId)
    .eq("status", "pending")
    .maybeSingle();

  if (!payment) return redirectWithError("payment_not_found");

  // Reject partial/overpayment mismatches
  if (Math.abs(Number(payment.amount) - validation.amount) > 0.01) {
    await admin
      .from("payments")
      .update({ status: "failed", notes: `Amount mismatch: ${validation.amount}` })
      .eq("id", payment.id);
    return redirectWithError("amount_mismatch");
  }

  await admin
    .from("payments")
    .update({
      status: "completed",
      paid_at: new Date().toISOString(),
      gateway_ref: valId,
      gateway_raw: body,
    })
    .eq("id", payment.id);

  // Update invoice
  const { data: invoice } = await admin
    .from("fee_invoices")
    .select("id, total_amount, paid_amount, invoice_no")
    .eq("id", payment.invoice_id)
    .single();

  if (invoice) {
    const newPaid = Number(invoice.paid_amount) + Number(payment.amount);
    const status = newPaid >= Number(invoice.total_amount) ? "paid" : "partial";
    await admin.from("fee_invoices").update({ paid_amount: newPaid, status }).eq("id", invoice.id);

    await admin.from("student_ledger_entries").insert({
      school_id: payment.school_id,
      student_id: payment.student_id,
      date: new Date().toISOString().slice(0, 10),
      ref_type: "payment",
      ref_id: invoice.id,
      debit: 0,
      credit: payment.amount,
      note: `SSLCommerz · ${validation.bankTranId ?? valId}`,
    });
  }

  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/success?tran=${tranId}`);
}

function redirectWithError(code: string) {
  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/fail?code=${encodeURIComponent(code)}`);
}

export async function POST(request: Request) { return handle(request); }
export async function GET(request: Request) { return handle(request); }
