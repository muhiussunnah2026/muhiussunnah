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
  isPlatformOwned: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
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
    is_platform_owned: parsed.isPlatformOwned ?? false,
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
  // Bust tenant-facing routes so the principal sees the new plan
  // immediately, not after a stale-while-revalidate window.
  // NOTE: do NOT invalidate the root layout — that nukes the cache
  // for every dashboard page and makes the whole app feel slow.
  revalidatePath("/settings");
  revalidatePath("/admin");
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

// ---------------------------------------------------------------------
// 4) Nuclear: delete an entire tenant (school + all dependent data + auth users)
// ---------------------------------------------------------------------

const deleteSchoolSchema = z.object({
  schoolId: z.string().uuid(),
  confirmSlug: z.string().min(1),
});

export async function deleteSchoolAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const parsed = parseForm(deleteSchoolSchema, formData);
  if ("error" in parsed) return parsed.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // 1. Confirm the slug the user typed matches the actual school.
  //    Guards against accidental double-click firing on the wrong row.
  const { data: school } = await admin
    .from("schools")
    .select("id, slug, name_bn")
    .eq("id", parsed.schoolId)
    .single();
  if (!school) return fail("স্কুল খুঁজে পাওয়া যায়নি।");
  if (school.slug !== parsed.confirmSlug) {
    return fail("নিশ্চিতকরণে লেখা slug মিলছে না। অনুগ্রহ করে সঠিক slug টাইপ করুন।");
  }

  // 2. Collect every user_id tied to this school so we can decide which
  //    auth users are now orphaned (and therefore safe to purge).
  const { data: members } = await admin
    .from("school_users")
    .select("user_id")
    .eq("school_id", parsed.schoolId);
  const candidateUserIds = Array.from(
    new Set(((members ?? []) as { user_id: string }[]).map((m) => m.user_id)),
  );

  // 3. Delete the school row. Every child table's FK is ON DELETE
  //    CASCADE so students, classes, fees, attendance, etc. all go
  //    with it in one statement.
  const { error: delErr } = await admin.from("schools").delete().eq("id", parsed.schoolId);
  if (delErr) return fail(delErr.message);

  // 4. For each user_id that just lost their only school membership,
  //    delete the auth user so their login credentials no longer work.
  //    Users that still belong to another tenant are left alone.
  let authsPurged = 0;
  for (const uid of candidateUserIds) {
    if (uid === auth.userId) continue; // never purge the acting super admin
    const { count } = await admin
      .from("school_users")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid);
    if ((count ?? 0) === 0) {
      const { error: authErr } = await admin.auth.admin.deleteUser(uid);
      if (!authErr) authsPurged++;
    }
  }

  await writeAuditLog({
    schoolId: null,
    userId: auth.userId,
    action: "delete",
    resourceType: "school",
    resourceId: parsed.schoolId,
    meta: { slug: school.slug, name_bn: school.name_bn, auths_purged: authsPurged },
  });

  revalidatePath("/super-admin/subscriptions");
  revalidatePath("/super-admin/schools");
  revalidatePath("/super-admin");
  return ok(
    undefined,
    `${school.name_bn} সম্পূর্ণ মুছে ফেলা হয়েছে। ${authsPurged} টি লগইন অ্যাকাউন্ট বন্ধ হয়েছে।`,
  );
}
