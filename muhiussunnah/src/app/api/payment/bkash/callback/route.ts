/**
 * bKash callback — after the user completes/cancels on bKash we land here.
 * We must call Execute to finalize the transaction.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { executeBkashPayment } from "@/lib/payments/bkash";
import { env } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentID = url.searchParams.get("paymentID") ?? "";
  const status = url.searchParams.get("status") ?? "";

  if (!paymentID) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/fail?code=no_payment_id`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: payment } = await admin
    .from("payments")
    .select("id, invoice_id, student_id, school_id, amount, transaction_id, status")
    .eq("gateway_ref", paymentID)
    .maybeSingle();

  if (!payment) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/fail?code=payment_not_found`);
  }

  if (status === "cancel") {
    await admin.from("payments").update({ status: "canceled" }).eq("id", payment.id);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/cancel?tran=${payment.transaction_id}`);
  }
  if (status === "failure") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/fail?tran=${payment.transaction_id}`);
  }

  // status === 'success' → finalize
  const exec = await executeBkashPayment(paymentID);
  if (!exec.ok) {
    await admin.from("payments").update({ status: "failed", notes: exec.error }).eq("id", payment.id);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/fail?code=execute_failed`);
  }

  await admin
    .from("payments")
    .update({
      status: "completed",
      paid_at: new Date().toISOString(),
      transaction_id: exec.trxID,
      gateway_raw: { paymentID, trxID: exec.trxID, amount: exec.amount },
    })
    .eq("id", payment.id);

  const { data: invoice } = await admin
    .from("fee_invoices")
    .select("id, total_amount, paid_amount")
    .eq("id", payment.invoice_id)
    .single();
  if (invoice) {
    const newPaid = Number(invoice.paid_amount) + Number(payment.amount);
    const newStatus = newPaid >= Number(invoice.total_amount) ? "paid" : "partial";
    await admin.from("fee_invoices").update({ paid_amount: newPaid, status: newStatus }).eq("id", invoice.id);
    await admin.from("student_ledger_entries").insert({
      school_id: payment.school_id,
      student_id: payment.student_id,
      date: new Date().toISOString().slice(0, 10),
      ref_type: "payment",
      ref_id: invoice.id,
      debit: 0,
      credit: payment.amount,
      note: `bKash · ${exec.trxID}`,
    });
  }

  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/portal/fees/pay/success?tran=${exec.trxID}`);
}
