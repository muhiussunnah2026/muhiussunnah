import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight, Users, Calendar, Wallet, Award, Megaphone, BookOpen,
  Sparkles, Smartphone, Shield, Video, ClipboardCheck, BarChart3,
  Globe, TrendingUp, FileText, ScrollText, MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { CustomCursor } from "@/components/marketing/custom-cursor";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

export const metadata = {
  title: "Features — Muhius Sunnah",
  description: "Complete feature set — student management to AI insights to madrasa modules.",
};

const categoryGroups = [
  {
    title: "📚 একাডেমিক",
    accent: "from-primary to-accent",
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
    accent: "from-success to-accent",
    items: [
      { icon: Wallet, title: "অনলাইন পেমেন্ট", desc: "bKash, Nagad, Rocket, SSLCommerz — directly ফি collection।" },
      { icon: TrendingUp, title: "খরচ ও আয় ট্র্যাকিং", desc: "২৪টি pre-configured expense heads + donation campaigns।" },
      { icon: Award, title: "বৃত্তি ব্যবস্থাপনা", desc: "Need-based + merit-based scholarship assignment।" },
      { icon: BarChart3, title: "১০+ রিপোর্ট", desc: "ফি কালেকশন, বকেয়া aging, আয়-ব্যয়, বেতন — PDF/Excel।" },
    ],
  },
  {
    title: "📱 যোগাযোগ",
    accent: "from-secondary to-primary",
    items: [
      { icon: Megaphone, title: "SMS + WhatsApp + Push", desc: "একটি নোটিশ ৪ চ্যানেলে — SSL Wireless + Meta Cloud + FCM।" },
      { icon: MessageCircle, title: "সাপোর্ট টিকেট", desc: "অভিভাবক প্রশ্ন করেন, admin reply করেন — threaded inbox।" },
      { icon: Sparkles, title: "AI SMS টেমপ্লেট", desc: "ফি রিমাইন্ডার, অনুপস্থিতি — AI দিয়ে তৈরি বাংলা কপি।" },
    ],
  },
  {
    title: "🕌 মাদ্রাসা",
    accent: "from-warning to-primary",
    items: [
      { icon: BookOpen, title: "হিফজ heatmap", desc: "৩০ পারা × শিক্ষার্থী — সম্পূর্ণ hifz progress এক নজরে।" },
      { icon: BookOpen, title: "কিতাব curriculum", desc: "৬ স্তর — প্রাথমিক থেকে তাকমিল পর্যন্ত।" },
      { icon: Calendar, title: "দৈনিক সবক-সবকী-মানজিল", desc: "প্রতিদিনের সবক track — ১০ কলামের গ্রিড।" },
      { icon: Globe, title: "Hijri তারিখ + Arabic RTL", desc: "Islamic calendar integration + পুরো সিস্টেম Arabic RTL সাপোর্ট।" },
    ],
  },
  {
    title: "🏢 অপারেশনাল",
    accent: "from-accent to-primary",
    items: [
      { icon: BookOpen, title: "লাইব্রেরি", desc: "বই ক্যাটালগ, issue/return, overdue tracking।" },
      { icon: Users, title: "পরিবহন", desc: "রুট, গাড়ি, ছাত্র assignment, GPS-ready।" },
      { icon: Users, title: "হোস্টেল", desc: "ভবন, রুম, বেড allocation, warden ব্যবস্থাপনা।" },
      { icon: ClipboardCheck, title: "ইনভেন্টরি", desc: "স্টেশনারি ও সম্পদ stock movement, reorder alert।" },
    ],
  },
  {
    title: "🔒 নিরাপত্তা ও স্কেল",
    accent: "from-destructive to-primary",
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
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-2 py-20 md:py-28">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">{t.features.eyebrow}</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-7xl leading-[1.05]">
                {t.features.title}{" "}
                <span className="text-gradient-primary animate-gradient">{t.features.titleHighlight}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{t.features.subtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8 space-y-20">
          {categoryGroups.map((group, gi) => (
            <div key={group.title}>
              <Reveal variant="fade-up">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">{group.title}</h2>
              </Reveal>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((f, i) => (
                  <Reveal key={f.title} variant="fade-up" delay={(i % 3) * 100}>
                    <TiltCard>
                      <div className="shine-border group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                        <div className={`absolute -end-8 -top-8 size-32 rounded-full bg-gradient-to-br ${group.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`} aria-hidden />
                        <div className="relative">
                          <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${group.accent} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <f.icon className="size-5" />
                          </div>
                          <h3 className="font-semibold mb-1.5">{f.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold mb-3">{t.finalCta.title}</h2>
                <p className="text-white/90 mb-6 text-lg">{t.finalCta.subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition-shadow">
                      {t.finalCta.primary} <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Link href="/pricing" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-8 py-3.5 font-semibold hover:bg-white/10 transition">
                    {t.nav.pricing}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
