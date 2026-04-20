"use client";

import { useReportWebVitals } from "next/web-vitals";

type GtagCommand = "event" | "config" | "set";
type GtagFn = (command: GtagCommand, action: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/**
 * Reports Core Web Vitals (LCP, CLS, INP, FCP, TTFB) to GA4 so real-user
 * metrics show up alongside pageview data. No-op unless `window.gtag` is
 * present, so it's safe to mount unconditionally.
 *
 * Metric values are sent as the `value` parameter with the metric name as
 * `event_label`. In GA4, create a custom report filtering by event name
 * `web_vitals` to see per-metric distributions.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    // CLS is a unitless ratio; multiply by 1000 so GA treats it as an integer.
    const value = Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value);
    window.gtag("event", "web_vitals", {
      event_category: "Web Vitals",
      event_label: metric.id,
      metric_name: metric.name,
      metric_rating: metric.rating,
      value,
      non_interaction: true,
    });
  });
  return null;
}
