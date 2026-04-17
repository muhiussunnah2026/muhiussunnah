/**
 * i18n configuration.
 *
 * Supported locales: bn (default), en, ur, ar.
 * Urdu and Arabic are RTL.
 *
 * Cookie-based locale switching (no URL prefix) — our routes already
 * carry tenant slugs, so adding a locale prefix would bloat URLs.
 */

export const locales = ["bn", "en", "ur", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bn";

export const localeCookieName = "shikkha-locale";

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  bn: "ltr",
  en: "ltr",
  ur: "rtl",
  ar: "rtl",
};

export const localeDisplayName: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
  ur: "اردو",
  ar: "العربية",
};

export const localeFlag: Record<Locale, string> = {
  bn: "🇧🇩",
  en: "🇬🇧",
  ur: "🇵🇰",
  ar: "🇸🇦",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
