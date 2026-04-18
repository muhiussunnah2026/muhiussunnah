/**
 * <BanglaDigit> — auto-converts English → Bangla digits for display.
 *
 * FRONTEND_UX_GUIDE §6.3 rule: numbers stored in English, shown in Bangla.
 * Use this wrapper everywhere a number hits the screen.
 *
 * Safe to use as a Server Component.
 */

import { localiseNumber } from "@/lib/utils/number";

type Props = {
  value: string | number | null | undefined;
  locale?: "bn" | "en" | "ar";
  className?: string;
};

export function BanglaDigit({ value, locale = "bn", className }: Props) {
  return <span className={className}>{localiseNumber(value, locale)}</span>;
}
