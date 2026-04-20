"use server";

/**
 * Donation campaigns + receive flow (চাঁদা).
 * Critical for madrasas but useful for any school's building fund etc.
 */

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  type ActionResult,
  ok,
  fail,
  parseForm,
  authorizeAction,
  writeAuditLog,
} from "./_helpers";

const campaignSchema = z.object({
  schoolSlug: z.string().min(1),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
  target_amount: z.coerce.number().min(0).optional(),
  start_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  end_date: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export async function addCampaignAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(campaignSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "donation",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("donation_campaigns").insert({
    school_id: auth.active.school_id,
    title: parsed.title,
    description: parsed.description ?? null,
    target_amount: parsed.target_amount ?? null,
    start_date: parsed.start_date ?? null,
    end_date: parsed.end_date ?? null,
    status: "active",
  });
  if (error) return fail(error.message);

  revalidatePath(`/admin/donations`);
  return ok(undefined, "চাঁদা ক্যাম্পেইন যোগ হয়েছে।");
}

// -----------------------------------------------------------------
// Record a donation
// -----------------------------------------------------------------

const donationSchema = z.object({
  schoolSlug: z.string().min(1),
  campaign_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  donor_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  donor_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  donor_email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  donor_address: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  amount: z.coerce.number().min(0.01),
  method: z.enum(["cash", "bkash", "nagad", "rocket", "card", "bank_transfer", "cheque", "other"]).default("cash"),
  is_anonymous: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function addDonationAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(donationSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "donation",
  });
  if ("error" in auth) return auth.error;

  const receiptNo = `DON-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("donations").insert({
    school_id: auth.active.school_id,
    campaign_id: parsed.campaign_id ?? null,
    donor_name: parsed.is_anonymous ? null : parsed.donor_name ?? null,
    donor_phone: parsed.is_anonymous ? null : parsed.donor_phone ?? null,
    donor_email: parsed.is_anonymous ? null : parsed.donor_email ?? null,
    donor_address: parsed.is_anonymous ? null : parsed.donor_address ?? null,
    amount: parsed.amount,
    method: parsed.method,
    received_by: auth.active.school_user_id,
    receipt_no: receiptNo,
    is_anonymous: parsed.is_anonymous,
    notes: parsed.notes ?? null,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "donation",
    meta: { amount: parsed.amount, campaign_id: parsed.campaign_id, receipt: receiptNo },
  });

  revalidatePath(`/admin/donations`);
  return ok({ receiptNo }, `চাঁদা গ্রহণ করা হয়েছে (${receiptNo})`);
}
