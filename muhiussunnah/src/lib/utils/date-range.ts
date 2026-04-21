/**
 * Dashboard date-range helpers.
 *
 * Parses the ?range / ?from / ?to query params into a well-defined
 * { from, to, prevFrom, prevTo, label } struct so the server page can
 * run both current-period and prior-period queries in parallel and
 * compute trend deltas.
 */

export type RangePreset =
  | "today"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "365d"
  | "yoy"
  | "custom";

export type ResolvedRange = {
  preset: RangePreset;
  label: string;
  from: string; // ISO yyyy-mm-dd
  to: string;
  prevFrom: string;
  prevTo: string;
  prevLabel: string; // "আগের ৩০ দিন", "গত বছর" etc.
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Parse the URL search params into a concrete date range. Defaults to
 * last-30-days when nothing is provided so the dashboard has sensible
 * numbers on first load.
 */
export function resolveDateRange(search: {
  range?: string;
  from?: string;
  to?: string;
}): ResolvedRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const preset = (search.range as RangePreset) || "30d";

  // ── Custom range ───────────────────────────────────────────
  if (preset === "custom" && search.from && search.to) {
    const from = new Date(search.from + "T00:00:00");
    const to = new Date(search.to + "T00:00:00");
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    return {
      preset: "custom",
      label: `${search.from} → ${search.to}`,
      from: iso(from),
      to: iso(to),
      prevFrom: iso(addDays(from, -days)),
      prevTo: iso(addDays(from, -1)),
      prevLabel: `আগের ${days} দিন`,
    };
  }

  // ── Year-over-year (this year vs last year, same day-of-year) ──
  if (preset === "yoy") {
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const prevYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const prevYearSameDay = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return {
      preset: "yoy",
      label: "এই বছর (আজ পর্যন্ত)",
      from: iso(yearStart),
      to: iso(today),
      prevFrom: iso(prevYearStart),
      prevTo: iso(prevYearSameDay),
      prevLabel: "গত বছরের একই সময়",
    };
  }

  // ── Preset helpers ─────────────────────────────────────────
  const mkWindow = (days: number, label: string, prevLabel: string): ResolvedRange => {
    const from = addDays(today, -(days - 1));
    return {
      preset,
      label,
      from: iso(from),
      to: iso(today),
      prevFrom: iso(addDays(from, -days)),
      prevTo: iso(addDays(from, -1)),
      prevLabel,
    };
  };

  switch (preset) {
    case "today":
      return {
        preset,
        label: "আজ",
        from: iso(today),
        to: iso(today),
        prevFrom: iso(addDays(today, -1)),
        prevTo: iso(addDays(today, -1)),
        prevLabel: "গতকাল",
      };

    case "7d":
      return mkWindow(7, "গত ৭ দিন", "আগের ৭ দিন");

    case "30d":
      return mkWindow(30, "গত ৩০ দিন", "আগের ৩০ দিন");

    case "365d":
      return mkWindow(365, "গত ৩৬৫ দিন", "আগের ৩৬৫ দিন");

    case "this_month": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        preset,
        label: "এই মাস",
        from: iso(from),
        to: iso(today),
        prevFrom: iso(prevMonthStart),
        prevTo: iso(prevMonthEnd),
        prevLabel: "গত মাস",
      };
    }

    case "last_month": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
      const prevFrom = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const prevTo = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      return {
        preset,
        label: "গত মাস",
        from: iso(from),
        to: iso(to),
        prevFrom: iso(prevFrom),
        prevTo: iso(prevTo),
        prevLabel: "তার আগের মাস",
      };
    }

    case "this_year": {
      const from = new Date(today.getFullYear(), 0, 1);
      const prevFrom = new Date(today.getFullYear() - 1, 0, 1);
      const prevTo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      return {
        preset,
        label: "এই বছর",
        from: iso(from),
        to: iso(today),
        prevFrom: iso(prevFrom),
        prevTo: iso(prevTo),
        prevLabel: "গত বছর (একই সময় পর্যন্ত)",
      };
    }

    case "last_year": {
      const from = new Date(today.getFullYear() - 1, 0, 1);
      const to = new Date(today.getFullYear() - 1, 11, 31);
      const prevFrom = new Date(today.getFullYear() - 2, 0, 1);
      const prevTo = new Date(today.getFullYear() - 2, 11, 31);
      return {
        preset,
        label: "গত বছর",
        from: iso(from),
        to: iso(to),
        prevFrom: iso(prevFrom),
        prevTo: iso(prevTo),
        prevLabel: "তার আগের বছর",
      };
    }

    default:
      return mkWindow(30, "গত ৩০ দিন", "আগের ৩০ দিন");
  }
}

/**
 * Compute trend % between current and previous period values.
 * Returns null when previous is 0 and current is also 0 (no signal).
 * When previous is 0 and current is > 0, returns 100 (new activity).
 */
export function trendPct(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return current > 0 ? 100 : -100;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}
