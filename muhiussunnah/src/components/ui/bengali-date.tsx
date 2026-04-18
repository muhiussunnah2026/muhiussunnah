/**
 * <BengaliDate> — Bangla-formatted date with optional Hijri.
 *
 * FRONTEND_UX_GUIDE §6.4 rule: dual calendar for madrasa tenants.
 */

import { formatDualDate } from "@/lib/utils/date";

type Props = {
  value: Date | string | number | null | undefined;
  withWeekday?: boolean;
  withHijri?: boolean;
  locale?: "bn" | "en" | "ar";
  className?: string;
};

export function BengaliDate({ value, withWeekday, withHijri, locale = "bn", className }: Props) {
  return (
    <span className={className}>
      {formatDualDate(value, { withWeekday, withHijri, locale })}
    </span>
  );
}
