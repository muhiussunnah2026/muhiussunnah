import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight, Users, Calendar, Wallet, Award, Megaphone, BookOpen,
  Sparkles, Smartphone, Shield, Video, ClipboardCheck, BarChart3,
  Globe, TrendingUp, FileText, ScrollText, MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

const iconMap: Record<string, typeof Users> = {
  users: Users, calendar: Calendar, wallet: Wallet, award: Award,
  megaphone: Megaphone, book: BookOpen, sparkles: Sparkles,
  smartphone: Smartphone, shield: Shield,
};

const categoryGroups = [
  {
    title: "📚 একাডেমিক",
    items: [
      { icon: Users, title: "শিক্ষার্থী ব্যবস্থাপনা", desc: "Excel import, guardian linking, transfer, promotion, profile photo।" },
      { icon: Calendar, title: "QR উপস্থিতি", desc: "২ মিনিটে ক্লাসের হাজিরা। অভিভাবক instant SMS পান।" },
      { icon: ScrollText, title: "পরীক্ষা ও রেজাল্ট", desc: "GPA 5.0, position ranking, keyboard-friendly marks entry grid।" },
      { icon: FileText, title: "সার্টিফিকেট", desc: "টেমপ্লেট-based certificate তৈরি, Bangla Unicode print-ready।" },
      { icon: ClipboardCheck, title: "অ্যাসাইনমেন্ট", desc: "শিক্ষক তৈরি করেন, ছাত্র জমা দেয়, শিক্ষক গ্রেড দেন।" },
      { icon: Video, title: "অনলাইন ক্লাস", desc: "Zoom, Google Meet, Teams — সরাসরি পোর্টাল থেকে যোগ।" },
    ],
  },
  {
    title: "💰 ফিন্যান্স",
    items: [
      { icon: Wallet, title: "অনলাইন পেমেন্ট", desc: "bKash, Nagad, Rocket, SSLCommerz — directly ফি collection।" },
      { icon: TrendingUp, title: "খরচ ও আয় ট্র্যাকিং", desc: "২৪টি pre-configured expense heads + donation campaigns।" },
      { icon: Award, title: "বৃত্তি ব্যবস্থাপনা", desc: "Need-based + merit-based scholarship assignment।" },
      { icon: BarChart3, title: "১০+ রিপোর্ট", desc: "ফি কালেকশন, বকেয়া aging, আয়-ব্যয়, বেতন — PDF/Excel।" },
    ],
  },
  {
    title: "📱 যোগাযোগ",
    items: [
      { icon: Megaphone, title: "SMS + WhatsApp + Push", desc: "একটি নোটিশ ৪ চ্যানেলে — SSL Wireless + Meta Cloud + FCM।" },
      { icon: MessageCircle, title: "সাপোর্ট টিকেট", desc: "অভিভাবক প্রশ্ন করেন, admin reply করেন — threaded inbox।" },
      { icon: Sparkles, title: "AI SMS টেমপ্লেট", desc: "ফি রিমাইন্ডার, অনুপস্থিতি — AI দিয়ে তৈরি বাংলা কপি।" },
    ],
  },
  {
    title: "🕌 মাদ্রাসা",
    items: [
      { icon: BookOpen, title: "হিফজ heatmap", desc: "৩০ পারা × শিক্ষার্থী — সম্পূর্ণ hifz progress এক নজরে।" },
      { icon: BookOpen, title: "কিতাব curriculum", desc: "৬ স্তর — প্রাথমিক থেকে তাকমিল পর্যন্ত।" },
      { icon: Calendar, title: "দৈনিক সবক-সবকী-মানজিল", desc: "প্রতিদিনের সবক track — ১০ কলামের গ্রিড।" },
      { icon: Globe, title: "Hijri তারিখ + Arabic RTL", desc: "Islamic calendar integration + পুরো সিস্টেম Arabic RTL সাপোর্ট।" },
    ],
  },
  {
    title: "🏢 অপারেশনাল",
    items: [
      { icon: BookOpen, title: "লাইব্রেরি", desc: "বই ক্যাটালগ, issue/return, overdue tracking।" },
      { icon: Users, title: "পরিবহন", desc: "রুট, গাড়ি, ছাত্র assignment, GPS-ready।" },
      { icon: Users, title: "হোস্টেল", desc: "ভবন, রুম, বেড allocation, warden ব্যবস্থাপনা।" },
      { icon: ClipboardCheck, title: "ইনভেন্টরি", desc: "স্টেশনারি ও সম্পদ stock movement, reorder alert।" },
    ],
  },
  {
    title: "🔒 নিরাপত্তা ও স্কেল",
    items: [
      { icon: Shield, title: "২-স্তর প্রমাণীকরণ (2FA)", desc: "TOTP-based 2FA — Google Authenticator + recovery codes।" },
      { icon: Shield, title: "Row-Level Security", desc: "প্রত্যেক স্কুলের ডেটা RLS-দ্বারা আলাদা, cross-tenant leak অসম্ভব।" },
      { icon: Smartphone, title: "অফলাইন PWA", desc: "নেট না থাকলেও হাজিরা ও মার্কস — auto-sync on reconnect।" },
      { icon: TrendingUp, title: "Realtime Live Dashboard", desc: "Supabase Realtime — পেমেন্ট/ভর্তি হলেই dashboard auto-update।" },
      { icon: Sparkles, title: "AI ড্রপআউট ঝুঁকি", desc: "উপস্থিতি + মার্কস + ফি → ঝুঁকি স্কোর + AI suggestion।" },
      { icon: Globe, title: "৪ ভাষা সাপোর্ট", desc: "বাংলা, English, উর্দু, আরবি — RTL + hijri + Bangla digits।" },
    ],
  },
];

export default async function FeaturesPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <>
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24 text-center">
            <Badge variant="outline" className="px-3 mb-4">{t.features.eyebrow}</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              {t.features.title} <span className="text-gradient-primary">{t.features.titleHighlight}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8 space-y-14">
          {categoryGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-2xl font-bold mb-6">{group.title}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((f) => (
                  <Card key={f.title} className="group border-border/60 bg-card/50 transition-all hover:shadow-hover hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-sm">
                        <f.icon className="size-5" />
                      </div>
                      <h3 className="font-semibold mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="rounded-3xl bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{t.finalCta.title}</h2>
            <p className="text-white/90 mb-6 text-lg">{t.finalCta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-white text-primary hover:bg-white/90"}>
                {t.finalCta.primary} <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
              </Link>
              <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" }) + " border-white/40 text-white hover:bg-white/10"}>
                {t.nav.pricing}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
