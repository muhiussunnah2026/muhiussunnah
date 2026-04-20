import Link from "next/link";
import { cookies } from "next/headers";
import { Shield, CheckCircle2, CalendarClock, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getRefundPageCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Refund Policy",
  description:
    "30-day full money-back guarantee from Muhius Sunnah — no questions asked. Simple, fair refund process for all plans.",
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund Policy — Muhius Sunnah",
    description: "30-day full money-back guarantee, no questions asked.",
    url: "/refund-policy",
  },
};

const stepIcons = [MessageCircle, CalendarClock, CreditCard];
const stepAccents = ["from-primary to-accent", "from-accent to-secondary", "from-success to-accent"];

export default async function RefundPolicyPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const r = getRefundPageCopy(locale);

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-1 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">
                <Shield className="me-1 size-3" /> {r.heroBadge}
              </Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                {r.heroTitle}{" "}
                <span className="text-gradient-primary animate-gradient">{r.heroAccent}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{r.heroSubtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 md:px-8 space-y-12">
          {/* Guarantee card */}
          <Reveal variant="scale-in">
            <TiltCard>
              <div className="relative overflow-hidden rounded-3xl border border-success/40 bg-gradient-to-br from-success/10 via-card to-success/5 p-10 md:p-16 shadow-2xl shadow-success/20">
                <div className="absolute -top-16 -end-16 size-48 rounded-full bg-success/20 blur-3xl" aria-hidden />
                <div className="relative flex items-start gap-6 flex-col md:flex-row">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-success/70 text-white shadow-xl shadow-success/30 animate-float">
                    <Shield className="size-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-success text-white">{r.guaranteedLabel}</Badge>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{r.satisfactionLabel}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                      {r.guaranteeTitle} <span className="text-success">{r.guaranteeTitleAccent}</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {r.guaranteeBody} <strong className="text-foreground">{r.guaranteeBodyBold}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* 3 steps */}
          <div>
            <Reveal variant="fade-up" className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">{r.stepsTitle}</h2>
              <p className="text-muted-foreground mt-2">{r.stepsSubtitle}</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {r.steps.map((s, i) => {
                const Icon = stepIcons[i] ?? MessageCircle;
                const accent = stepAccents[i] ?? "from-primary to-accent";
                return (
                  <Reveal key={s.step} variant="fade-up" delay={i * 120}>
                    <TiltCard>
                      <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                        <div className="absolute top-3 end-3 text-5xl font-black text-primary/10">{s.step}</div>
                        <div className={`relative inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg mb-4`}>
                          <Icon className="size-5" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Covered vs Conditions */}
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal variant="slide-right">
              <TiltCard>
                <div className="h-full rounded-2xl border border-success/30 bg-success/5 p-6 hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="size-5 text-success" />
                    <h3 className="font-semibold text-lg">{r.coveredTitle}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {r.coveredItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </Reveal>

            <Reveal variant="slide-left">
              <TiltCard>
                <div className="h-full rounded-2xl border border-warning/30 bg-warning/5 p-6 hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarClock className="size-5 text-warning" />
                    <h3 className="font-semibold text-lg">{r.conditionsTitle}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {r.conditionsItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </Reveal>
          </div>

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
              <div className="relative">
                <Shield className="mx-auto size-12 mb-4 animate-float" />
                <h2 className="text-3xl md:text-5xl font-bold mb-3">{r.ctaTitle}</h2>
                <p className="text-white/90 mb-8 text-lg">{r.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition">
                      {r.ctaPrimary} <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-2 rounded-md border-2 border-white/60 bg-white/10 backdrop-blur-sm px-8 py-3.5 font-semibold text-white transition hover:bg-white/20 hover:border-white"
                  >
                    {r.ctaSecondary}
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
