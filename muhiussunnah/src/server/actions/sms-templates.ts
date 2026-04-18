"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction, fail, ok } from "./_helpers";
import { supabaseServer } from "@/lib/supabase/server";
import type { ActionResult } from "./_helpers";

const templateSchema = z.object({
  schoolSlug: z.string(),
  name: z.string().min(1, "নাম দিন"),
  category: z.enum(["fee_reminder", "absent_alert", "exam_reminder", "result_announce", "holiday", "general", "custom"]).default("general"),
  body: z.string().min(1, "টেমপ্লেট বডি দিন"),
  language: z.enum(["bn", "en"]).default("bn"),
  is_ai_generated: z.coerce.boolean().default(false),
});

export async function saveSmsTemplateAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = templateSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "notice" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  // Extract variables from template body: {{student_name}}, {{amount}}, etc.
  const variables = [...data.body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("sms_templates").upsert(
    {
      school_id: auth.active.school_id,
      name: data.name,
      category: data.category,
      body: data.body,
      language: data.language,
      variables: [...new Set(variables)],
      is_ai_generated: data.is_ai_generated,
      created_by: auth.active.school_user_id,
    },
    { onConflict: "school_id,name" },
  );

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/admin/messaging/templates`);
  return ok(null, "টেমপ্লেট সেভ হয়েছে।");
}

export async function deleteSmsTemplateAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  const id = formData.get("id") as string;
  if (!schoolSlug || !id) return fail("Invalid data");

  const auth = await authorizeAction({ schoolSlug, action: "delete", resource: "notice" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("sms_templates").delete().eq("id", id).eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/messaging/templates`);
  return ok(null, "টেমপ্লেট মুছে ফেলা হয়েছে।");
}
