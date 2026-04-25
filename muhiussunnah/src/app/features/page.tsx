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
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getFeaturesPageCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Features",
  description:
    "32+ features for schools & madrasas — student management, attendance, exams, fees, AI insights, hifz & kitab tracking. Everything you need, bilingual Bangla + English.",
  alternates: { canonical: "/features" },
  openGraph: {
    type: "website",
    siteName: "Muhius Sunnah",
    title: "Features — Muhius Sunnah",
    description:
      "32+ features for schools & madrasas — admissions, attendance, fees, hifz/kitab tracking, AI insights.",
    url: "/features",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Muhius Sunnah Features" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — Muhius Sunnah",
    description: "32+ features for schools & madrasas. AI insights, hifz tracking, parent portal.",
    images: ["/opengraph-image"],
  },
};

const iconMap: Record<string, typeof Users> = {
  Users, Calendar, Wallet, Award, Megaphone, BookOpen, Sparkles,
  Smartphone, Shield, Video, ClipboardCheck, BarChart3, Globe,
  TrendingUp, FileText, ScrollText, MessageCircle,
};

// Accent classes per group index (first = primary, last = danger etc.)
const groupAccents = [
  "from-primary to-accent",
  "from-success to-accent",
  "from-secondary to-primary",
  "from-warning to-primary",
  "from-accent to-primary",
  "from-destructive to-primary",
];

export default async function FeaturesPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const f = getFeaturesPageCopy(locale);

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-2 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">{f.heroBadge}</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-7xl leading-[1.05]">
                {f.heroTitle}{" "}
                <span className="text-gradient-primary animate-gradient">{f.heroAccent}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{f.heroSubtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8 space-y-20">
          {f.groups.map((group, gi) => {
            const accent = groupAccents[gi % groupAccents.length];
            return (
              <div key={group.title}>
                <Reveal variant="fade-up">
                  <h2 className="text-2xl md:text-3xl font-bold mb-8">{group.title}</h2>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((it, i) => {
                    const Icon = iconMap[it.iconName] ?? Sparkles;
                    return (
                      <Reveal key={`${group.title}-${i}`} variant="fade-up" delay={(i % 3) * 100}>
                        <TiltCard>
                          <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                            <div className={`absolute -end-8 -top-8 size-32 rounded-full bg-gradient-to-br ${accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`} aria-hidden />
                            <div className="relative">
                              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="size-5" />
                              </div>
                              <h3 className="font-semibold mb-1.5">{it.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                            </div>
                          </div>
                        </TiltCard>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold mb-3">{f.ctaTitle}</h2>
                <p className="text-white/90 mb-6 text-lg">{f.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition">
                      {f.ctaPrimary} <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Link href="/pricing" className={buttonVariants({ variant: "outline", size: "lg" }) + " border-white/40 bg-white/10 text-white hover:bg-white/20"}>
                    {f.ctaSecondary}
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
