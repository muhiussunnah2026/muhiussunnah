"use server";

/**
 * Student admission, bulk import, shift/transfer, per-student ledger helpers.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  class_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
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
  extra_guardian_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  extra_guardian_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  extra_guardian_relation: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  address_present: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  address_permanent: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  previous_school: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  photo_data_url: z.string().optional(),
  session_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  session_name_new: z
    .string()
    .trim()
    .max(60)
    // Normalise the "2025-12026" concatenation bug if it ever slips through.
    .transform((raw) => {
      if (!raw) return raw;
      const m = /^(\d{4})[-–](\d{5})$/.exec(raw);
      if (m && m[2].startsWith("1")) return `${m[1]}-${m[2].slice(1)}`;
      return raw;
    })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  rf_id_card: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  admission_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
  tuition_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
  transport_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
});

/**
 * Resolve the 4-digit class prefix for student codes.
 *
 * Format: `2025 + class.display_order`. So Class 1 → 2026, Class 2 →
 * 2027, … Class N → 2025+N. This matches the user's ask ("class one er
 * roll ek er code hobe 202601") while staying numeric + predictable.
 *
 * Falls back to 2000 when we can't resolve a class (e.g. section id
 * missing). The downstream code will still dedupe by serial.
 */
async function classCodePrefix(
  sectionId: string | null | undefined,
): Promise<number> {
  if (!sectionId) return 2000;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("sections")
    .select("classes ( display_order )")
    .eq("id", sectionId)
    .maybeSingle();
  const order = (data?.classes?.display_order as number | undefined) ?? 1;
  return 2025 + order;
}

/**
 * Next unique student code in "PPPPSS" shape (6 digits): 4-digit class
 * prefix + 2-digit serial within that class. Accepts an optional
 * `avoid` set so repeated callers can skip codes known to collide.
 */
