"use server";

/**
 * Online payment initiation — called from the parent portal when they
 * click "Pay now" on an invoice. Supports SSLCommerz + bKash direct.
 *
 * Flow:
 *   1. Parent clicks "Pay" → we generate tran_id = invoice_id + timestamp
 *   2. Call SSLCommerz / bKash init → get redirect URL
 *   3. Return URL to client → client window.location = url
 *   4. User completes on gateway → redirected to our callback route
 *   5. Callback creates a payments row + updates invoice
 */

import { randomUUID } from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMembershipForAction, type ActionResult, ok, fail } from "./_helpers";
import { initiateSslCommerzPayment, isSslCommerzConfigured } from "@/lib/payments/sslcommerz";
import { createBkashPayment, isBkashConfigured } from "@/lib/payments/bkash";

export type GatewayChoice = "sslcommerz" | "bkash" | "nagad";

export async function initiateOnlinePaymentAction(input: {
  schoolSlug: string;
  invoiceId: string;
  gateway: GatewayChoice;
}): Promise<ActionResult<{ redirectUrl: string; tranId: string }>> {
  const auth = await requireMembershipForAction(input.schoolSlug);
  if ("error" in auth) return auth.error as ActionResult<{ redirectUrl: string; tranId: string }>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoice } = await (supabase as any)
    .from("fee_invoices")
    .select(`
      id, invoice_no, student_id, total_amount, paid_amount, due_amount, status,
      students ( name_bn, guardian_phone, student_guardians ( phone, name_bn ) )
    `)
    .eq("id", input.invoiceId)
    .eq("school_id", auth.active.school_id)
    .single();

  if (!invoice) return fail("ইনভয়েস পাওয়া যায়নি।");
  if (invoice.status === "paid") return fail("এই ইনভয়েস ইতিমধ্যে পরিশোধিত।");

  const amount = Number(invoice.due_amount);
  if (amount <= 0) return fail("কোন বকেয়া নেই।");

  const tranId = `${invoice.id.slice(0, 8)}-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`;

  const student = invoice.students as {
    name_bn: string;
    guardian_phone: string | null;
    student_guardians: { phone: string | null; name_bn: string }[];
  };
  const primaryGuardian = student.student_guardians?.[0];

  // Record a pending payment row so the callback can find it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("payments").insert({
    school_id: auth.active.school_id,
    invoice_id: invoice.id,
    student_id: invoice.student_id,
    amount,
    method: input.gateway,
    transaction_id: tranId,
    status: "pending",
    receipt_no: `PAY-${tranId.slice(0, 18).toUpperCase()}`,
    notes: "Initiated via online gateway",
  });

  if (input.gateway === "sslcommerz") {
    if (!isSslCommerzConfigured()) return fail("SSLCommerz এখনও কনফিগার হয়নি। ক্যাশ পেমেন্ট করুন।");
    const init = await initiateSslCommerzPayment({
      amount,
      tran_id: tranId,
      customer: {
        name: primaryGuardian?.name_bn ?? student.name_bn,
        phone: primaryGuardian?.phone ?? student.guardian_phone ?? "01700000000",
      },
      product: { name: `Fee ${invoice.invoice_no}`, category: "education" },
    });
    if (!init.ok) return fail(init.error);
    return ok({ redirectUrl: init.redirectUrl, tranId }, "গেটওয়েতে যাচ্ছেন...");
  }

  if (input.gateway === "bkash") {
    if (!isBkashConfigured()) return fail("bKash এখনও কনফিগার হয়নি। SSLCommerz ব্যবহার করুন।");
    const init = await createBkashPayment({
      amount,
      invoiceNumber: invoice.invoice_no,
      payerReference: primaryGuardian?.phone ?? student.guardian_phone ?? "01700000000",
    });
    if (!init.ok) return fail(init.error);
    // Stash the bKash paymentID on the pending payment row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("payments")
      .update({ gateway_ref: init.paymentID })
      .eq("transaction_id", tranId);
    return ok({ redirectUrl: init.redirectUrl, tranId }, "bKash-এ যাচ্ছেন...");
  }

  return fail("এই গেটওয়ে এখনও যুক্ত হয়নি।");
}
