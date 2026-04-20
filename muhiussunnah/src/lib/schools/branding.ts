import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * School branding/display-preference fetcher, deduplicated per request via
 * React's cache(). Multiple components can call it in the same request
 * without firing multiple Supabase round-trips.
 */
export const getSchoolBranding = cache(async (schoolId: string) => {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select(
      "id, name_bn, name_en, name_ar, address, phone, email, website, logo_url, display_name_locale, header_display_fields",
    )
    .eq("id", schoolId)
    .maybeSingle();

  return (data ?? null) as {
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
  } | null;
});
