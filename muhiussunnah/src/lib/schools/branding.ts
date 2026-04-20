import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export type SchoolBranding = {
  id: string;
  name_bn: string;
  name_en: string | null;
  name_ar: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  display_name_locale: "bn" | "en" | null;
  header_display_fields: string | null;
};

const BRANDING_COLS =
  "id, name_bn, name_en, name_ar, address, phone, email, website, logo_url, display_name_locale, header_display_fields";

/**
 * Internal: the actual Supabase query (no caching). Exposed through the
 * two wrappers below.
 */
async function fetchBrandingById(schoolId: string): Promise<SchoolBranding | null> {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select(BRANDING_COLS)
    .eq("id", schoolId)
    .maybeSingle();
  return (data ?? null) as SchoolBranding | null;
}

async function fetchBrandingBySlug(slug: string): Promise<SchoolBranding | null> {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select(BRANDING_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as SchoolBranding | null;
}

/**
 * School branding — server-cached for 60s per schoolId.
 *
 * Two layers:
 *   1. React `cache()` — deduplicates within a single request tree.
 *   2. Next `unstable_cache` — caches across requests/users for 60s,
 *      so the dashboard layout doesn't hit Supabase on every click
 *      when the user is navigating sidebar links.
 *
 * Tagged with `school-branding-${schoolId}` so settings changes can
 * invalidate via `revalidateTag()` immediately.
 */
export const getSchoolBranding = cache(async (schoolId: string): Promise<SchoolBranding | null> => {
  const cached = unstable_cache(
    () => fetchBrandingById(schoolId),
    ["school-branding-by-id", schoolId],
    { revalidate: 60, tags: [`school-branding-${schoolId}`] },
  );
  return cached();
});

/**
 * Slug-based variant. Same caching strategy.
 */
export const getSchoolBrandingBySlug = cache(async (slug: string): Promise<SchoolBranding | null> => {
  const cached = unstable_cache(
    () => fetchBrandingBySlug(slug),
    ["school-branding-by-slug", slug],
    { revalidate: 60, tags: [`school-branding-slug-${slug}`] },
  );
  return cached();
});
