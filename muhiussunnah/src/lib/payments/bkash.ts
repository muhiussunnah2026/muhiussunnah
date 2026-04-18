/**
 * bKash Tokenized Checkout (direct, lower fees than SSLCommerz).
 *
 * Flow:
 *   1. Grant access token (POST /checkout/token/grant)
 *   2. Create payment (POST /checkout/create) → returns bkashURL
 *   3. User redirects to bkashURL → completes on bKash
 *   4. bKash calls our callback URL with paymentID + status
 *   5. We call Execute to finalize (POST /checkout/execute/{paymentID})
 *
 * Docs: https://developer.bka.sh
 */

import "server-only";
import { env } from "@/lib/config/env";

type Token = { id_token: string; refresh_token: string; expires_in: number; expires_at: number };

let cachedToken: Token | null = null;

export function isBkashConfigured(): boolean {
  return Boolean(
    env.BKASH_APP_KEY && env.BKASH_APP_SECRET && env.BKASH_USERNAME && env.BKASH_PASSWORD,
  );
}

async function getToken(): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (!isBkashConfigured()) return { ok: false, error: "bKash credentials missing." };

  if (cachedToken && cachedToken.expires_at > Date.now() + 30_000) {
    return { ok: true, token: cachedToken.id_token };
  }

  const res = await fetch(`${env.BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: env.BKASH_USERNAME ?? "",
      password: env.BKASH_PASSWORD ?? "",
    },
    body: JSON.stringify({
      app_key: env.BKASH_APP_KEY ?? "",
      app_secret: env.BKASH_APP_SECRET ?? "",
    }),
    cache: "no-store",
  });

  if (!res.ok) return { ok: false, error: `Token HTTP ${res.status}` };
  const data = (await res.json()) as Partial<Token>;
  if (!data.id_token) return { ok: false, error: "No id_token returned" };

  cachedToken = {
    id_token: data.id_token,
    refresh_token: data.refresh_token ?? "",
    expires_in: data.expires_in ?? 3600,
    expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return { ok: true, token: cachedToken.id_token };
}

export async function createBkashPayment(input: {
  amount: number;
  invoiceNumber: string;
  payerReference: string;
}): Promise<
  | { ok: true; paymentID: string; redirectUrl: string }
  | { ok: false; error: string }
> {
  const t = await getToken();
  if (!t.ok) return t;

  const res = await fetch(`${env.BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: t.token,
      "x-app-key": env.BKASH_APP_KEY ?? "",
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: input.payerReference,
      callbackURL: env.BKASH_CALLBACK_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/payment/bkash/callback`,
      amount: input.amount.toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: input.invoiceNumber,
    }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, error: `Create HTTP ${res.status}` };

  const data = (await res.json()) as { paymentID?: string; bkashURL?: string; statusCode?: string; statusMessage?: string };
  if (!data.paymentID || !data.bkashURL) {
    return { ok: false, error: data.statusMessage ?? "bKash did not return a redirect URL" };
  }
  return { ok: true, paymentID: data.paymentID, redirectUrl: data.bkashURL };
}

export async function executeBkashPayment(paymentID: string): Promise<
  | { ok: true; trxID: string; amount: number; statusCode: string }
  | { ok: false; error: string }
> {
  const t = await getToken();
  if (!t.ok) return t;

  const res = await fetch(`${env.BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: t.token,
      "x-app-key": env.BKASH_APP_KEY ?? "",
    },
    body: JSON.stringify({ paymentID }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, error: `Execute HTTP ${res.status}` };

  const data = (await res.json()) as {
    statusCode?: string;
    statusMessage?: string;
    paymentID?: string;
    trxID?: string;
    amount?: string;
    transactionStatus?: string;
  };

  if (data.statusCode !== "0000" || data.transactionStatus !== "Completed") {
    return { ok: false, error: data.statusMessage ?? `Status ${data.statusCode}` };
  }

  return {
    ok: true,
    trxID: data.trxID ?? "",
    amount: Number(data.amount ?? 0),
    statusCode: data.statusCode,
  };
}
