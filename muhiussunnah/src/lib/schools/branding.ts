import { cache } from "react";
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
 * School branding/display-preference fetcher by school UUID.
 * Deduplicated per request via React's cache() so multiple components
 * in the same render tree share a single Supabase round-trip.
 */
export const getSchoolBranding = cache(async (schoolId: string): Promise<SchoolBranding | null> => {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select(BRANDING_COLS)
    .eq("id", schoolId)
    .maybeSingle();
  return (data ?? null) as SchoolBranding | null;
});

/**
 * Slug-based variant — lets the admin layout start the branding query
 * in parallel with `requireRole()` (which needs the DB to resolve the
 * user's memberships before we know the school_id). Shaves ~300ms off
 * every dashboard navigation by collapsing two sequential round-trips
 * into one concurrent pair.
 */
export const getSchoolBrandingBySlug = cache(async (slug: string): Promise<SchoolBranding | null> => {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select(BRANDING_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as SchoolBranding | null;
});
