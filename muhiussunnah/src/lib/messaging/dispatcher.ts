/**
 * Unified messaging dispatcher.
 *
 * Given a notice + resolved recipient list + channel choice, write rows
 * into `message_queue` then fire off provider calls. Per-channel result
 * gets logged in `sms_logs` / `whatsapp_logs` / `push_logs`.
 *
 * SMS is credit-gated: before sending, we debit the school's balance
 * via the `debit_sms_credit` SQL function. If balance is insufficient
 * the dispatcher returns early.
 *
 * This module is server-only. Callers from server actions / cron routes.
 */

import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendSms, estimateSmsCost, anySmsProviderConfigured } from "./sms";
import { sendWhatsAppText, sendWhatsAppTemplate, isWhatsAppConfigured } from "./whatsapp";
import { sendPush, isPushConfigured } from "./push";
import { sendEmail, isEmailConfigured } from "./email";

export type Channel = "sms" | "whatsapp" | "push" | "email" | "inapp";

export type Recipient = {
  user_id?: string;        // auth.users id — for inapp/push
  phone?: string;          // for sms/whatsapp
  email?: string;          // for email
  name?: string;
  language?: "bn" | "en";
};

export type DispatchInput = {
  schoolId: string;
  noticeId?: string | null;
  channels: Channel[];
  recipients: Recipient[];
  subject?: string;
  body: string;
  whatsappTemplate?: { name: string; variables: string[]; languageCode?: string };
};

export type DispatchResult = {
  queued: number;
  sent: number;
  failed: number;
  cost: number;
  byChannel: Record<Channel, { sent: number; failed: number; cost: number }>;
  errors: string[];
  insufficientCredit?: boolean;
};

