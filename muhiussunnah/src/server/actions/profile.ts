"use server";

/**
 * My-profile server actions: email change, password change, display-name
 * change. All scoped to the currently-signed-in user and their active
 * school membership.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { type ActionResult, ok, fail, parseForm } from "./_helpers";

// ---------------------------------------------------------------------------

const updateNameSchema = z.object({
  schoolSlug: z.string().min(1),
  full_name_bn: z.string().trim().min(2).max(200),
});

export async function updateProfileNameAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateNameSchema, formData);
  if ("error" in parsed) return parsed.error;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("আপনি লগইন নন।");

  // Update the school_users row for this user in this school. We use the
  // admin client because RLS on school_users is tighter than the user's
  // own token can modify.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data: school } = await admin
    .from("schools")
    .select("id")
    .eq("slug", parsed.schoolSlug)
    .maybeSingle();
  if (!school?.id) return fail("প্রতিষ্ঠান পাওয়া যায়নি।");

  const { error } = await admin
    .from("school_users")
    .update({ full_name_bn: parsed.full_name_bn })
    .eq("user_id", user.id)
    .eq("school_id", school.id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${parsed.schoolSlug}`, "layout");
  return ok(undefined, "নাম আপডেট হয়েছে।");
}

// ---------------------------------------------------------------------------

const updateEmailSchema = z.object({
  schoolSlug: z.string().min(1),
  new_email: z.string().trim().email(),
});

export async function updateProfileEmailAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateEmailSchema, formData);
  if ("error" in parsed) return parsed.error;

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ email: parsed.new_email });
  if (error) return fail(error.message);

  return ok(
    undefined,
    "ইমেইল পরিবর্তনের অনুরোধ পাঠানো হয়েছে। নতুন ও পুরনো উভয় ইমেইলে আসা লিংকে ক্লিক করে কনফার্ম করুন।",
  );
}

// ---------------------------------------------------------------------------

const updatePasswordSchema = z
  .object({
    schoolSlug: z.string().min(1),
    new_password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "পাসওয়ার্ড মিলছে না।",
    path: ["confirm_password"],
  });

export async function updateProfilePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updatePasswordSchema, formData);
  if ("error" in parsed) return parsed.error;

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password: parsed.new_password });
  if (error) return fail(error.message);

  return ok(undefined, "পাসওয়ার্ড আপডেট হয়েছে।");
}
