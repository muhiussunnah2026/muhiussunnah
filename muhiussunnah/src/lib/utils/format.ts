/**
 * Display formatters for money, percentages, and counts.
 *
 * Bangladesh convention: Indian numbering (lakh / crore) with the ৳ symbol,
 * Bangla digits on display. Keep raw numbers in state; format at the edge.
 */

import { localiseNumber, type toBengaliNumber } from "./number";

type Locale = "bn" | "en" | "ar";

/** ৳ 1,23,45,678 — Indian grouping, Bangla digits. */
export function formatTaka(
  amount: number | string | null | undefined,
  locale: Locale = "bn",
  options: { withSymbol?: boolean; compact?: boolean } = {},
): string {
  const { withSymbol = true, compact = false } = options;
  if (amount === null || amount === undefined || amount === "") return "";

  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "";

  let display: string;
  if (compact) {
    if (Math.abs(n) >= 10_000_000) display = `${(n / 10_000_000).toFixed(2)} ক.`;
    else if (Math.abs(n) >= 100_000) display = `${(n / 100_000).toFixed(2)} লা.`;
    else if (Math.abs(n) >= 1_000) display = `${(n / 1_000).toFixed(1)}হা.`;
    else display = n.toString();
  } else {
    // Indian number grouping: last 3, then groups of 2
    display = n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  const localised = localiseNumber(display.replace(/[-.]/g, (c) => c), locale);
  // localiseNumber only swaps digits 0-9, punctuation is preserved
  const final = localiseNumber(display, locale);
  void localised;

  return withSymbol ? `৳ ${final}` : final;
}

/** 94.3% → ৯৪.৩% */
export function formatPercent(value: number | string | null | undefined, locale: Locale = "bn", decimals = 1): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";
  return `${localiseNumber(n.toFixed(decimals), locale)}%`;
}

/** Simple count with thousand separators. 1,248 → ১,২৪৮ */
export function formatCount(value: number | string | null | undefined, locale: Locale = "bn"): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";
  return localiseNumber(n.toLocaleString("en-IN"), locale);
}

/** Signed trend: +4.2% / -2.1% (for metric cards) */
export function formatTrend(delta: number | null | undefined, locale: Locale = "bn", decimals = 1): string {
  if (delta === null || delta === undefined) return "";
  if (!Number.isFinite(delta)) return "";
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "";
  return `${sign}${localiseNumber(delta.toFixed(decimals), locale)}%`;
}

// keep the import referenced
export type _ = typeof toBengaliNumber;
