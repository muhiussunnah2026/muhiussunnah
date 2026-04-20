import { cookies } from "next/headers";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-jsonld";
import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getPackageDetailChrome, getPackageDetailCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Scale Package",
  description: "৳4,000/মাস — মাল্টি-ব্রাঞ্চ, কাস্টম ডোমেইন, ২৪/৭ সাপোর্ট। এন্টারপ্রাইজ চেইন প্রতিষ্ঠানের জন্য।",
  alternates: { canonical: "/pricing/scale" },
  openGraph: {
    title: "Scale প্যাকেজ — Muhius Sunnah",
    description: "৳4,000/month — multi-branch, custom domain, 24/7 support.",
    url: "/pricing/scale",
  },
};

export default async function Page() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const copy = getPackageDetailCopy("scale", locale);
  const chrome = getPackageDetailChrome(locale);

  const pkg: PackageDetail = {
    slug: "scale",
    name: copy.name,
    tagline: copy.tagline,
    price: 4000,
    priceUnit: "month",
    badge: copy.badge,
    accent: "violet",
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
        id="pricing-scale"
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Scale", href: "/pricing/scale" },
        ]}
      />
      <PackageDetailPage pkg={pkg} chrome={chrome} />
    </>
  );
}