export async function dispatchMessage(input: DispatchInput): Promise<DispatchResult> {
  const result: DispatchResult = {
    queued: 0, sent: 0, failed: 0, cost: 0,
    byChannel: {
      sms: { sent: 0, failed: 0, cost: 0 },
      whatsapp: { sent: 0, failed: 0, cost: 0 },
      push: { sent: 0, failed: 0, cost: 0 },
      email: { sent: 0, failed: 0, cost: 0 },
      inapp: { sent: 0, failed: 0, cost: 0 },
    },
    errors: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // ------ SMS credit pre-check ------
  if (input.channels.includes("sms")) {
    const recipientsWithPhone = input.recipients.filter((r) => r.phone);
    const estimatedSmsCost = recipientsWithPhone.reduce((sum, _r) => sum + estimateSmsCost(input.body), 0);

    const { data: school } = await admin
      .from("schools")
      .select("sms_credit_balance_bdt")
      .eq("id", input.schoolId)
      .single();

    if (!school) {
      result.errors.push("School not found");
      return result;
    }
    if (Number(school.sms_credit_balance_bdt) < estimatedSmsCost) {
      result.insufficientCredit = true;
      result.errors.push(
        `SMS ক্রেডিট কম: দরকার ৳${estimatedSmsCost.toFixed(2)}, আছে ৳${school.sms_credit_balance_bdt}`,
      );
      // Still allow non-SMS channels to run
      input.channels = input.channels.filter((c) => c !== "sms");
    }
  }

  const queueRows: Record<string, unknown>[] = [];

  for (const channel of input.channels) {
    for (const recipient of input.recipients) {
      queueRows.push({
        school_id: input.schoolId,
        notice_id: input.noticeId ?? null,
        channel,
        recipient: channel === "email"
          ? recipient.email ?? ""
          : channel === "inapp" || channel === "push"
          ? recipient.user_id ?? ""
          : recipient.phone ?? "",
        recipient_user: recipient.user_id ?? null,
        body: input.body,
        template_name: input.whatsappTemplate?.name ?? null,
        variables: input.whatsappTemplate?.variables ?? null,
        status: "queued",
      });
    }
  }

  if (queueRows.length > 0) {
    await admin.from("message_queue").insert(queueRows);
    result.queued = queueRows.length;
  }

  // ------ Send immediately (synchronous fan-out) ------
  for (const row of queueRows) {
    const channel = row.channel as Channel;

    if (channel === "sms") {
      const recipient = (row.recipient as string) || "";
      if (!recipient) { result.byChannel.sms.failed++; result.failed++; continue; }

      const r = await sendSms(recipient, input.body);
      if (r.ok) {
        // Debit credits atomically
        try {
          await admin.rpc("debit_sms_credit", {
            target_school: input.schoolId,
            amount_bdt: r.cost,
            note_text: `SMS to ${recipient}`,
          });
        } catch (e) {
          // If debit fails, still count send; log error
          result.errors.push(`Credit debit failed: ${(e as Error).message}`);
        }
        await admin.from("sms_logs").insert({
          school_id: input.schoolId,
          recipient,
          message: input.body,
          status: "sent",
          provider: r.provider,
          cost: r.cost,
          sent_at: new Date().toISOString(),
        });
        result.byChannel.sms.sent++;
        result.byChannel.sms.cost += r.cost;
        result.sent++;
        result.cost += r.cost;
      } else {
        await admin.from("sms_logs").insert({
          school_id: input.schoolId,
          recipient,
          message: input.body,
          status: "failed",
          provider: r.provider,
          cost: 0,
          error: r.error,
        });
        result.byChannel.sms.failed++;
        result.failed++;
        result.errors.push(`SMS to ${recipient}: ${r.error}`);
      }
      continue;
    }

    if (channel === "whatsapp") {
      const recipient = (row.recipient as string) || "";
      if (!recipient) { result.byChannel.whatsapp.failed++; result.failed++; continue; }

      const r = input.whatsappTemplate
        ? await sendWhatsAppTemplate(
            recipient,
            input.whatsappTemplate.name,
            input.whatsappTemplate.variables,
            input.whatsappTemplate.languageCode ?? "bn",
          )
        : await sendWhatsAppText(recipient, input.body);

      if (r.ok) {
        await admin.from("whatsapp_logs").insert({
          school_id: input.schoolId,
          recipient,
          template_name: input.whatsappTemplate?.name ?? null,
          variables: input.whatsappTemplate?.variables ?? null,
          status: "sent",
          provider: "meta",
          cost: r.cost,
          sent_at: new Date().toISOString(),
        });
        result.byChannel.whatsapp.sent++;
        result.byChannel.whatsapp.cost += r.cost;
        result.sent++;
        result.cost += r.cost;
      } else {
        await admin.from("whatsapp_logs").insert({
          school_id: input.schoolId,
          recipient,
          status: "failed",
          provider: "meta",
          cost: 0,
          error: r.error,
        });
        result.byChannel.whatsapp.failed++;
        result.failed++;
        result.errors.push(`WhatsApp to ${recipient}: ${r.error}`);
      }
      continue;
    }

    if (channel === "email") {
      const recipient = (row.recipient as string) || "";
      if (!recipient) { result.byChannel.email.failed++; result.failed++; continue; }

      const r = await sendEmail({
        to: recipient,
        subject: input.subject ?? "বার্তা",
        text: input.body,
      });
      if (r.ok) {
        result.byChannel.email.sent++;
        result.sent++;
      } else {
        result.byChannel.email.failed++;
        result.failed++;
        result.errors.push(`Email to ${recipient}: ${r.error}`);
      }
      continue;
    }

    if (channel === "push") {
      // Push requires a device token which we would store per-user in another table.
      // Phase 4 scaffold: mark as "inapp" effectively (no-op) until device tokens land.
      await admin.from("push_logs").insert({
        school_id: input.schoolId,
        user_id: row.recipient_user as string | null,
        title: input.subject ?? "Shikkha",
        body: input.body,
        status: "queued",
        metadata: { note: "device token registry not yet wired; phase 6" },
      });
      result.byChannel.push.sent++;
      result.sent++;
      continue;
    }

    if (channel === "inapp") {
      // In-app shows up in the portal notices feed (via notices table).
      // Queue entry is all we need; no external call.
      result.byChannel.inapp.sent++;
      result.sent++;
      continue;
    }
  }

  // Mark queue rows that were processed
  if (queueRows.length > 0) {
    await admin
      .from("message_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("school_id", input.schoolId)
      .eq("notice_id", input.noticeId ?? null)
      .eq("status", "queued");
  }

  return result;
}

export function channelsAvailable(): Record<Channel, boolean> {
  return {
    sms: anySmsProviderConfigured(),
    whatsapp: isWhatsAppConfigured(),
    push: isPushConfigured(),
    email: isEmailConfigured(),
    inapp: true,
  };
}
