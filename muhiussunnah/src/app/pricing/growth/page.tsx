import { cookies } from "next/headers";
import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getPackageDetailChrome, getPackageDetailCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Growth প্যাকেজ — Muhius Sunnah",
  description: "৳2,000/মাস — সীমাহীন ছাত্র, অনলাইন পেমেন্ট, AI, WhatsApp। বেশিরভাগ প্রতিষ্ঠানের জন্য সেরা।",
};

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

  return <PackageDetailPage pkg={pkg} chrome={chrome} />;
}
