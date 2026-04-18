/**
 * SSLCommerz IPN (server-to-server confirmation).
 *
 * Fired independently of the user's browser — so even if the user
 * closes the tab after paying, we still reconcile.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSslCommerzTransaction } from "@/lib/payments/sslcommerz";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = Object.fromEntries(new URLSearchParams(await request.text()));
  const tranId = body.tran_id;
  const valId = body.val_id;

  if (!tranId || !valId) return NextResponse.json({ ok: false }, { status: 400 });

  const validation = await validateSslCommerzTransaction(valId);
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data: payment } = await admin
    .from("payments")
    .select("id, invoice_id, student_id, school_id, amount, status")
    .eq("transaction_id", tranId)
    .maybeSingle();
  if (!payment) return NextResponse.json({ ok: false }, { status: 404 });
  if (payment.status === "completed") return NextResponse.json({ ok: true, note: "already_processed" });

  await admin
    .from("payments")
    .update({ status: "completed", paid_at: new Date().toISOString(), gateway_ref: valId, gateway_raw: body })
    .eq("id", payment.id);

  const { data: invoice } = await admin.from("fee_invoices").select("id, total_amount, paid_amount").eq("id", payment.invoice_id).single();
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
      note: `IPN · ${valId}`,
    });
  }

  return NextResponse.json({ ok: true });
}
