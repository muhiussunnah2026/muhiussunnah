/**
 * Bangla date formatting — with optional Hijri alongside Gregorian.
 *
 * FRONTEND_UX_GUIDE §6.4: standard school date "১৬ এপ্রিল ২০২৬, বৃহস্পতিবার";
 * madrasa tenants show Hijri alongside: "১৬ এপ্রিল ২০২৬ / ২৭ শাওয়াল ১৪৪৭ হি."
 *
 * For now Hijri is approximated using Intl.DateTimeFormat's islamic-umalqura
 * calendar. Moving to `moment-hijri` can come if higher precision is needed.
 */

import { localiseNumber } from "./number";

const banglaMonths = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
] as const;

const banglaWeekdays = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
] as const;

function toDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatBengaliDate(
  input: Date | string | number | null | undefined,
  options: { withWeekday?: boolean } = {},
): string {
  if (input === null || input === undefined) return "";
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return "";

  const day = localiseNumber(date.getDate(), "bn");
  const month = banglaMonths[date.getMonth()];
  const year = localiseNumber(date.getFullYear(), "bn");

  const base = `${day} ${month} ${year}`;
  if (!options.withWeekday) return base;

  const weekday = banglaWeekdays[date.getDay()];
  return `${base}, ${weekday}`;
}

export function formatHijriDate(input: Date | string | number | null | undefined, locale: "bn" | "en" | "ar" = "bn"): string {
  if (input === null || input === undefined) return "";
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return "";

  try {
    // Intl has islamic-umalqura (approximation). Precise would need moment-hijri.
    const hijri = new Intl.DateTimeFormat(
      locale === "ar" ? "ar-u-ca-islamic-umalqura" : locale === "bn" ? "bn-u-ca-islamic-umalqura" : "en-u-ca-islamic-umalqura",
      { day: "numeric", month: "long", year: "numeric" },
    ).format(date);
    return locale === "bn" ? `${hijri} হি.` : `${hijri} AH`;
  } catch {
    return "";
  }
}

export function formatDualDate(
  input: Date | string | number | null | undefined,
  options: { withWeekday?: boolean; withHijri?: boolean; locale?: "bn" | "en" | "ar" } = {},
): string {
  const { withWeekday = false, withHijri = false, locale = "bn" } = options;
  const greg = formatBengaliDate(input, { withWeekday });
  if (!withHijri) return greg;
  const hijri = formatHijriDate(input, locale);
  return hijri ? `${greg} / ${hijri}` : greg;
}

/** Relative time in Bangla: "৩ মিনিট আগে", "এক মাস আগে". */
export function formatRelative(input: Date | string | number | null | undefined, locale: "bn" | "en" | "ar" = "bn"): string {
  if (input === null || input === undefined) return "";
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return "";

  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  const absSec = Math.abs(diffSec);
  const units: [threshold: number, divisor: number, bn: string, en: string][] = [
    [60, 1, "সেকেন্ড", "second"],
    [3600, 60, "মিনিট", "minute"],
    [86400, 3600, "ঘণ্টা", "hour"],
    [604800, 86400, "দিন", "day"],
    [2_592_000, 604_800, "সপ্তাহ", "week"],
    [31_536_000, 2_592_000, "মাস", "month"],
    [Number.POSITIVE_INFINITY, 31_536_000, "বছর", "year"],
  ];

  for (const [threshold, divisor, bnLabel, enLabel] of units) {
    if (absSec < threshold) {
      const value = Math.max(1, Math.floor(absSec / divisor));
      if (locale === "bn") {
        return diffSec >= 0
          ? `${localiseNumber(value, "bn")} ${bnLabel} আগে`
          : `${localiseNumber(value, "bn")} ${bnLabel} পরে`;
      }
      if (locale === "ar") return new Intl.RelativeTimeFormat("ar").format(-Math.sign(diffSec) * value, enLabel as Intl.RelativeTimeFormatUnit);
      return new Intl.RelativeTimeFormat("en").format(-Math.sign(diffSec) * value, enLabel as Intl.RelativeTimeFormatUnit);
    }
  }
  return "";
}
