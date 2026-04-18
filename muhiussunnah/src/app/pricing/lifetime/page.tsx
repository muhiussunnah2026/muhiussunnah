import { cookies } from "next/headers";
import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getPackageDetailChrome, getPackageDetailCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Lifetime Basic প্যাকেজ — Muhius Sunnah",
  description: "৳20,000 একবার পরিশোধে সারাজীবন ব্যবহার। ২০০ জন পর্যন্ত শিক্ষার্থী। সব মূল feature।",
};

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

  return <PackageDetailPage pkg={pkg} chrome={chrome} />;
}
