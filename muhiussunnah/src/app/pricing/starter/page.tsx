import { cookies } from "next/headers";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-jsonld";
import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getPackageDetailChrome, getPackageDetailCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Starter Package",
  description: "৳1,000/মাস — ৫০০ ছাত্র পর্যন্ত, SMS নোটিফিকেশন, offline mode। বৃদ্ধিমান প্রতিষ্ঠানের জন্য।",
  alternates: { canonical: "/pricing/starter" },
  openGraph: {
    title: "Starter প্যাকেজ — Muhius Sunnah",
    description: "৳1,000/month — up to 500 students, SMS notifications, offline mode.",
    url: "/pricing/starter",
  },
};

export default async function Page() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const copy = getPackageDetailCopy("starter", locale);
  const chrome = getPackageDetailChrome(locale);

  const pkg: PackageDetail = {
    slug: "starter",
    name: copy.name,
    tagline: copy.tagline,
    price: 1000,
    priceUnit: "month",
    badge: copy.badge,
    accent: "gray",
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
        id="pricing-starter"
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Starter", href: "/pricing/starter" },
        ]}
      />
      <PackageDetailPage pkg={pkg} chrome={chrome} />
    </>
  );
}
