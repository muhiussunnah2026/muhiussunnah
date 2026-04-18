/**
 * SSLCommerz integration.
 *
 * Primary Bangladesh payment gateway — one integration covers cards
 * (VISA/MC), bKash, Nagad, Rocket, Upay, DBBL Nexus, bank transfers.
 *
 * Flow:
 *   1. Server initiates a session with store_id + store_password + amount
 *   2. User redirects to GatewayPageURL
 *   3. On success, gateway POSTs back to success_url with val_id
 *   4. We validate the transaction via validator API
 *
 * Docs: https://developer.sslcommerz.com
 */

import "server-only";
import { env } from "@/lib/config/env";

type InitInput = {
  amount: number;
  tran_id: string;                 // our unique tracking id
  customer: { name: string; email?: string; phone?: string; address?: string };
  product: { name: string; category: "education" };
};

type InitResponse =
  | { status: "SUCCESS"; GatewayPageURL: string; sessionkey: string }
  | { status: "FAILED"; failedreason: string };

function baseUrl(): string {
  return env.SSLCOMMERZ_SANDBOX
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";
}

export function isSslCommerzConfigured(): boolean {
  return Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD);
}

export async function initiateSslCommerzPayment(input: InitInput): Promise<
  | { ok: true; redirectUrl: string; sessionKey: string }
  | { ok: false; error: string }
> {
  if (!isSslCommerzConfigured()) {
    return { ok: false, error: "SSLCommerz credentials missing." };
  }

  const body = new URLSearchParams({
    store_id: env.SSLCOMMERZ_STORE_ID ?? "",
    store_passwd: env.SSLCOMMERZ_STORE_PASSWORD ?? "",
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: input.tran_id,
    product_category: input.product.category,
    product_name: input.product.name,
    product_profile: "non-physical-goods",
    cus_name: input.customer.name,
    cus_email: input.customer.email ?? "noreply@shikkha.app",
    cus_phone: input.customer.phone ?? "N/A",
    cus_add1: input.customer.address ?? "N/A",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: "1",
    success_url: env.SSLCOMMERZ_SUCCESS_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`,
    fail_url: env.SSLCOMMERZ_FAIL_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail`,
    cancel_url: env.SSLCOMMERZ_CANCEL_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/cancel`,
    ipn_url: env.SSLCOMMERZ_IPN_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/ipn`,
  });

  const res = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, error: `Gateway error ${res.status}` };

  const data = (await res.json()) as InitResponse;
  if (data.status !== "SUCCESS") {
    return { ok: false, error: data.status === "FAILED" ? data.failedreason : "Unknown gateway error" };
  }
  return { ok: true, redirectUrl: data.GatewayPageURL, sessionKey: data.sessionkey };
}

/**
 * Validate a transaction after gateway callback. SSLCommerz requires us
 * to hit their validator with val_id + store credentials to confirm.
 */
export async function validateSslCommerzTransaction(valId: string): Promise<
  | { ok: true; amount: number; currency: string; tranId: string; cardType?: string; bankTranId?: string }
  | { ok: false; error: string }
> {
  if (!isSslCommerzConfigured()) return { ok: false, error: "SSLCommerz not configured" };

  const url = new URL(`${baseUrl()}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", env.SSLCOMMERZ_STORE_ID ?? "");
  url.searchParams.set("store_passwd", env.SSLCOMMERZ_STORE_PASSWORD ?? "");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { ok: false, error: `Validator HTTP ${res.status}` };

  const data = (await res.json()) as {
    status: string;
    amount?: string;
    currency?: string;
    tran_id?: string;
    card_type?: string;
    bank_tran_id?: string;
    error?: string;
  };

  if (data.status !== "VALID" && data.status !== "VALIDATED") {
    return { ok: false, error: data.error ?? `Status: ${data.status}` };
  }

  return {
    ok: true,
    amount: Number(data.amount ?? 0),
    currency: data.currency ?? "BDT",
    tranId: data.tran_id ?? "",
    cardType: data.card_type,
    bankTranId: data.bank_tran_id,
  };
}
