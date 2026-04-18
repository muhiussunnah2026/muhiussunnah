"use server";

/**
 * Auth server actions — sign in, sign out, register school, reset password.
 *
 * Security: every mutation calls Supabase directly; no client-side magic.
 * registerSchool uses the service-role admin client so it can insert the
 * SCHOOL_ADMIN membership + seed defaults in a single transaction.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify, isValidSlug } from "@/lib/utils/slug";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const registerSchoolSchema = z.object({
  school_name_bn: z.string().trim().min(2).max(200),
  school_name_en: z.string().trim().max(200).optional(),
  school_type: z.enum(["school", "madrasa", "both"]).default("school"),
  eiin: z.string().trim().max(20).optional(),
  admin_full_name: z.string().trim().min(2).max(200),
  admin_phone: z.string().trim().optional(),
  admin_email: z.string().trim().email(),
  admin_password: z.string().min(8),
  slug: z.string().trim().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

// ---------------------------------------------------------------------------
// Result shape (used with useActionState on the client)
// ---------------------------------------------------------------------------

export type ActionResult =
  | { ok: true; message?: string; redirect?: string }
  | { ok: false; error: string; fields?: Record<string, string[]> };

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export async function signInAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "অবৈধ ইনপুট", fields: parsed.error.flatten().fieldErrors };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: translateAuthError(error.message) };

  const next = (formData.get("next") as string | null) || "/";
  revalidatePath("/", "layout");
  redirect(next);
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOutAction(): Promise<void> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Register a new school
// ---------------------------------------------------------------------------

export async function registerSchoolAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchoolSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "অবৈধ ইনপুট", fields: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const slug = data.slug && isValidSlug(data.slug) ? data.slug : slugify(data.school_name_en ?? data.school_name_bn);

  const supabase = await supabaseServer();
  // Cast to `any` because types.ts is a permissive placeholder until the
  // generated Database type lands.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // 1. Sign up the admin user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.admin_email,
    password: data.admin_password,
    options: {
      data: {
        full_name: data.admin_full_name,
        phone: data.admin_phone,
      },
    },
  });
  if (authError || !authData.user) {
    return { ok: false, error: translateAuthError(authError?.message ?? "Signup failed") };
  }

  const userId = authData.user.id;

  // 2. Check slug uniqueness, insert school, branch, membership — via admin.
  const { data: existingSlug } = await admin
    .from("schools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const finalSlug = existingSlug ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;

  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({
      slug: finalSlug,
      name_bn: data.school_name_bn,
      name_en: data.school_name_en,
      type: data.school_type,
      eiin: data.eiin,
      email: data.admin_email,
      phone: data.admin_phone,
      subscription_status: "trial",
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
    })
    .select("id, slug")
    .single();

  if (schoolError || !school) {
    return { ok: false, error: schoolError?.message ?? "School creation failed" };
  }

  // 3. Seed per-tenant defaults (branch, fee heads, expense heads, …)
  const { error: seedError } = await admin.rpc("seed_new_school", {
    target_school: school.id,
  });
  if (seedError) {
    // eslint-disable-next-line no-console
    console.error("seed_new_school failed:", seedError);
  }

  // 4. Lookup the primary branch and insert SCHOOL_ADMIN membership.
  const { data: branch } = await admin
    .from("school_branches")
    .select("id")
    .eq("school_id", school.id)
    .eq("is_primary", true)
    .single();

  const { error: memberError } = await admin.from("school_users").insert({
    school_id: school.id,
    branch_id: branch?.id ?? null,
    user_id: userId,
    role: "SCHOOL_ADMIN",
    full_name_bn: data.admin_full_name,
    email: data.admin_email,
    phone: data.admin_phone,
    status: "active",
  });
  if (memberError) {
    return { ok: false, error: memberError.message };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "স্কুল সফলভাবে তৈরি হয়েছে। লগইন করুন।",
    redirect: `/login?next=/school/${school.slug}/admin`,
  };
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

export async function forgotPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "অবৈধ ইমেইল" };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  if (error) return { ok: false, error: translateAuthError(error.message) };

  return { ok: true, message: "পাসওয়ার্ড রিসেট লিংক ইমেইল করা হয়েছে।" };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "ইমেইল বা পাসওয়ার্ড ভুল।",
    "User already registered": "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।",
    "Email not confirmed": "ইমেইল এখনও যাচাই করা হয়নি।",
    "Password should be at least 6 characters": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
  };
  return map[message] ?? message;
}
