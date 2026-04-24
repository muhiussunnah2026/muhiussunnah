"use server";

/**
 * Public contact-form submission.
 *
 * Public in the sense that the caller is unauthenticated — the
 * marketing /contact page uses this. We write through the admin client
 * (service role) to bypass RLS for the insert, then try to send an
 * email notification to the platform owner if Resend is configured.
 */

import { z } from "zod";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, isEmailConfigured } from "@/lib/messaging/email";

const PLATFORM_OWNER_EMAIL = "muhiussunnah2026@gmail.com";

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে।").max(200),
  school: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email("ইমেইল ঠিক নয়।"),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  subject: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().min(5, "বার্তা অন্তত ৫ অক্ষর হতে হবে।").max(5000),
});

export async function submitContactAction(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    school: formData.get("school"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "ফর্মে ত্রুটি আছে।";
    return { ok: false, error: firstIssue };
  }

  const data = parsed.data;

  // Light-touch request metadata for abuse forensics.
  const h = await headers();
  const userAgent = h.get("user-agent") ?? null;
  const forwardedFor = h.get("x-forwarded-for") ?? "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { error: dbError } = await admin.from("contact_messages").insert({
    name: data.name,
    school: data.school ?? null,
    email: data.email,
    phone: data.phone ?? null,
    subject: data.subject ?? null,
    message: data.message,
    user_agent: userAgent,
    ip_address: ipAddress,
  });
  if (dbError) {
    return { ok: false, error: "বার্তা সংরক্ষণে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।" };
  }

  // Try to notify the platform owner by email. If Resend isn't
  // configured the insert still succeeded so we return ok either way —
  // the super admin can always see the entry on /super-admin/messages.
  if (isEmailConfigured()) {
    const html = `
<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#7c5cff;margin:0 0 16px;">নতুন যোগাযোগ অনুরোধ · Muhius Sunnah</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#666;width:130px;">নাম</td><td style="padding:8px 0;"><strong>${escapeHtml(data.name)}</strong></td></tr>
    ${data.school ? `<tr><td style="padding:8px 0;color:#666;">প্রতিষ্ঠান</td><td style="padding:8px 0;">${escapeHtml(data.school)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;color:#666;">ইমেইল</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    ${data.phone ? `<tr><td style="padding:8px 0;color:#666;">মোবাইল</td><td style="padding:8px 0;"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>` : ""}
    ${data.subject ? `<tr><td style="padding:8px 0;color:#666;">বিষয়</td><td style="padding:8px 0;">${escapeHtml(data.subject)}</td></tr>` : ""}
  </table>
  <div style="margin-top:20px;padding:16px;background:#f5f7ff;border-left:4px solid #7c5cff;border-radius:6px;">
    <div style="color:#666;font-size:13px;margin-bottom:6px;">বার্তা</div>
    <div style="white-space:pre-wrap;">${escapeHtml(data.message)}</div>
  </div>
  <p style="margin-top:20px;color:#666;font-size:13px;">
    সুপার অ্যাডমিন প্যানেলে সব বার্তা দেখুন:
    <a href="https://muhiussunnah.app/super-admin/messages">muhiussunnah.app/super-admin/messages</a>
  </p>
</div>`.trim();

    await sendEmail({
      to: PLATFORM_OWNER_EMAIL,
      subject: `যোগাযোগ: ${data.name}${data.school ? " · " + data.school : ""}`,
      html,
      replyTo: data.email,
    });
  }

  return {
    ok: true,
    message: "আপনার বার্তা আমাদের কাছে পৌঁছেছে। ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
