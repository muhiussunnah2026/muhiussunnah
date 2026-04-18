"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, requireMembershipForAction } from "./_helpers";
import { supabaseServer } from "@/lib/supabase/server";
import { generateSecret, generateRecoveryCodes, verifyTotp, otpauthUri } from "@/lib/auth/totp";
import type { ActionResult } from "./_helpers";

/**
 * Generate a new TOTP secret + recovery codes for the current user.
 * Stores them unverified (verified_at = null) until user enters a valid code.
 */
export async function setupTotpAction(
  _prev: ActionResult<{ secret: string; uri: string; recovery: string[] }> | null,
  formData: FormData,
): Promise<ActionResult<{ secret: string; uri: string; recovery: string[] }>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  if (!schoolSlug) return fail("Invalid data");

  const auth = await requireMembershipForAction(schoolSlug);
  if ("error" in auth) return auth.error as ActionResult<{ secret: string; uri: string; recovery: string[] }>;

  const secret = generateSecret();
  const recovery = generateRecoveryCodes();
  const uri = otpauthUri({
    secret,
    label: auth.session.email ?? auth.session.userId,
    issuer: "Shikkha",
  });

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("user_totp_secrets").upsert({
    user_id: auth.session.userId,
    secret,
    recovery_codes: recovery,
    verified_at: null,
  });

  if (error) return fail(error.message);
  return ok({ secret, uri, recovery }, "TOTP সেটআপ শুরু হয়েছে। Authenticator app-এ কোড স্ক্যান করুন।");
}

/**
 * Verify a TOTP code. On success, set verified_at.
 * This enables 2FA for the user going forward.
 */
export async function verifyTotpAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  const code = (formData.get("code") as string)?.replace(/\s+/g, "");
  if (!schoolSlug || !code) return fail("কোড দিন");

  const auth = await requireMembershipForAction(schoolSlug);
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("user_totp_secrets")
    .select("secret, verified_at")
    .eq("user_id", auth.session.userId)
    .single();

  if (!data) return fail("প্রথমে TOTP সেটআপ করুন।");

  if (!verifyTotp(data.secret, code)) return fail("ভুল কোড। আবার চেষ্টা করুন।");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("user_totp_secrets")
    .update({ verified_at: new Date().toISOString() })
    .eq("user_id", auth.session.userId);

  revalidatePath(`/school/${schoolSlug}/admin/settings/2fa`);
  return ok(null, "2FA সফলভাবে চালু হয়েছে।");
}

/** Disable 2FA by deleting the row. */
export async function disableTotpAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  if (!schoolSlug) return fail("Invalid data");

  const auth = await requireMembershipForAction(schoolSlug);
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_totp_secrets")
    .delete()
    .eq("user_id", auth.session.userId);

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/admin/settings/2fa`);
  return ok(null, "2FA বন্ধ করা হয়েছে।");
}
