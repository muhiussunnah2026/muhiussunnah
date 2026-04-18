/**
 * SMS providers for Bangladesh.
 *
 *   1. SSL Wireless — primary (corporate KYC required, 3-5 day setup)
 *   2. Alpha SMS — fallback (faster signup, same pricing)
 *   3. BulkSMSBD — secondary fallback
 *
 * Bangla Unicode messages cost ~৳0.40/SMS; English ~৳0.25/SMS per
 * Bangladeshi carriers. We default sender-id + cost from env.
 */

import "server-only";
import { env } from "@/lib/config/env";

type SmsResult =
  | { ok: true; providerRef: string; provider: string; cost: number }
  | { ok: false; error: string; provider: string };

/** Detect if text contains Bangla chars — affects pricing. */
export function isBanglaText(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

export function estimateSmsCost(text: string, recipients: number = 1): number {
  const perMsg = isBanglaText(text) ? 0.4 : 0.25;
  // Each 160-char (English) or 70-char (Bangla) chunk counts as one SMS
  const chunkSize = isBanglaText(text) ? 70 : 160;
  const parts = Math.max(1, Math.ceil(text.length / chunkSize));
  return +(perMsg * parts * recipients).toFixed(2);
}

// -----------------------------------------------------------------
// SSL Wireless
// -----------------------------------------------------------------

export function isSslWirelessConfigured(): boolean {
  return Boolean(env.SSL_SMS_API_TOKEN && env.SSL_SMS_SID && env.SSL_SMS_SENDER_ID);
}

export async function sendSslWirelessSms(recipient: string, message: string): Promise<SmsResult> {
  if (!isSslWirelessConfigured()) {
    return { ok: false, error: "SSL Wireless not configured", provider: "ssl_wireless" };
  }
  try {
    const body = {
      api_token: env.SSL_SMS_API_TOKEN,
      sid: env.SSL_SMS_SID,
      msisdn: recipient,
      sms: message,
      csms_id: `shikkha-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    const res = await fetch(env.SSL_SMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, provider: "ssl_wireless" };
    const data = (await res.json()) as { status?: string; status_code?: number; smsinfo?: unknown; error_message?: string };
    if (data.status === "SUCCESS") {
      return { ok: true, providerRef: body.csms_id, provider: "ssl_wireless", cost: estimateSmsCost(message) };
    }
    return { ok: false, error: data.error_message ?? `Status ${data.status}`, provider: "ssl_wireless" };
  } catch (e) {
    return { ok: false, error: (e as Error).message, provider: "ssl_wireless" };
  }
}

// -----------------------------------------------------------------
// Alpha SMS (fallback)
// -----------------------------------------------------------------

export function isAlphaSmsConfigured(): boolean {
  return Boolean(env.ALPHA_SMS_API_KEY && env.ALPHA_SMS_SENDER_ID);
}

export async function sendAlphaSms(recipient: string, message: string): Promise<SmsResult> {
  if (!isAlphaSmsConfigured()) {
    return { ok: false, error: "Alpha SMS not configured", provider: "alpha_sms" };
  }
  try {
    const body = {
      api_key: env.ALPHA_SMS_API_KEY,
      msg: message,
      to: recipient,
      sender_id: env.ALPHA_SMS_SENDER_ID,
    };
    const res = await fetch(env.ALPHA_SMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, provider: "alpha_sms" };
    const data = (await res.json()) as { error?: number; msg?: string; data?: { request_id?: string } };
    if (data.error === 0) {
      return { ok: true, providerRef: data.data?.request_id ?? "alpha-ok", provider: "alpha_sms", cost: estimateSmsCost(message) };
    }
    return { ok: false, error: data.msg ?? `Error ${data.error}`, provider: "alpha_sms" };
  } catch (e) {
    return { ok: false, error: (e as Error).message, provider: "alpha_sms" };
  }
}

// -----------------------------------------------------------------
// Unified send with fallback
// -----------------------------------------------------------------

export async function sendSms(recipient: string, message: string): Promise<SmsResult> {
  // Normalize Bangladesh phone numbers: ensure starts with 88
  const normalized = recipient.replace(/\D/g, "").replace(/^01/, "8801");

  if (isSslWirelessConfigured()) {
    const r = await sendSslWirelessSms(normalized, message);
    if (r.ok) return r;
    if (isAlphaSmsConfigured()) return sendAlphaSms(normalized, message);
    return r;
  }
  if (isAlphaSmsConfigured()) return sendAlphaSms(normalized, message);
  return { ok: false, error: "কোন SMS provider কনফিগার করা নেই", provider: "none" };
}

export function anySmsProviderConfigured(): boolean {
  return isSslWirelessConfigured() || isAlphaSmsConfigured();
}
