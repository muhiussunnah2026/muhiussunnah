import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * Site-wide analytics wrapper. Only renders Google Analytics 4 when
 * NEXT_PUBLIC_GA_ID is set in the environment — keeps dev and staging
 * clean, and costs nothing if the env var is missing.
 *
 * Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` in Vercel project settings to
 * activate.
 */
export function AnalyticsProvider() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
