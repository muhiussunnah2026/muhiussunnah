import { cookies } from "next/headers";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-jsonld";
import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getPackageDetailChrome, getPackageDetailCopy } from "@/lib/i18n/pages";

export async function generateMetadata() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const bn = locale === "bn";
  return {
    title: "Growth Package",
    description: bn
      ? "৳2,000/মাস — সীমাহীন ছাত্র, অনলাইন পেমেন্ট, AI, WhatsApp। বেশিরভাগ প্রতিষ্ঠানের জন্য সেরা।"
      : "৳2,000/month — unlimited students, online payments, AI, WhatsApp. The best fit for most institutions.",
    alternates: { canonical: "/pricing/growth" },
    openGraph: {
      title: bn ? "Growth প্যাকেজ — Muhius Sunnah" : "Growth Package — Muhius Sunnah",
      description: bn
        ? "৳2,000/মাস — সীমাহীন ছাত্র, অনলাইন পেমেন্ট, AI, WhatsApp।"
        : "৳2,000/month — unlimited students, online payments, AI, WhatsApp.",
      url: "/pricing/growth",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Growth Package · Muhius Sunnah" }],
    },
    twitter: {
      card: "summary_large_image",
      title: bn ? "Growth প্যাকেজ — Muhius Sunnah" : "Growth Package — Muhius Sunnah",
      description: bn ? "৳2,000/মাস — সীমাহীন ছাত্র, AI, WhatsApp।" : "৳2,000/month — unlimited students, AI, WhatsApp.",
      images: ["/opengraph-image"],
    },
  };
}

export default async function Page() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const copy = getPackageDetailCopy("growth", locale);
  const chrome = getPackageDetailChrome(locale);

  const pkg: PackageDetail = {
    slug: "growth",
    name: copy.name,
    tagline: copy.tagline,
    price: 2000,
    priceUnit: "month",
    badge: copy.badge,
    accent: "primary",
    summary: copy.summary,
    whoFor: copy.whoFor,
    bestValue: copy.bestValue,
    savingsTable: copy.savingsTable,
    sections: copy.sections,
    notIncluded: copy.notIncluded,
  };

  return (
    <>
      <BreadcrumbJsonLd
        id="pricing-growth"
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Growth", href: "/pricing/growth" },
        ]}
      />
      <PackageDetailPage pkg={pkg} chrome={chrome} />
    </>
  );
}
