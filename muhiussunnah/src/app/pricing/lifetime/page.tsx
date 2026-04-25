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
    title: "Lifetime Basic Package",
    description: bn
      ? "৳20,000 একবার পরিশোধে সারাজীবন ব্যবহার। ২০০ জন পর্যন্ত শিক্ষার্থী। সব মূল feature।"
      : "৳20,000 once for lifetime access. Up to 200 students. All core features.",
    alternates: { canonical: "/pricing/lifetime" },
    openGraph: {
      title: bn ? "Lifetime Basic প্যাকেজ — Muhius Sunnah" : "Lifetime Basic Package — Muhius Sunnah",
      description: bn
        ? "৳20,000 একবার পরিশোধে সারাজীবন ব্যবহার।"
        : "৳20,000 once for lifetime access. Up to 200 students.",
      url: "/pricing/lifetime",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Lifetime Basic · Muhius Sunnah" }],
    },
    twitter: {
      card: "summary_large_image",
      title: bn ? "Lifetime Basic প্যাকেজ — Muhius Sunnah" : "Lifetime Basic Package — Muhius Sunnah",
      description: bn ? "৳20,000 একবার পরিশোধে সারাজীবন।" : "৳20,000 once for lifetime access.",
      images: ["/opengraph-image"],
    },
  };
}

export default async function Page() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const copy = getPackageDetailCopy("lifetime", locale);
  const chrome = getPackageDetailChrome(locale);

  const pkg: PackageDetail = {
    slug: "lifetime",
    name: copy.name,
    tagline: copy.tagline,
    price: 20000,
    priceUnit: "once",
    badge: copy.badge,
    accent: "amber",
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
        id="pricing-lifetime"
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Lifetime Basic", href: "/pricing/lifetime" },
        ]}
      />
      <PackageDetailPage pkg={pkg} chrome={chrome} />
    </>
  );
}
