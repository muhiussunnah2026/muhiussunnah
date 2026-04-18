"use server";

/**
 * School settings + branches.
 */

import { revalidatePath } from "next/cache";
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

// -----------------------------------------------------------------
// School profile update
// -----------------------------------------------------------------

const updateSchoolSchema = z.object({
  schoolSlug: z.string().min(1),
  name_bn: z.string().trim().min(2).max(200),
  name_en: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  eiin: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  type: z.enum(["school", "madrasa", "both"]),
  address: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  website: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
});

export async function updateSchoolAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateSchoolSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("schools")
    .update({
      name_bn: parsed.name_bn,
      name_en: parsed.name_en ?? null,
      eiin: parsed.eiin ?? null,
      type: parsed.type,
      address: parsed.address ?? null,
      phone: parsed.phone ?? null,
      email: parsed.email ?? null,
      website: parsed.website ?? null,
    })
    .eq("id", auth.active.school_id);

  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "update",
    resourceType: "school",
    resourceId: auth.active.school_id,
    meta: { name_bn: parsed.name_bn },
  });

  revalidatePath(`/school/${parsed.schoolSlug}`, "layout");
  return ok(undefined, "স্কুলের তথ্য আপডেট হয়েছে।");
}

// -----------------------------------------------------------------
// Branch management
// -----------------------------------------------------------------

const branchSchema = z.object({
  schoolSlug: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  is_primary: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
});

export async function addBranchAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(branchSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("school_branches").insert({
    school_id: auth.active.school_id,
    name: parsed.name,
    address: parsed.address ?? null,
    phone: parsed.phone ?? null,
    is_primary: parsed.is_primary,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "branch",
    meta: { name: parsed.name },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/branches`);
  return ok(undefined, "শাখা যোগ হয়েছে।");
}

export async function deleteBranchAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const branchId = formData.get("branchId")?.toString() ?? "";
  if (!schoolSlug || !branchId) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({
    schoolSlug,
    action: "delete",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("school_branches")
    .delete()
    .eq("id", branchId)
    .eq("school_id", auth.active.school_id);

  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/branches`);
  return ok(undefined, "শাখা মুছে ফেলা হয়েছে।");
}
