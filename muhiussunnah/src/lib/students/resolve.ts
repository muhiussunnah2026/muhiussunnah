import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a `/students/[id]` URL segment to the real DB UUID. The
 * segment can be either:
 *   • a raw UUID (legacy + direct links), or
 *   • a human-readable student_code like "202601" (what the UI now
 *     emits in hrefs — way nicer to look at in the address bar).
 *
 * Returns the UUID if found in the given school, otherwise null.
 */
export async function resolveStudentId(
  idOrCode: string,
  schoolId: string,
): Promise<string | null> {
  const supabase = await supabaseServer();

  // If it already looks like a UUID, trust it. We still constrain by
  // school_id to avoid cross-tenant leaks.
  if (UUID_RE.test(idOrCode)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("students")
      .select("id")
      .eq("id", idOrCode)
      .eq("school_id", schoolId)
      .maybeSingle();
    if (data?.id) return data.id as string;
    // Fall through — maybe it's a code that happens to match the UUID
    // format (extremely unlikely for our 6-digit format, but safe).
  }

  // Look up by student_code (unique per school).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: byCode } = await (supabase as any)
    .from("students")
    .select("id")
    .eq("student_code", idOrCode)
    .eq("school_id", schoolId)
    .maybeSingle();
  return byCode?.id ?? null;
}
