/**
 * WhatsApp Business Cloud API (Meta).
 *
 * Must use pre-approved templates for outbound marketing/utility messages.
 * Free-form messages only allowed within 24h of an inbound message.
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import "server-only";
import { env } from "@/lib/config/env";

export function isWhatsAppConfigured(): boolean {
  return Boolean(env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN);
}

type WhatsAppResult =
  | { ok: true; messageId: string; cost: number }
  | { ok: false; error: string };

export async function sendWhatsAppTemplate(
  recipient: string,
  templateName: string,
  variables: string[] = [],
  languageCode: string = "bn",
): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured()) return { ok: false, error: "WhatsApp not configured" };

  const normalized = recipient.replace(/\D/g, "").replace(/^01/, "8801");

  try {
    const body = {
      messaging_product: "whatsapp",
      to: normalized,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: variables.length > 0 ? [{
          type: "body",
          parameters: variables.map((v) => ({ type: "text", text: v })),
        }] : [],
      },
    };

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
    }
    const data = (await res.json()) as { messages?: { id: string }[] };
    const messageId = data.messages?.[0]?.id;
    if (!messageId) return { ok: false, error: "No message id returned" };
    return { ok: true, messageId, cost: 0.5 };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function sendWhatsAppText(
  recipient: string,
  body: string,
): Promise<WhatsAppResult> {
  if (!isWhatsAppConfigured()) return { ok: false, error: "WhatsApp not configured" };

  const normalized = recipient.replace(/\D/g, "").replace(/^01/, "8801");

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalized,
          type: "text",
          text: { body },
        }),
        cache: "no-store",
      },
    );

    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { messages?: { id: string }[] };
    const messageId = data.messages?.[0]?.id;
    if (!messageId) return { ok: false, error: "No message id returned" };
    return { ok: true, messageId, cost: 0.3 };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
