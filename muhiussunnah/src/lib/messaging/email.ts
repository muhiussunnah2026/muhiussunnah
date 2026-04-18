/**
 * Resend wrapper for transactional email.
 *
 * We avoid the `resend` npm SDK — Resend's REST API is simple enough
 * that a plain fetch keeps the bundle smaller and matches the "no
 * unnecessary deps" posture.
 *
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

import "server-only";
import { env } from "@/lib/config/env";

export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

type EmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) return { ok: false, error: "Resend not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo ?? env.RESEND_REPLY_TO,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    if (!data.id) return { ok: false, error: "No id returned" };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
