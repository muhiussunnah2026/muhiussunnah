import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  Inter,
  Noto_Naskh_Arabic,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Bengali,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultLocale, isLocale, localeCookieName, localeDirection, type Locale } from "@/lib/i18n/config";
import "./globals.css";

/**
 * Font strategy — optimized for Core Web Vitals.
 *
 * Previously we loaded SIX font families (Hind Siliguri, Inter, JetBrains
 * Mono, Noto Sans Bengali, Noto Naskh Arabic, Noto Nastaliq Urdu), all
 * preloaded on every page. That cost ~300KB of font CSS + preload
 * requests before first paint.
 *
 * Now:
 *  - Inter + Noto Sans Bengali are preloaded (the primary Bangla+Latin UI).
 *  - Arabic + Urdu are loaded on-demand via CSS (preload: false) — only
 *    users with locale=ar/ur actually download them.
 *  - Hind Siliguri removed entirely (Noto Sans Bengali covers everything).
 *  - JetBrains Mono removed — ui-monospace system fallback works for the
 *    two or three places we use font-mono.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://muhiussunnah.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhius Sunnah — #1 School & Madrasa Management Software for Bangladesh",
    template: "%s · Muhius Sunnah",
  },
  description:
    "Muhius Sunnah — modern school & madrasa management software for Bangladesh. Admissions, attendance, exams, fees, parent portal, hifz/kitab/sabaq modules, online payments. Available in 4 languages.",
  applicationName: "Muhius Sunnah",
  keywords: [
    "school management software",
    "madrasa management software",
    "bangladesh school software",
    "madrasa software bangladesh",
    "hifz tracking",
    "sabaq tracking",
    "kitab progress",
    "bangla school software",
    "islamic school management",
    "muhius sunnah",
  ],
  authors: [{ name: "Muhius Sunnah", url: SITE_URL }],
  creator: "Muhius Sunnah",
  publisher: "Muhius Sunnah",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/",
      "ur-PK": "/",
      "ar-SA": "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Muhius Sunnah",
    locale: "bn_BD",
    alternateLocale: ["en_US", "ur_PK", "ar_SA"],
    url: SITE_URL,
    title: "Muhius Sunnah — #1 School & Madrasa Management Software for Bangladesh",
    description:
      "Complete madrasa & school management — all in one platform. Admissions to exams, fees to parent communication, hifz to certificates.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Muhius Sunnah — School & Madrasa Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhius Sunnah — #1 School & Madrasa Management Software",
    description:
      "Complete madrasa & school management for Bangladesh. Admissions, attendance, exams, fees, hifz, certificates — all in one platform.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "VG1jkZu8OrkljCx5KmlWyAcGCkowXrHMX_AV3HtnQ7M",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

/**
 * Site-wide Organization + WebSite JSON-LD. Placed in the root layout so
 * every page (crawlable or not) ships it — Google uses this for the
 * knowledge panel / sitelinks search box.
 */
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Muhius Sunnah",
  alternateName: "মুহিউস সুন্নাহ",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.svg`,
  description:
    "Modern school & madrasa management software for Bangladesh. Admissions, attendance, exams, fees, parent portal, hifz/kitab/sabaq modules.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+880-1767-682381",
    contactType: "customer support",
    areaServed: "BD",
    availableLanguage: ["Bengali", "English", "Urdu", "Arabic"],
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Muhius Sunnah",
  url: SITE_URL,
  inLanguage: ["bn", "en", "ur", "ar"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${notoSansBengali.variable} ${notoNaskhArabic.variable} ${notoNastaliqUrdu.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Plain inline <script> tags for JSON-LD — NOT next/script.
          Structured data is a pure crawler signal: Google reads the HTML
          directly. Using next/script with `beforeInteractive` hoists
          these into the critical path and was adding measurable TBT on
          mobile. Rendering as inline <script type="application/ld+json">
          is still SSR'd, zero runtime cost, and identical for crawlers.
        */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        {/* Skip-to-main-content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:inline-block focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
          <InstallPrompt />
          <RegisterServiceWorker />
          <WebVitalsReporter />
        </ThemeProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