async function nextStudentCode(
  schoolId: string,
  sectionId: string | null | undefined,
  avoid: Set<string> = new Set(),
): Promise<string> {
  const supabase = await supabaseServer();
  const prefix = await classCodePrefix(sectionId);
  const prefixStr = String(prefix);

  // Find the highest existing code for this prefix in this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("students")
    .select("student_code")
    .eq("school_id", schoolId)
    .like("student_code", `${prefixStr}%`)
    .order("student_code", { ascending: false })
    .limit(50);

  let nextSerial = 1;
  const used = new Set<number>();
  for (const row of (existing ?? []) as { student_code: string | null }[]) {
    const c = row.student_code ?? "";
    if (!c.startsWith(prefixStr)) continue;
    const suffix = c.slice(prefixStr.length);
    const n = parseInt(suffix, 10);
    if (Number.isFinite(n) && n > 0) used.add(n);
  }
  if (used.size > 0) nextSerial = Math.max(...used) + 1;

  // Skip over codes the caller has told us collide (used for retry loop).
  while (avoid.has(`${prefixStr}${String(nextSerial).padStart(2, "0")}`)) {
    nextSerial++;
  }

  // Pad to at least 2 digits (so the code is always ≥ 6 chars). Grows
  // automatically past 99 students/class without truncation.
  const serialStr = String(nextSerial).padStart(2, "0");
  return `${prefixStr}${serialStr}`;
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
  // Code is resolved AFTER section is resolved, below (so we can key it to
  // the class).

  // Resolve session_id. If the form typed a brand-new session name (not in
  // academic_years yet) we create that row first and use the resulting id.
  let resolvedSessionId: string | null = parsed.session_id ?? null;
  if (!resolvedSessionId && parsed.session_name_new) {
    // Match an existing year by name first (case-insensitive) so we never
    // duplicate sessions like "2026-2027" / "2026-2027".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingYear } = await (supabase as any)
      .from("academic_years")
      .select("id")
      .eq("school_id", auth.active.school_id)
      .ilike("name", parsed.session_name_new)
      .maybeSingle();
    if (existingYear?.id) {
      resolvedSessionId = existingYear.id as string;
    } else {
      // Create the new year. Use today as start_date and +365 days as
      // end_date so RLS/constraints are satisfied; admins can refine the
      // exact dates later in the Academic Years page.
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newYear } = await (supabase as any)
        .from("academic_years")
        .insert({
          school_id: auth.active.school_id,
          name: parsed.session_name_new,
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
          is_active: false,
        })
        .select("id")
        .single();
      if (newYear?.id) resolvedSessionId = newYear.id as string;
    }
  }

  // Resolve section_id. If the form didn't pick one explicitly, fall back to
  // the first section of the chosen class. If the class somehow has no
  // sections (legacy / race), create a default "ক" section on the fly so
  // enrollment never blocks on admin plumbing.
  let resolvedSectionId: string | null = parsed.section_id ?? null;
  if (!resolvedSectionId && parsed.class_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: firstSection } = await (supabase as any)
      .from("sections")
      .select("id")
      .eq("class_id", parsed.class_id)
      .order("name", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstSection?.id) {
      resolvedSectionId = firstSection.id as string;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created } = await (supabase as any)
        .from("sections")
        .insert({ class_id: parsed.class_id, name: "ক", capacity: null })
        .select("id")
        .single();
      resolvedSectionId = (created?.id as string) ?? null;
    }
  }

  // Persist photo if the form captured one (data URL from camera/file upload).
  const photoUrl =
    parsed.photo_data_url && parsed.photo_data_url.startsWith("data:")
      ? parsed.photo_data_url
      : null;

  // Empty-string → null normalization for DATE columns. Zod's
  // z.string().optional().or(...) pattern doesn't catch "" because
  // z.string() accepts empty strings first — so empty DATE fields
  // reached postgres as "" and crashed with "invalid input syntax for
  // type date". Fix at the insert boundary.
  const cleanDate = (v: string | undefined): string | null =>
    v && v.trim() !== "" ? v : null;

  // Generate a class-keyed student code (6-digit class prefix + serial).
  // Caller can override via parsed.student_code (manual admin edit).
  let code = parsed.student_code && parsed.student_code.trim().length > 0
    ? parsed.student_code.trim()
    : await nextStudentCode(auth.active.school_id, resolvedSectionId);

  // Build the insert payload. Extended fields from migration 0019
  // (session_id, rf_id_card, admission_fee, tuition_fee, transport_fee) are
  // optional on the type — if that migration hasn't been applied to the
  // target project yet we retry without them so the core insert still
  // succeeds.
  const baseInsert = {
    school_id: auth.active.school_id,
    branch_id: parsed.branch_id ?? auth.active.branch_id,
    student_code: code,
    name_bn: parsed.name_bn,
    name_en: parsed.name_en ?? null,
    name_ar: parsed.name_ar ?? null,
    roll: parsed.roll ?? null,
    section_id: resolvedSectionId,
    admission_date: cleanDate(parsed.admission_date),
    date_of_birth: cleanDate(parsed.date_of_birth),
    gender: parsed.gender ?? null,
    blood_group: parsed.blood_group ?? null,
    religion: parsed.religion ?? null,
    nid_birth_cert: parsed.nid_birth_cert ?? null,
    guardian_phone: parsed.guardian_phone ?? parsed.mother_phone ?? null,
    photo_url: photoUrl,
    address_present: parsed.address_present ?? null,
    address_permanent: parsed.address_permanent ?? null,
    previous_school: parsed.previous_school ?? null,
    status: "active" as const,
  };
  const extended: Record<string, unknown> = {};
  if (resolvedSessionId) extended.session_id = resolvedSessionId;
  if (parsed.rf_id_card) extended.rf_id_card = parsed.rf_id_card;
  if (parsed.admission_fee !== undefined) extended.admission_fee = parsed.admission_fee;
  if (parsed.tuition_fee !== undefined) extended.tuition_fee = parsed.tuition_fee;
  if (parsed.transport_fee !== undefined) extended.transport_fee = parsed.transport_fee;

  // Insert with up to 4 automatic retries if the auto-generated student
  // code happens to collide with an existing row (race between multiple
  // admins admitting simultaneously, or historical data gaps the counter
  // didn't see). Each retry generates a fresh serial, skipping known
  // collisions.
  const collided = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    baseInsert.student_code = code;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res = await (supabase as any)
      .from("students")
      .insert({ ...baseInsert, ...extended })
      .select("id")
      .single();

    // Column-missing retry (0019 not applied yet): drop extended fields.
    if (
      res.error &&
      /column .*(session_id|rf_id_card|admission_fee|tuition_fee|transport_fee)/i.test(res.error.message ?? "")
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res = await (supabase as any)
        .from("students")
        .insert(baseInsert)
        .select("id")
        .single();
    }

    // Duplicate student_code retry.
    if (
      res.error &&
      /duplicate key value .*students_school_id_student_code_key/i.test(res.error.message ?? "")
    ) {
      collided.add(code);
      code = await nextStudentCode(auth.active.school_id, resolvedSectionId, collided);
      continue;
    }
    break;
  }
  const { data: studentRow, error } = res;
  if (error || !studentRow) return fail(error?.message ?? "শিক্ষার্থী যোগ করা যায়নি।");

  // Guardian inserts go through the ADMIN client because the RLS policy
  // on student_guardians is tighter than the user's own token — the
  // user-token insert silently failed for some tenants, which is why
  // the detail page showed "no guardian record" after the form was
  // submitted.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // Father / primary guardian record
  if (parsed.guardian_name || parsed.guardian_phone) {
    await admin.from("student_guardians").insert({
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
    await admin.from("student_guardians").insert({
      student_id: studentRow.id,
      name_bn: parsed.mother_name ?? "মা",
      phone: parsed.mother_phone ?? null,
      relation: "mother",
      is_primary: parsed.guardian_relation === "mother",
    });
  }

  // Extra guardian — for children staying with uncles / aunts / grandparents
  // when both parents are not the primary caregiver. Relation is free text
  // so the admin can capture culturally-specific roles (চাচা, মামা, ফুপা,
  // দাদা, নানা, খালা, etc.).
  if (parsed.extra_guardian_name || parsed.extra_guardian_phone) {
    await admin.from("student_guardians").insert({
      student_id: studentRow.id,
      name_bn: parsed.extra_guardian_name ?? "অভিভাবক",
      phone: parsed.extra_guardian_phone ?? null,
      relation: parsed.extra_guardian_relation ?? "guardian",
      is_primary: false,
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

  revalidatePath(`/students`);
  return ok(
    { id: studentRow.id, code },
    `${parsed.name_bn} ভর্তি হয়েছে (${code})`,
    `/students/${studentRow.id}`,
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

    const code = await nextStudentCode(auth.active.school_id, sectionId);
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
  revalidatePath(`/students`);
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

  revalidatePath(`/students/${parsed.student_id}`);
  return ok(undefined, "শিক্ষার্থী স্থানান্তর করা হয়েছে।");
}

// ---------------------------------------------------------------------------
// Update student — core editable fields. Guardian + section changes go
// through their own dedicated actions (transfer form, guardian card).
// ---------------------------------------------------------------------------

const updateStudentSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
  // class / section — inline edit (no more separate shift form for
  // simple reassignments)
  class_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  section_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  // identity
  student_code: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  name_bn: z.string().trim().min(2).max(200),
  name_en: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  name_ar: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  roll: z.coerce.number().int().min(0).max(99999).optional().or(z.literal("").transform(() => undefined)),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("").transform(() => undefined)),
  religion: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  blood_group: z.string().trim().max(10).optional().or(z.literal("").transform(() => undefined)),
  date_of_birth: z.string().optional().or(z.literal("").transform(() => undefined)),
  admission_date: z.string().optional().or(z.literal("").transform(() => undefined)),
  nid_birth_cert: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  rf_id_card: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  photo_data_url: z.string().optional(),
  // contact + guardians
  guardian_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  guardian_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  guardian_relation: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  mother_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  mother_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  extra_guardian_name: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  extra_guardian_phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  extra_guardian_relation: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  address_present: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  address_permanent: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  previous_school: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  // fees
  admission_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
  tuition_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
  transport_fee: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["active", "transferred", "passed_out", "dropped", "suspended"]).optional(),
});

export async function updateStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(updateStudentSchema, formData);
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
    .select("school_id, student_code, section_id")
    .eq("id", parsed.student_id)
    .single();
  if (!current || current.school_id !== auth.active.school_id) {
    return fail("এই শিক্ষার্থী এই স্কুলে নেই।");
  }

  // Self-heal: if the row somehow has no student_code (legacy import,
  // pre-v2 admission, etc.), auto-generate one on the next edit so the
  // admin doesn't have to think about it.
  if ((!current.student_code || current.student_code.trim().length === 0) && !parsed.student_code) {
    parsed.student_code = await nextStudentCode(
      auth.active.school_id,
      current.section_id ?? null,
    );
  }

  const {
    schoolSlug: _ignoreSlug,
    student_id: _ignoreId,
    // Guardians go into student_guardians via upsert; photo goes into
    // students.photo_url. Extract them from the generic field-update set.
    photo_data_url,
    guardian_name,
    guardian_phone,
    guardian_relation,
    mother_name,
    mother_phone,
    extra_guardian_name,
    extra_guardian_phone,
    extra_guardian_relation,
    // class_id isn't a students column — it's resolved to a section_id.
    class_id,
    ...rawUpdate
  } = parsed;

  // If the form picked a class_id but no explicit section_id, resolve
  // to the first section of that class. If the class has no sections,
  // create a default "ক" section on the fly — via the ADMIN client
  // because RLS on sections doesn't allow user-session inserts for
  // some tenants, which was silently causing the class assignment to
  // stick as nothing on the student row.
  if (class_id && !rawUpdate.section_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminSec = supabaseAdmin() as any;
    const { data: firstSection } = await adminSec
      .from("sections")
      .select("id")
      .eq("class_id", class_id)
      .order("name", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstSection?.id) {
      rawUpdate.section_id = firstSection.id as string;
    } else {
      const { data: created } = await adminSec
        .from("sections")
        .insert({ class_id, name: "ক", capacity: null })
        .select("id")
        .single();
      if (created?.id) rawUpdate.section_id = created.id as string;
    }
  }

  // Drop undefined keys so we don't overwrite existing values with nulls.
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawUpdate)) {
    if (v !== undefined) update[k] = v;
  }

  // Empty-string date fields → null (postgres DATE doesn't accept "").
  const dateKeys = ["admission_date", "date_of_birth"] as const;
  for (const k of dateKeys) {
    const v = update[k];
    if (typeof v === "string" && v.trim() === "") update[k] = null;
  }

  // Photo handling: data URL → store inline, "__REMOVE__" → clear, empty/undefined → leave alone.
  if (photo_data_url === "__REMOVE__") {
    update.photo_url = null;
  } else if (photo_data_url && photo_data_url.startsWith("data:image/")) {
    update.photo_url = photo_data_url;
  }

  // Also keep students.guardian_phone in sync with the primary guardian phone
  // so the list view + SMS module don't need a join.
  if (guardian_phone !== undefined) update.guardian_phone = guardian_phone;

  // Some installs are on older migrations that lack the Tier-2 columns.
  // If the update fails with "column ... does not exist" we retry without
  // those optional fields so the core form still saves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { error } = await (supabase as any)
    .from("students")
    .update(update)
    .eq("id", parsed.student_id);

  if (error && /column .*(rf_id_card|admission_fee|tuition_fee|transport_fee|name_ar)/i.test(error.message ?? "")) {
    const safe = { ...update };
    delete safe.rf_id_card;
    delete safe.admission_fee;
    delete safe.tuition_fee;
    delete safe.transport_fee;
    delete safe.name_ar;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retry = await (supabase as any)
      .from("students")
      .update(safe)
      .eq("id", parsed.student_id);
    error = retry.error;
  }

  if (error) return fail(error.message);

  // Guardians: upsert father / mother / extra rows by relation type so
  // editing doesn't pile up duplicate records. Use the ADMIN client
  // because student_guardians RLS is stricter than the user's own
  // session can modify — using the user client here silently failed
  // for some tenants, hence "no guardian record" on the detail page
  // even after the form was submitted.
  const studentId = parsed.student_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  async function upsertGuardian(
    name: string | undefined,
    phone: string | undefined,
    relation: string,
    isPrimary: boolean,
  ) {
    if (name === undefined && phone === undefined) return;
    const { data: existing } = await admin
      .from("student_guardians")
      .select("id")
      .eq("student_id", studentId)
      .eq("relation", relation)
      .maybeSingle();

    if (existing?.id) {
      const patch: Record<string, unknown> = {};
      if (name !== undefined) patch.name_bn = name || "অভিভাবক";
      if (phone !== undefined) patch.phone = phone || null;
      patch.is_primary = isPrimary;
      await admin.from("student_guardians").update(patch).eq("id", existing.id);
    } else if (name || phone) {
      await admin.from("student_guardians").insert({
        student_id: studentId,
        name_bn: name || "অভিভাবক",
        phone: phone || null,
        relation,
        is_primary: isPrimary,
      });
    }
  }

  const primaryRelation = guardian_relation === "mother" ? "mother" : "father";
  await upsertGuardian(
    guardian_name,
    guardian_phone,
    primaryRelation,
    primaryRelation === "father" || guardian_relation === "father",
  );
  await upsertGuardian(mother_name, mother_phone, "mother", guardian_relation === "mother");
  if (extra_guardian_name || extra_guardian_phone) {
    const rel = extra_guardian_relation?.trim() || "other";
    await upsertGuardian(extra_guardian_name, extra_guardian_phone, rel, false);
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "update",
    resourceType: "student",
    resourceId: parsed.student_id,
    meta: { name_bn: parsed.name_bn },
  });

  revalidatePath(`/students/${parsed.student_id}`);
  revalidatePath("/students");
  return ok(undefined, "শিক্ষার্থী আপডেট হয়েছে।");
}

