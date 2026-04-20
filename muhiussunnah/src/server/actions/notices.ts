"use server";

/**
 * Notice composer + dispatcher glue.
 *
 * Audience picker resolves to a concrete list of recipients:
 *   all     → all parents + students in school (union of auth users)
 *   staff   → all non-student/parent school_users
 *   teachers→ CLASS_TEACHER + SUBJECT_TEACHER + MADRASA_USTADH
 *   students→ students.user_id (if portal accounts) + guardian phones
 *   parents → student_guardians.phone + user_id
 *   class   → students in that class × their guardians
 *   section → students in that section × their guardians
 *   individual → target_ids[] (school_user ids or student ids)
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
import { dispatchMessage, type Channel, type Recipient } from "@/lib/messaging/dispatcher";

const noticeSchema = z.object({
  schoolSlug: z.string().min(1),
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(5000),
  audience: z.enum(["all", "staff", "teachers", "students", "parents", "class", "section"]),
  audience_target_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  channels: z.string().optional(), // JSON-encoded array
  schedule_now: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
  scheduled_for: z.string().optional().or(z.literal("").transform(() => undefined)),
});

async function resolveRecipients(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  schoolId: string,
  audience: string,
  targetId: string | undefined,
): Promise<Recipient[]> {
  const recipients: Recipient[] = [];

  if (audience === "staff") {
    const { data } = await supabase
      .from("school_users")
      .select("user_id, full_name_bn, email, phone")
      .eq("school_id", schoolId)
      .eq("status", "active")
      .not("role", "in", "(STUDENT,PARENT)");
    for (const r of (data ?? []) as Array<{ user_id: string; full_name_bn: string | null; email: string | null; phone: string | null }>) {
      recipients.push({ user_id: r.user_id, name: r.full_name_bn ?? undefined, email: r.email ?? undefined, phone: r.phone ?? undefined });
    }
    return recipients;
  }

  if (audience === "teachers") {
    const { data } = await supabase
      .from("school_users")
      .select("user_id, full_name_bn, email, phone, role")
      .eq("school_id", schoolId)
      .eq("status", "active")
      .in("role", ["CLASS_TEACHER", "SUBJECT_TEACHER", "MADRASA_USTADH"]);
    for (const r of (data ?? []) as Array<{ user_id: string; full_name_bn: string | null; email: string | null; phone: string | null }>) {
      recipients.push({ user_id: r.user_id, name: r.full_name_bn ?? undefined, email: r.email ?? undefined, phone: r.phone ?? undefined });
    }
    return recipients;
  }

  // Student-scoped audiences: need to build recipient list from students + guardians
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentQuery = (supabase as any)
    .from("students")
    .select("id, name_bn, guardian_phone, section_id, sections(class_id)")
    .eq("school_id", schoolId)
    .eq("status", "active");

  if (audience === "class" && targetId) studentQuery = studentQuery.eq("sections.class_id", targetId);
  if (audience === "section" && targetId) studentQuery = studentQuery.eq("section_id", targetId);

  const { data: students } = await studentQuery;
  const studentList = (students ?? []) as Array<{ id: string; name_bn: string; guardian_phone: string | null }>;

  // For "students": use student's own user account (if linked) — simpler, for now skip since portal students aren't auto-created
  // For "parents" or class/section: look up guardians per student
  if (studentList.length === 0) return recipients;

  const studentIds = studentList.map((s) => s.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: guardians } = await (supabase as any)
    .from("student_guardians")
    .select("student_id, user_id, phone, email, name_bn")
    .in("student_id", studentIds);

  const guardianList = (guardians ?? []) as Array<{ student_id: string; user_id: string | null; phone: string | null; email: string | null; name_bn: string }>;

  for (const g of guardianList) {
    recipients.push({
      user_id: g.user_id ?? undefined,
      phone: g.phone ?? undefined,
      email: g.email ?? undefined,
      name: g.name_bn,
    });
  }

  // Also include student's fallback guardian_phone if no guardian record
  const guardianStudentIds = new Set(guardianList.map((g) => g.student_id));
  for (const s of studentList) {
    if (!guardianStudentIds.has(s.id) && s.guardian_phone) {
      recipients.push({ phone: s.guardian_phone, name: s.name_bn });
    }
  }

  // Dedupe by (phone || user_id || email)
  const seen = new Set<string>();
  return recipients.filter((r) => {
    const key = r.user_id ?? r.phone ?? r.email ?? "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function createNoticeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(noticeSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "notice",
  });
  if ("error" in auth) return auth.error;

  let channels: Channel[] = [];
  try {
    const parsedChannels = parsed.channels ? JSON.parse(parsed.channels) : ["inapp"];
    if (Array.isArray(parsedChannels)) {
      channels = parsedChannels.filter((c): c is Channel =>
        ["sms", "whatsapp", "push", "email", "inapp"].includes(c),
      );
    }
  } catch {
    channels = ["inapp"];
  }
  if (channels.length === 0) channels = ["inapp"];

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notice, error: noticeErr } = await (supabase as any)
    .from("notices")
    .insert({
      school_id: auth.active.school_id,
      branch_id: auth.active.branch_id,
      title: parsed.title,
      body: parsed.body,
      audience: parsed.audience,
      target_ids: parsed.audience_target_id ? [parsed.audience_target_id] : [],
      channels,
      scheduled_for: parsed.schedule_now ? null : parsed.scheduled_for ?? null,
      sent_at: parsed.schedule_now ? new Date().toISOString() : null,
      created_by: auth.active.school_user_id,
    })
    .select("id")
    .single();

  if (noticeErr || !notice) return fail(noticeErr?.message ?? "Notice creation failed");

  // If scheduled for the future, let the cron flush it later
  if (!parsed.schedule_now && parsed.scheduled_for) {
    await writeAuditLog({
      schoolId: auth.active.school_id,
      userId: auth.session.userId,
      action: "schedule",
      resourceType: "notice",
      resourceId: notice.id,
      meta: { audience: parsed.audience, channels, scheduled_for: parsed.scheduled_for },
    });
    revalidatePath(`/admin/notices`);
    return ok(undefined, `📅 নোটিশ ${parsed.scheduled_for}-এ পাঠানো হবে।`);
  }

  // Send now
  const recipients = await resolveRecipients(supabase, auth.active.school_id, parsed.audience, parsed.audience_target_id);

  if (recipients.length === 0) {
    revalidatePath(`/admin/notices`);
    return ok(undefined, "নোটিশ তৈরি হয়েছে, কিন্তু কোন প্রাপক পাওয়া যায়নি।");
  }

  const dispatch = await dispatchMessage({
    schoolId: auth.active.school_id,
    noticeId: notice.id,
    channels,
    recipients,
    subject: parsed.title,
    body: parsed.body,
  });

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "send",
    resourceType: "notice",
    resourceId: notice.id,
    meta: { audience: parsed.audience, channels, dispatched: dispatch.sent, failed: dispatch.failed, cost: dispatch.cost },
  });

  revalidatePath(`/admin/notices`);

  const summary = `✓ ${dispatch.sent} জনের কাছে পৌঁছেছে · ৳ ${dispatch.cost.toFixed(2)} খরচ`;
  if (dispatch.insufficientCredit) {
    return ok({ dispatch }, `⚠ SMS ক্রেডিট কম — অন্য চ্যানেল পাঠানো হয়েছে। ${summary}`);
  }
  if (dispatch.failed > 0) {
    return ok({ dispatch }, `${summary}। ${dispatch.failed} ব্যর্থ।`);
  }
  return ok({ dispatch }, summary);
}

// -----------------------------------------------------------------
// Delete / cancel a notice (only if not yet sent)
// -----------------------------------------------------------------

export async function deleteNoticeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const id = formData.get("id")?.toString() ?? "";
  if (!schoolSlug || !id) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({ schoolSlug, action: "delete", resource: "notice" });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("notices")
    .delete()
    .eq("id", id)
    .eq("school_id", auth.active.school_id)
    .is("sent_at", null);
  if (error) return fail(error.message);

  revalidatePath(`/admin/notices`);
  return ok(undefined, "নোটিশ মুছে ফেলা হয়েছে।");
}
