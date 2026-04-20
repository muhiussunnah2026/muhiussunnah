import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Idempotently seed a default "ক" section for every class in this school
 * that currently has none. React cache() dedupes the call per request so
 * visiting classes → students → students/new does not trigger three
 * scans. Fail-soft: any error is swallowed; the caller's downstream UI
 * already handles the "no sections yet" empty state.
 */
export const ensureDefaultSections = cache(async (schoolId: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin() as any;
    const { data: classes } = await admin
      .from("classes")
      .select("id, sections(id)")
      .eq("school_id", schoolId);
    const orphans = (classes ?? []).filter(
      (c: { id: string; sections: unknown[] | null }) =>
        !c.sections || c.sections.length === 0,
    );
    if (orphans.length === 0) return;
    await admin.from("sections").insert(
      orphans.map((c: { id: string }) => ({
        class_id: c.id,
        name: "ক",
        capacity: null,
      })),
    );
  } catch {
    // non-fatal
  }
});
