"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction, fail, ok, requireMembershipForAction } from "./_helpers";
import { supabaseServer } from "@/lib/supabase/server";
import type { ActionResult } from "./_helpers";

// ─── Assignments ──────────────────────────────────────────────────────────────

const assignmentSchema = z.object({
  schoolSlug: z.string(),
  section_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  title: z.string().min(1, "শিরোনাম দিন"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  max_marks: z.coerce.number().int().min(0).optional(),
});

export async function createAssignmentAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = assignmentSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "exam" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("assignments").insert({
    school_id: auth.active.school_id,
    section_id: data.section_id,
    subject_id: data.subject_id,
    title: data.title,
    description: data.description || null,
    due_date: data.due_date || null,
    max_marks: data.max_marks ?? null,
    created_by: auth.active.school_user_id,
  });

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/admin/assignments`);
  revalidatePath(`/school/${schoolSlug}/teacher/assignments`);
  return ok(null, "অ্যাসাইনমেন্ট তৈরি হয়েছে।");
}

const submissionSchema = z.object({
  schoolSlug: z.string(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  body: z.string().optional(),
  file_url: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export async function submitAssignmentAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  if (!data.body && !data.file_url) return fail("উত্তর লিখুন অথবা ফাইল URL দিন");

  const auth = await requireMembershipForAction(schoolSlug);
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("assignment_submissions").upsert(
    {
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      body: data.body || null,
      file_url: data.file_url || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,student_id" },
  );

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/portal/assignments`);
  return ok(null, "অ্যাসাইনমেন্ট জমা দেওয়া হয়েছে।");
}

const gradeSchema = z.object({
  schoolSlug: z.string(),
  submission_id: z.string().uuid(),
  marks: z.coerce.number().min(0),
  feedback: z.string().optional(),
});

export async function gradeSubmissionAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = gradeSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "update", resource: "exam" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("assignment_submissions")
    .update({
      marks: data.marks,
      feedback: data.feedback || null,
      graded_by: auth.active.school_user_id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", data.submission_id);

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/admin/assignments`);
  return ok(null, "গ্রেড দেওয়া হয়েছে।");
}

// ─── Online Classes ───────────────────────────────────────────────────────────

const onlineClassSchema = z.object({
  schoolSlug: z.string(),
  section_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  title: z.string().optional(),
  scheduled_at: z.string().min(1, "সময় দিন"),
  duration_mins: z.coerce.number().int().min(1).default(60),
  meet_url: z.string().url("বৈধ URL দিন"),
  provider: z.enum(["zoom", "google_meet", "teams", "other"]).default("zoom"),
});

export async function scheduleOnlineClassAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = onlineClassSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "exam" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("online_classes").insert({
    school_id: auth.active.school_id,
    section_id: data.section_id,
    subject_id: data.subject_id,
    title: data.title || null,
    scheduled_at: data.scheduled_at,
    duration_mins: data.duration_mins,
    meet_url: data.meet_url,
    provider: data.provider,
    created_by: auth.active.school_user_id,
  });

  if (error) return fail(error.message);
  revalidatePath(`/school/${schoolSlug}/admin/online-classes`);
  return ok(null, "ক্লাস শিডিউল হয়েছে।");
}
