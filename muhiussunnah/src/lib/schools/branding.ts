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
 * School branding fetcher.
 *
 * NOTE: Previously this used `unstable_cache` for cross-request caching,
 * but `unstable_cache` can't wrap functions that access `cookies()` —
 * Next.js throws a "DynamicServerError: Route couldn't be rendered
 * statically" and the page serves a 500. Our `supabaseServer()` helper
 * reads cookies (it must — that's how auth context flows). So we fall
 * back to React `cache()` alone, which deduplicates within a single
 * request. Cross-request caching can be added later via a dedicated
 * anon-key Supabase client that doesn't read cookies.
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
