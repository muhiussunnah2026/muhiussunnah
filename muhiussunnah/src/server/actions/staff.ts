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
import { sendEmail, isEmailConfigured } from "@/lib/messaging/email";
import { staffInvitationEmail } from "@/lib/messaging/email-templates";
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

  // SUPER_ADMIN is platform-level only — never assignable from tenant
  // UI. Reject even if someone forges the value.
  if (parsed.role === "SUPER_ADMIN") {
    return fail("এই ভূমিকা এখান থেকে দেওয়া যাবে না।");
  }

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

  // 4. Email + audit log run in the BACKGROUND.
  //
  // Previously we awaited generateLink → fetch school → sendEmail →
  // writeAuditLog before returning. That stacked 3-5 network calls on
  // the user's "Sending invite…" spinner — the form felt frozen for
  // 5+ seconds and then the page would do a full revalidate.
  //
  // The membership row already exists (step 3). The new staff member
  // is in the system. The email is just delivery — it can complete
  // after the form returns. Fire it as a detached promise so the UI
  // unblocks immediately.
  const inviterName =
    (auth.active.full_name_bn as string | null) ??
    (auth.active.full_name_en as string | null) ??
    null;
  const schoolId = auth.active.school_id;
  const actorId = auth.session.userId;
  const newStaffEmail = parsed.email;
  const newStaffName = parsed.full_name_bn;
  const newStaffRole = parsed.role;

  void (async () => {
    try {
      let setupUrl: string | null = null;
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: newStaffEmail,
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
        },
      });
      setupUrl = (linkData?.properties?.action_link as string | undefined) ?? null;

      if (setupUrl && isEmailConfigured()) {
        const { data: schoolRow } = await admin
          .from("schools")
          .select("name_bn, name_en")
          .eq("id", schoolId)
          .single();
        const schoolName =
          (schoolRow?.name_bn as string | undefined) ??
          (schoolRow?.name_en as string | undefined) ??
          "আপনার প্রতিষ্ঠান";

        const roleLabels: Record<string, string> = {
          SCHOOL_ADMIN: "প্রিন্সিপাল",
          VICE_PRINCIPAL: "ভাইস প্রিন্সিপাল",
          ACCOUNTANT: "হিসাবরক্ষক",
          BRANCH_ADMIN: "শাখা প্রধান",
          CLASS_TEACHER: "শ্রেণি শিক্ষক",
          SUBJECT_TEACHER: "বিষয় শিক্ষক",
          MADRASA_USTADH: "উস্তাদ",
          LIBRARIAN: "গ্রন্থাগারিক",
          TRANSPORT_MANAGER: "পরিবহন ব্যবস্থাপক",
          HOSTEL_WARDEN: "হোস্টেল ওয়ার্ডেন",
          CANTEEN_MANAGER: "ক্যান্টিন ব্যবস্থাপক",
          COUNSELOR: "কাউন্সেলর",
        };

        const tpl = staffInvitationEmail({
          fullName: newStaffName,
          schoolName,
          roleLabel: roleLabels[newStaffRole] ?? newStaffRole,
          inviterName,
          setupUrl,
        });
        await sendEmail({
          to: newStaffEmail,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          replyTo: "muhiussunnah2026@gmail.com",
        });
      } else if (!setupUrl) {
        // Fallback: trigger Supabase's default reset email so the
        // invitee is never left without a path in.
        const supabase = await supabaseServer();
        await supabase.auth.resetPasswordForEmail(newStaffEmail, {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
        });
      }

      await writeAuditLog({
        schoolId,
        userId: actorId,
        action: "create",
        resourceType: "staff",
        meta: { email: newStaffEmail, role: newStaffRole },
      });
    } catch (e) {
      // Background failure — log and move on. The membership row is
      // already saved so the admin can retry the invite from the row's
      // edit panel if the email never arrives.
      // eslint-disable-next-line no-console
      console.error("staff-invite-bg-error:", (e as Error).message);
    }
  })();

  revalidatePath(`/staff`);
  return ok(undefined, `${parsed.full_name_bn} যোগ হয়েছে। পাসওয়ার্ড সেট করার লিংক তাদের ইমেইলে পাঠানো হয়েছে।`);
}

// -----------------------------------------------------------------
// Update staff member (role, branch, status)
// -----------------------------------------------------------------

const updateStaffSchema = z.object({
  schoolSlug: z.string().min(1),
  school_user_id: z.string().uuid(),
  full_name_bn: z.string().trim().min(2).max(200),
  full_name_en: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  employee_code: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
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

  // SUPER_ADMIN is platform-level and must never be assigned from the
  // tenant-level staff page, even by a crafted request.
  if (parsed.role === "SUPER_ADMIN") {
    return fail("এই ভূমিকা এখান থেকে দেওয়া যাবে না।");
  }

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
      full_name_bn: parsed.full_name_bn,
      full_name_en: parsed.full_name_en ?? null,
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
      employee_code: parsed.employee_code ?? null,
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
    meta: { role: parsed.role, status: parsed.status, email: parsed.email },
  });

  revalidatePath(`/staff`);
  return ok(undefined, "স্টাফের তথ্য আপডেট হয়েছে।");
}

// -----------------------------------------------------------------
// Delete (remove membership)
// -----------------------------------------------------------------

const deleteStaffSchema = z.object({
  schoolSlug: z.string().min(1),
  school_user_id: z.string().uuid(),
});

export async function deleteStaffAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(deleteStaffSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "delete",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  // Safety: can't delete your own membership — use /settings instead
  if (parsed.school_user_id === auth.active.school_user_id) {
    return fail("নিজেকে মুছে ফেলা যাবে না।");
  }

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("school_users")
    .delete()
    .eq("id", parsed.school_user_id)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "delete",
    resourceType: "staff",
    resourceId: parsed.school_user_id,
    meta: {},
  });

  revalidatePath(`/staff`);
  return ok(undefined, "স্টাফ মুছে ফেলা হয়েছে।");
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

  revalidatePath(`/staff/${parsed.school_user_id}/permissions`);
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

  revalidatePath(`/staff/${schoolUserId}/permissions`);
  return ok(undefined, "অনুমতি প্রত্যাহার করা হয়েছে।");
}
