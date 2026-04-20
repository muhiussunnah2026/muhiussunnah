"use server";

/**
 * Certificate templates + issuance.
 *
 * Templates store an HTML body with variable placeholders like
 * `{{student_name}}`, `{{school_name}}`, `{{date}}`. When issuing a
 * certificate we resolve variables, render server-side (or
 * browser-print), and store the filled HTML + a serial number.
 */

import { randomUUID } from "node:crypto";
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
// Template CRUD
// -----------------------------------------------------------------

const templateSchema = z.object({
  schoolSlug: z.string().min(1),
  type: z.enum(["testimonial", "tc", "character", "completion", "hifz_sanad", "other"]),
  name: z.string().trim().min(2).max(200),
  html_template: z.string().trim().min(10),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  paper_size: z.enum(["A4", "A5", "Letter"]).default("A4"),
});

export async function addTemplateAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(templateSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "certificate",
  });
  if ("error" in auth) return auth.error;

  // Extract {{variable}} names for `variables` JSONB
  const variables = Array.from(new Set(Array.from(parsed.html_template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).map((m) => m[1])));

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("certificate_templates").insert({
    school_id: auth.active.school_id,
    type: parsed.type,
    name: parsed.name,
    html_template: parsed.html_template,
    variables,
    orientation: parsed.orientation,
    paper_size: parsed.paper_size,
    is_active: true,
  });
  if (error) return fail(error.message);

  revalidatePath(`/admin/certificates/templates`);
  return ok(undefined, "টেমপ্লেট যোগ হয়েছে।");
}

// -----------------------------------------------------------------
// Issue a certificate
// -----------------------------------------------------------------

const issueSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
  template_id: z.string().uuid(),
  data: z.string().optional(),   // JSON-encoded extra variables
});

export async function issueCertificateAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(issueSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "certificate",
  });
  if ("error" in auth) return auth.error;

  const extra = (() => {
    try { return parsed.data ? JSON.parse(parsed.data) : {}; }
    catch { return {}; }
  })();

  const serial = `CERT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("certificates_issued")
    .insert({
      school_id: auth.active.school_id,
      student_id: parsed.student_id,
      template_id: parsed.template_id,
      issued_on: new Date().toISOString().slice(0, 10),
      serial_no: serial,
      issued_by: auth.active.school_user_id,
      data: extra,
    })
    .select("id")
    .single();
  if (error || !data) return fail(error?.message ?? "সার্টিফিকেট ইস্যু করা যায়নি।");

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "issue",
    resourceType: "certificate",
    resourceId: data.id,
    meta: { serial, student_id: parsed.student_id },
  });

  revalidatePath(`/admin/certificates`);
  return ok(
    { id: data.id, serial },
    `সার্টিফিকেট ইস্যু হয়েছে (${serial})`,
    `/admin/certificates/${data.id}`,
  );
}
