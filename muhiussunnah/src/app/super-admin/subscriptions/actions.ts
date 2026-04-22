"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLog, fail, ok, parseForm, type ActionResult } from "@/server/actions/_helpers";

/**
 * All actions below require SUPER_ADMIN role on any school the user
 * belongs to. Mutations target other tenants, so we gate hard.
 */
async function requireSuperAdmin(): Promise<
  { userId: string } | { error: ActionResult }
> {
  const session = await getSession();
  if (!session) return { error: fail("সেশন শেষ হয়েছে। আবার লগইন করুন।") };
  const isSuper = session.memberships.some((m) => m.role === "SUPER_ADMIN");
  if (!isSuper) return { error: fail("এই কাজের জন্য সুপার অ্যাডমিন প্রয়োজন।") };
  return { userId: session.userId };
}

// ---------------------------------------------------------------------
// 1) Update school subscription: plan, status, trial/expiry dates
// ---------------------------------------------------------------------

const subscriptionSchema = z.object({
  schoolId: z.string().uuid(),
  planId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["trial", "active", "past_due", "canceled", "suspended"]),
  trialEndsAt: z.string().optional().or(z.literal("")),
  subscriptionExpiresAt: z.string().optional().or(z.literal("")),
});

export async function updateSchoolSubscriptionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const parsed = parseForm(subscriptionSchema, formData);
  if ("error" in parsed) return parsed.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const update: Record<string, unknown> = {
    subscription_status: parsed.status,
    subscription_plan_id: parsed.planId || null,
    trial_ends_at: parsed.trialEndsAt || null,
    subscription_expires_at: parsed.subscriptionExpiresAt || null,
  };

  const { error } = await admin
    .from("schools")
    .update(update)
    .eq("id", parsed.schoolId);
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: parsed.schoolId,
    userId: auth.userId,
    action: "update",
    resourceType: "subscription",
    resourceId: parsed.schoolId,
    meta: update,
  });

  revalidatePath("/super-admin/subscriptions");
  revalidatePath("/super-admin/schools");
  return ok(undefined, "সাবস্ক্রিপশন আপডেট হয়েছে।");
}

// ---------------------------------------------------------------------
// 2) Update tenant admin's login email (no verification — super admin override)
// ---------------------------------------------------------------------

const emailSchema = z.object({
  schoolId: z.string().uuid(),
  userId: z.string().uuid(),
  newEmail: z.string().email("ইমেইল ঠিক নয়।"),
});

export async function updateTenantAdminEmailAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const parsed = parseForm(emailSchema, formData);
  if ("error" in parsed) return parsed.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // Update auth.users + keep auth.identities in sync. Supabase's Admin API
  // rewrites both when we pass `email` + `email_confirm: true`.
  const { error } = await admin.auth.admin.updateUserById(parsed.userId, {
    email: parsed.newEmail,
    email_confirm: true,
  });
  if (error) return fail(error.message);

  // Keep the cached email in school_users in sync so the staff list
  // doesn't show a stale address after the change.
  await admin
    .from("school_users")
    .update({ email: parsed.newEmail })
    .eq("user_id", parsed.userId);

  await writeAuditLog({
    schoolId: parsed.schoolId,
    userId: auth.userId,
    action: "update",
    resourceType: "tenant_admin_email",
    resourceId: parsed.userId,
    meta: { new_email: parsed.newEmail },
  });

  revalidatePath("/super-admin/subscriptions");
  return ok(undefined, "ইমেইল পরিবর্তন হয়েছে। নতুন ইমেইল দিয়ে লগইন করা যাবে।");
}

// ---------------------------------------------------------------------
// 3) Reset tenant admin's password (super admin override)
// ---------------------------------------------------------------------

const passwordSchema = z.object({
  schoolId: z.string().uuid(),
  userId: z.string().uuid(),
  newPassword: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"),
});

export async function resetTenantAdminPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const parsed = parseForm(passwordSchema, formData);
  if ("error" in parsed) return parsed.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { error } = await admin.auth.admin.updateUserById(parsed.userId, {
    password: parsed.newPassword,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: parsed.schoolId,
    userId: auth.userId,
    action: "reset",
    resourceType: "tenant_admin_password",
    resourceId: parsed.userId,
    meta: {},
  });

  return ok(undefined, "পাসওয়ার্ড রিসেট হয়েছে। এই পাসওয়ার্ড প্রিন্সিপালকে দিন।");
}
