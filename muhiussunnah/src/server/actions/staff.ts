"use server";

/**
 * Staff (school_users) management + granular permission grants.
 *
 * Inviting staff creates a Supabase auth user via admin API then links
 * them into school_users with the selected role. For Phase 1 we send a
 * password-reset link so they can set their own password.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";
import { USER_ROLES } from "@/lib/auth/roles";
import {
  type ActionResult,
  ok,
  fail,
  parseForm,
  authorizeAction,
  writeAuditLog,
} from "./_helpers";

// -----------------------------------------------------------------
// Invite / create staff
// -----------------------------------------------------------------

const staffSchema = z.object({
  schoolSlug: z.string().min(1),
  full_name_bn: z.string().trim().min(2).max(200),
  full_name_en: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email(),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  employee_code: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  role: z.enum(USER_ROLES),
  branch_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
});

export async function inviteStaffAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(staffSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "student", // permission check is tenant-wide for admins
  });
  if ("error" in auth) return auth.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // 1. Create or invite the auth user
  let userId: string | null = null;

  const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  void existing;

  // Try to invite — if the email already exists, Supabase returns an error
  // that we translate to re-use the existing auth user instead.
  const tempPassword = `Shikkha-${Math.random().toString(36).slice(2, 10)}!`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.full_name_bn,
      phone: parsed.phone,
    },
  });

  if (created?.user) {
    userId = created.user.id;
  } else if (createError?.message?.toLowerCase().includes("already")) {
    // Look up the existing user by email
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const match = list?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === parsed.email.toLowerCase());
    if (!match) return fail("ইউজার খুঁজে পাওয়া যায়নি।");
    userId = match.id;
  } else {
    return fail(createError?.message ?? "স্টাফ যোগ করা যায়নি।");
  }

  if (!userId) return fail("ইউজার আইডি পাওয়া যায়নি।");

  // 2. Check for existing membership (avoid duplicates)
  const { data: existingMembership } = await admin
    .from("school_users")
    .select("id")
    .eq("school_id", auth.active.school_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMembership) {
    return fail("এই ইউজার ইতিমধ্যে এই স্কুলে আছেন।");
  }

  // 3. Insert the membership row
  const { error: membershipError } = await admin.from("school_users").insert({
    school_id: auth.active.school_id,
    branch_id: parsed.branch_id ?? null,
    user_id: userId,
    role: parsed.role,
    full_name_bn: parsed.full_name_bn,
    full_name_en: parsed.full_name_en ?? null,
    email: parsed.email,
    phone: parsed.phone ?? null,
    employee_code: parsed.employee_code ?? null,
    status: "active",
  });
  if (membershipError) return fail(membershipError.message);

  // 4. Send password-reset link so they set their own password
  const supabase = await supabaseServer();
  await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "staff",
    meta: { email: parsed.email, role: parsed.role },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/staff`);
  return ok(undefined, `${parsed.full_name_bn} যোগ হয়েছে। পাসওয়ার্ড সেট করার লিংক তাদের ইমেইলে পাঠানো হয়েছে।`);
}

// -----------------------------------------------------------------
// Update staff member (role, branch, status)
// -----------------------------------------------------------------

const updateStaffSchema = z.object({
  schoolSlug: z.string().min(1),
  school_user_id: z.string().uuid(),
  role: z.enum(USER_ROLES),
  branch_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["active", "inactive", "suspended"]),
});

export async function updateStaffAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateStaffSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("school_users")
    .update({
      role: parsed.role,
      branch_id: parsed.branch_id ?? null,
      status: parsed.status,
    })
    .eq("id", parsed.school_user_id)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "update",
    resourceType: "staff",
    resourceId: parsed.school_user_id,
    meta: { role: parsed.role, status: parsed.status },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/staff`);
  return ok(undefined, "স্টাফের তথ্য আপডেট হয়েছে।");
}

// -----------------------------------------------------------------
// Grant a permission tuple
// -----------------------------------------------------------------

const grantPermissionSchema = z.object({
  schoolSlug: z.string().min(1),
  school_user_id: z.string().uuid(),
  action: z.enum(["view", "create", "update", "delete", "approve", "export"]),
  resource: z.string().min(1),
  scope_type: z.enum(["school", "branch", "class", "section", "subject", "student", "self"]),
  scope_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
});

export async function grantPermissionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(grantPermissionSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("user_permissions").insert({
    school_user_id: parsed.school_user_id,
    action: parsed.action,
    resource: parsed.resource,
    scope_type: parsed.scope_type,
    scope_id: parsed.scope_id ?? null,
    granted_by: auth.session.userId,
  });
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}/admin/staff/${parsed.school_user_id}/permissions`);
  return ok(undefined, "অনুমতি দেওয়া হয়েছে।");
}

export async function revokePermissionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const permissionId = formData.get("permissionId")?.toString() ?? "";
  const schoolUserId = formData.get("schoolUserId")?.toString() ?? "";
  if (!schoolSlug || !permissionId) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({
    schoolSlug,
    action: "delete",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_permissions")
    .delete()
    .eq("id", permissionId);
  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/staff/${schoolUserId}/permissions`);
  return ok(undefined, "অনুমতি প্রত্যাহার করা হয়েছে।");
}
