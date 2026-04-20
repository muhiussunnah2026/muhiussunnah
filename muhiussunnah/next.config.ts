import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Security headers. Applied to every response to bring us to A+ on
 * securityheaders.com and satisfy the Next.js SEO/Perf checklist.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Strip console.* from the production client bundle so we don't leak
  // development noise — keeps .error for visible errors only.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      {
        // Explicit XML Content-Type for sitemap.xml — guards against
        // intermediaries or stale service-worker caches that might
        // otherwise serve it as text/plain or text/html, which makes
        // browsers render raw text instead of a proper XML tree.
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/(features|pricing|about|contact|support|refund-policy|terms|privacy)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },

  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],

  experimental: {
    // Router cache stale-times. Next 15+ default is 30s for dynamic
    // routes which makes every back-navigation look like a fresh fetch.
    // Bumping to 3 minutes makes within-session navigation feel instant
    // — e.g. visiting /students → /fees → back to /students is cached.
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@base-ui/react",
    ],
  },
};

export default withNextIntl(nextConfig);
