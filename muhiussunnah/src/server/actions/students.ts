"use server";

/**
 * Student admission, bulk import, shift/transfer, per-student ledger helpers.
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
// Student admission (single)
// -----------------------------------------------------------------

const studentSchema = z.object({
  schoolSlug: z.string().min(1),
  student_code: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  name_bn: z.string().trim().min(2).max(200),
  name_en: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  name_ar: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  roll: z.coerce.number().int().min(0).max(99999).optional(),
  section_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  branch_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  admission_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  date_of_birth: z.string().optional().or(z.literal("").transform(() => undefined)),
  gender: z.enum(["male", "female", "other"]).optional(),
  blood_group: z.string().trim().max(10).optional().or(z.literal("").transform(() => undefined)),
  religion: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  nid_birth_cert: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  guardian_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  guardian_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  guardian_relation: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  mother_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  mother_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  address_present: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  address_permanent: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  previous_school: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  photo_data_url: z.string().optional(),
});

/** Generate a unique student code: STU-YYYYMM-XXXX. */
async function nextStudentCode(schoolId: string): Promise<string> {
  const supabase = await supabaseServer();
  const date = new Date();
  const prefix = `STU-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .ilike("student_code", `${prefix}%`);
  const next = (count ?? 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

export async function addStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(studentSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "create",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  const code = parsed.student_code ?? (await nextStudentCode(auth.active.school_id));

  // Persist photo if the form captured one (data URL from camera/file upload).
  const photoUrl =
    parsed.photo_data_url && parsed.photo_data_url.startsWith("data:")
      ? parsed.photo_data_url
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRow, error } = await (supabase as any)
    .from("students")
    .insert({
      school_id: auth.active.school_id,
      branch_id: parsed.branch_id ?? auth.active.branch_id,
      student_code: code,
      name_bn: parsed.name_bn,
      name_en: parsed.name_en ?? null,
      name_ar: parsed.name_ar ?? null,
      roll: parsed.roll ?? null,
      section_id: parsed.section_id ?? null,
      admission_date: parsed.admission_date ?? null,
      date_of_birth: parsed.date_of_birth ?? null,
      gender: parsed.gender ?? null,
      blood_group: parsed.blood_group ?? null,
      religion: parsed.religion ?? null,
      nid_birth_cert: parsed.nid_birth_cert ?? null,
      guardian_phone: parsed.guardian_phone ?? parsed.mother_phone ?? null,
      photo_url: photoUrl,
      address_present: parsed.address_present ?? null,
      address_permanent: parsed.address_permanent ?? null,
      previous_school: parsed.previous_school ?? null,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !studentRow) return fail(error?.message ?? "শিক্ষার্থী যোগ করা যায়নি।");

  // Father / primary guardian record
  if (parsed.guardian_name || parsed.guardian_phone) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_guardians").insert({
      student_id: studentRow.id,
      name_bn: parsed.guardian_name ?? "অভিভাবক",
      phone: parsed.guardian_phone ?? null,
      relation: parsed.guardian_relation === "mother" ? "mother" : "father",
      is_primary: parsed.guardian_relation !== "mother",
    });
  }

  // Mother record — separate from the primary guardian so SMS/contact can
  // resolve per role even when only one parent is the primary contact.
  if (parsed.mother_name || parsed.mother_phone) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_guardians").insert({
      student_id: studentRow.id,
      name_bn: parsed.mother_name ?? "মা",
      phone: parsed.mother_phone ?? null,
      relation: "mother",
      is_primary: parsed.guardian_relation === "mother",
    });
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "student",
    resourceId: studentRow.id,
    meta: { student_code: code, name_bn: parsed.name_bn },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/students`);
  return ok(
    { id: studentRow.id, code },
    `${parsed.name_bn} ভর্তি হয়েছে (${code})`,
    `/school/${parsed.schoolSlug}/admin/students/${studentRow.id}`,
  );
}

// -----------------------------------------------------------------
// Bulk import (Excel)
// -----------------------------------------------------------------

type BulkRow = {
  name_bn: string;
  name_en?: string;
  roll?: number | string;
  section_name?: string;
  class_name?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  guardian_phone?: string;
  guardian_name?: string;
  address_present?: string;
};

