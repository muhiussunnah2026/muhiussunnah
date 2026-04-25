import Link from "next/link";
import { cookies } from "next/headers";
import { Heart, Target, Users, Zap, ArrowRight } from "lucide-react";
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
import { getAboutPageCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "About",
  description:
    "Our mission: modernize Bangladesh's schools & madrasas with local-first technology. Built by educators, for educators. 120+ institutions trust us.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "Muhius Sunnah",
    title: "About Muhius Sunnah",
    description:
      "Local-first school & madrasa management built for Bangladesh. Trusted by 120+ institutions.",
    url: "/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About Muhius Sunnah" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Muhius Sunnah",
    description: "Local-first school & madrasa management built for Bangladesh.",
    images: ["/opengraph-image"],
  },
};

const valueIcons = [Heart, Users, Zap];
const valueAccents = ["from-destructive to-secondary", "from-primary to-accent", "from-warning to-secondary"];

export default async function AboutPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const a = getAboutPageCopy(locale);

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-1 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">{a.heroBadge}</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-7xl leading-[1.05]">
                {a.heroTitle}{" "}
                <span className="text-gradient-primary animate-gradient">{a.heroAccent}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{a.heroSubtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8 space-y-16">
          {/* Mission */}
          <Reveal variant="scale-in">
            <TiltCard>
              <div className="grad-border rounded-3xl p-10 md:p-16 text-center bg-gradient-to-br from-primary/5 via-card to-accent/5">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-primary animate-gradient text-white mb-5 shadow-lg shadow-primary/30 animate-float">
                  <Target className="size-6" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{a.missionTitle}</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{a.missionBody}</p>
              </div>
            </TiltCard>
          </Reveal>

          {/* Values */}
          <div>
            <Reveal variant="fade-up">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">{a.valuesTitle}</h2>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {a.values.map((v, i) => {
                const Icon = valueIcons[i] ?? Heart;
                const accent = valueAccents[i] ?? "from-primary to-accent";
                return (
                  <Reveal key={v.title} variant="fade-up" delay={i * 120}>
                    <TiltCard>
                      <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                        <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="size-5" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.desc}</p>
                      </div>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Why */}
          <Reveal variant="fade-up">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">{a.whyTitle}</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <TiltCard>
                <div className="h-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 hover-lift">
                  <div className="text-sm font-semibold text-destructive mb-2">{a.problemLabel}</div>
                  <p className="text-muted-foreground leading-relaxed">{a.problemBody}</p>
                </div>
              </TiltCard>
              <TiltCard>
                <div className="h-full rounded-2xl border border-success/30 bg-success/5 p-6 hover-lift">
                  <div className="text-sm font-semibold text-success mb-2">{a.solutionLabel}</div>
                  <p className="text-muted-foreground leading-relaxed">{a.solutionBody}</p>
                </div>
              </TiltCard>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal variant="fade-up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-10 md:p-14 noise">
              <div className="aurora-beam opacity-40" aria-hidden />
              <div className="relative grid gap-6 md:grid-cols-4 text-center">
                {a.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl md:text-5xl font-bold text-gradient-primary tabular-nums">{s.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="text-center py-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{a.ctaTitle}</h2>
              <p className="text-muted-foreground mb-8 text-lg">{a.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Magnetic>
                  <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-2xl shadow-primary/40 text-base px-8"}>
                    {a.ctaPrimary} <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
                  </Link>
                </Magnetic>
                <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-8"}>
                  {a.ctaSecondary}
                </Link>
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