// ---------------------------------------------------------------------------
// Delete student — soft delete via status = 'dropped'.
// We never hard-delete because attendance, ledger, exam marks, etc. reference
// the student by id; removing the row would orphan history.
// ---------------------------------------------------------------------------

const deleteStudentSchema = z.object({
  schoolSlug: z.string().min(1),
  student_id: z.string().uuid(),
});

export async function deleteStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(deleteStudentSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "delete",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase as any)
    .from("students")
    .select("school_id, name_bn, status")
    .eq("id", parsed.student_id)
    .single();
  if (!current || current.school_id !== auth.active.school_id) {
    return fail("এই শিক্ষার্থী এই স্কুলে নেই।");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("students")
    .update({ status: "dropped" })
    .eq("id", parsed.student_id);
  if (error) return fail(error.message);

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "delete",
    resourceType: "student",
    resourceId: parsed.student_id,
    meta: { name_bn: current.name_bn, previous_status: current.status },
  });

  revalidatePath("/students", "layout");
  return ok(undefined, `${current.name_bn} এর রেকর্ড মুছে ফেলা হয়েছে।`);
}

// ---------------------------------------------------------------------------
// PERMANENT delete — hard DELETE FROM students (also deletes dependent
// guardians). Use with caution: history (attendance, marks, ledger) is
// preserved in those tables but the student row itself is gone forever.
// Uses the admin client so cascading through stricter RLS tables is
// allowed.
// ---------------------------------------------------------------------------