export async function bulkImportStudentsAction(
  schoolSlug: string,
  rows: BulkRow[],
): Promise<ActionResult<{ inserted: number; skipped: number; errors: string[] }>> {
  const auth = await authorizeAction({
    schoolSlug,
    action: "create",
    resource: "student",
  });
  type BulkResult = { inserted: number; skipped: number; errors: string[] };
  if ("error" in auth) return auth.error as ActionResult<BulkResult>;

  if (!Array.isArray(rows) || rows.length === 0) return fail<BulkResult>("ফাইলে কোন ছাত্র নেই।");
  if (rows.length > 2000) return fail<BulkResult>("একবারে ২,০০০ এর বেশি ছাত্র যোগ করা যাবে না।");

  const supabase = await supabaseServer();

  // Pre-load sections map for name→id resolution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sections } = await (supabase as any)
    .from("sections")
    .select("id, name, class_id, classes!inner(name_bn, name_en, school_id)")
    .eq("classes.school_id", auth.active.school_id);

  const sectionLookup = new Map<string, string>();
  (sections ?? []).forEach((s: { id: string; name: string; classes: { name_bn: string; name_en: string | null } }) => {
    const classKey = (s.classes.name_bn || s.classes.name_en || "").toLowerCase();
    const sectionKey = s.name.toLowerCase();
    sectionLookup.set(`${classKey}|${sectionKey}`, s.id);
    // also allow just section name when unambiguous
    if (!sectionLookup.has(sectionKey)) sectionLookup.set(sectionKey, s.id);
  });

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nameBn = (row.name_bn ?? "").toString().trim();
    if (nameBn.length < 2) {
      skipped++;
      errors.push(`Row ${i + 2}: name_bn অনুপস্থিত`);
      continue;
    }

    let sectionId: string | null = null;
    if (row.section_name) {
      const key = row.class_name
        ? `${row.class_name.toLowerCase()}|${row.section_name.toLowerCase()}`
        : row.section_name.toLowerCase();
      sectionId = sectionLookup.get(key) ?? null;
    }

    const code = await nextStudentCode(auth.active.school_id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("students").insert({
      school_id: auth.active.school_id,
      branch_id: auth.active.branch_id,
      student_code: code,
      name_bn: nameBn,
      name_en: row.name_en?.toString() ?? null,
      roll: row.roll ? Number(row.roll) : null,
      section_id: sectionId,
      date_of_birth: row.date_of_birth?.toString() || null,
      gender: row.gender ?? null,
      guardian_phone: row.guardian_phone?.toString() ?? null,
      address_present: row.address_present?.toString() ?? null,
      status: "active",
    });
    if (error) {
      skipped++;
      errors.push(`Row ${i + 2}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "bulk_create",
    resourceType: "student",
    meta: { inserted, skipped, total: rows.length },
  });
  revalidatePath(`/school/${schoolSlug}/admin/students`);
  return ok({ inserted, skipped, errors: errors.slice(0, 20) }, `${inserted} জন ভর্তি হয়েছে, ${skipped} জন বাদ পড়েছে।`);
}

// -----------------------------------------------------------------
// Student shift / transfer
// -----------------------------------------------------------------

const shiftSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
  to_section_id: z.string().uuid(),
  reason: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function shiftStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(shiftSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase as any)
    .from("students")
    .select("section_id, school_id")
    .eq("id", parsed.student_id)
    .single();
  if (!current || current.school_id !== auth.active.school_id) {
    return fail("এই শিক্ষার্থী এই স্কুলে নেই।");
  }

  // Log the shift
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("student_shifts").insert({
    student_id: parsed.student_id,
    from_section_id: current.section_id,
    to_section_id: parsed.to_section_id,
    reason: parsed.reason ?? null,
    shifted_by: auth.active.school_user_id,
  });

  // Move the student
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("students")
    .update({ section_id: parsed.to_section_id })
    .eq("id", parsed.student_id);
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "shift",
    resourceType: "student",
    resourceId: parsed.student_id,
    meta: { from_section_id: current.section_id, to_section_id: parsed.to_section_id },
  });

  revalidatePath(`/school/${parsed.schoolSlug}/admin/students/${parsed.student_id}`);
  return ok(undefined, "শিক্ষার্থী স্থানান্তর করা হয়েছে।");
}
