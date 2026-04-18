"use server";

/**
 * Academic CRUD: years, classes, sections, subjects, assignments.
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
// Academic years
// -----------------------------------------------------------------

const yearSchema = z.object({
  schoolSlug: z.string().min(1),
  name: z.string().trim().min(2).max(50),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  is_active: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
});

export async function addAcademicYearAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(yearSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  if (parsed.is_active) {
    // Flip any existing active year off first (only one active allowed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("academic_years")
      .update({ is_active: false })
      .eq("school_id", auth.active.school_id)
      .eq("is_active", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("academic_years").insert({
    school_id: auth.active.school_id,
    name: parsed.name,
    start_date: parsed.start_date,
    end_date: parsed.end_date,
    is_active: parsed.is_active,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "academic_year",
    meta: { name: parsed.name },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/academic-years`);
  return ok(undefined, "শিক্ষাবর্ষ যোগ হয়েছে।");
}

// -----------------------------------------------------------------
// Classes
// -----------------------------------------------------------------

const classSchema = z.object({
  schoolSlug: z.string().min(1),
  name_bn: z.string().trim().min(1).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  stream: z.enum(["general", "hifz", "kitab", "nazera", "science", "commerce", "arts"]).default("general"),
  display_order: z.coerce.number().int().min(0).max(999).default(0),
  branch_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
});

export async function addClassAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(classSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("classes").insert({
    school_id: auth.active.school_id,
    branch_id: parsed.branch_id ?? null,
    name_bn: parsed.name_bn,
    name_en: parsed.name_en ?? null,
    stream: parsed.stream,
    display_order: parsed.display_order,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "class",
    meta: { name_bn: parsed.name_bn, stream: parsed.stream },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/classes`);
  return ok(undefined, "ক্লাস যোগ হয়েছে।");
}

export async function deleteClassAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const schoolSlug = formData.get("schoolSlug")?.toString() ?? "";
  const classId = formData.get("classId")?.toString() ?? "";
  if (!schoolSlug || !classId) return fail("অবৈধ অনুরোধ।");

  const auth = await authorizeAction({
    schoolSlug,
    action: "delete",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/classes`);
  return ok(undefined, "ক্লাস মুছে ফেলা হয়েছে।");
}

// -----------------------------------------------------------------
// Sections
// -----------------------------------------------------------------

const sectionSchema = z.object({
  schoolSlug: z.string().min(1),
  class_id: z.string().uuid(),
  name: z.string().trim().min(1).max(50),
  capacity: z.coerce.number().int().min(0).max(10000).optional(),
  class_teacher_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  room: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
});

export async function addSectionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(sectionSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "class",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("sections").insert({
    class_id: parsed.class_id,
    name: parsed.name,
    capacity: parsed.capacity ?? null,
    class_teacher_id: parsed.class_teacher_id ?? null,
    room: parsed.room ?? null,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "section",
    meta: { class_id: parsed.class_id, name: parsed.name },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/classes`);
  return ok(undefined, "সেকশন যোগ হয়েছে।");
}

// -----------------------------------------------------------------
// Subjects
// -----------------------------------------------------------------

const subjectSchema = z.object({
  schoolSlug: z.string().min(1),
  class_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  name_bn: z.string().trim().min(1).max(100),
  name_en: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  name_ar: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  code: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  full_marks: z.coerce.number().int().min(1).max(1000).default(100),
  pass_marks: z.coerce.number().int().min(0).max(1000).default(33),
  is_optional: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
});

export async function addSubjectAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(subjectSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "subject",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("subjects").insert({
    school_id: auth.active.school_id,
    class_id: parsed.class_id ?? null,
    name_bn: parsed.name_bn,
    name_en: parsed.name_en ?? null,
    name_ar: parsed.name_ar ?? null,
    code: parsed.code ?? null,
    full_marks: parsed.full_marks,
    pass_marks: parsed.pass_marks,
    is_optional: parsed.is_optional,
  });
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "subject",
    meta: { name_bn: parsed.name_bn },
  });
  revalidatePath(`/school/${parsed.schoolSlug}/admin/subjects`);
  return ok(undefined, "বিষয় যোগ হয়েছে।");
}
