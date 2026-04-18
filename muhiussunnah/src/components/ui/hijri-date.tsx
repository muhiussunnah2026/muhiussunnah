/**
 * <HijriDate> — Hijri (Islamic Umm al-Qura) calendar date display.
 *
 * Server component. For dual display next to Gregorian, use
 * <BengaliDate withHijri /> which calls the same underlying helper.
 */

import { formatHijriDate } from "@/lib/utils/date";

type Props = {
  value: Date | string | number | null | undefined;
  locale?: "bn" | "en" | "ar";
  className?: string;
};

export function HijriDate({ value, locale = "bn", className }: Props) {
  return <span className={className}>{formatHijriDate(value, locale)}</span>;
}