export async function permanentDeleteStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(deleteStudentSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "delete",
    resource: "student",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase as any)
    .from("students")
    .select("school_id, name_bn, student_code")
    .eq("id", parsed.student_id)
    .single();
  if (!current || current.school_id !== auth.active.school_id) {
    return fail("এই শিক্ষার্থী এই স্কুলে নেই।");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // Delete children we can safely nuke — guardians are purely a join
  // table with no independent meaning. Attendance / marks / ledger we
  // leave alone because RLS blocks the admin-client delete path for
  // those, and an admin might need the historical record. If the
  // students table has ON DELETE RESTRICT FKs this will error out with
  // a clear message.
  await admin.from("student_guardians").delete().eq("student_id", parsed.student_id);

  const { error } = await admin.from("students").delete().eq("id", parsed.student_id);
  if (error) {
    return fail(
      `স্থায়ীভাবে মুছা সম্ভব হয়নি: ${error.message}। প্রথমে উপস্থিতি / মার্ক / লেজার মুছুন অথবা শুধু "বাদ দিন" ব্যবহার করুন।`,
    );
  }

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "permanent_delete",
    resourceType: "student",
    resourceId: parsed.student_id,
    meta: { name_bn: current.name_bn, student_code: current.student_code },
  });

  revalidatePath("/students", "layout");
  return ok(
    undefined,
    `${current.name_bn} স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
  );
}
