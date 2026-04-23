import Script from "next/script";

/**
 * Production GA4 measurement ID. Hard-coded as the default so analytics
 * work the moment the site deploys, without waiting on a Vercel env var.
 * Can still be overridden per-environment via NEXT_PUBLIC_GA_ID.
 */
const DEFAULT_GA_ID = "G-RPS3F3FFWD";

/**
 * Google Analytics loaded with `strategy="lazyOnload"` so the 152 KiB
 * gtag.js bundle doesn't compete with our own JS for main-thread time
 * during initial hydration. Lighthouse flagged it as 62 KiB of unused
 * code on first paint and ~2.2s of main-thread work — lazyOnload defers
 * it to browser idle, which is where analytics belong anyway.
 *
 * We were previously using `@next/third-parties/google` which ships GA
 * as `afterInteractive` (blocks until after hydration); the dropdown to
 * `lazyOnload` is what the LCP breakdown needed.
 */
export function AnalyticsProvider() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID;
  if (!gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
