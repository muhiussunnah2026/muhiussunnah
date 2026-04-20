import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // PWA-friendly headers for the manifest
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      // Cache static marketing pages aggressively at the edge. The dashboard
      // is already dynamic (auth'd) so this only helps public routes.
      {
        source: "/(features|pricing|about|contact|support|refund-policy|terms|privacy)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Fewer device sizes => smaller .next build + less work at request time.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  // Keep server-only packages out of the client bundle.
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],

  experimental: {
    // Tree-shake icon + util imports — huge bundle win with lucide-react.
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@base-ui/react",
    ],
  },
};

export default withNextIntl(nextConfig);
