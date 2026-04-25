import Link from "next/link";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import {
  ArrowRight, ArrowUpRight, Check, Users, Calendar, Wallet, Award, Megaphone, BookOpen,
  Sparkles, Smartphone, Shield, ShieldCheck, Zap, TrendingUp, Globe,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { Reveal } from "@/components/marketing/reveal";
import { TextReveal } from "@/components/marketing/text-reveal";
import { PartnersStrip } from "@/components/marketing/partners-strip";

/**
 * Below-the-fold components — code-split out of the initial bundle.
 * `ssr: true` keeps HTML in the server response (SEO preserved) but the
 * JS ships as a separate chunk that doesn't block initial hydration.
 * This was the primary TBT contributor on mobile PageSpeed.
 */
const AnimatedCounter = dynamic(
  () => import("@/components/marketing/animated-counter").then((m) => m.AnimatedCounter),
);
const Marquee = dynamic(
  () => import("@/components/marketing/marquee").then((m) => m.Marquee),
);
const TestimonialCard = dynamic(
  () => import("@/components/marketing/testimonial-card").then((m) => m.TestimonialCard),
);
// TiltCard + Magnetic are pure decorative mouse-tracking — no SEO,
// no structural layout. Code-split them out of the initial client
// bundle so the 420ms Total Blocking Time Lighthouse flagged drops:
// HTML ships the same (ssr:true), JS loads as a parallel chunk
// which doesn't compete with the hero's hydration.
const TiltCard = dynamic(
  () => import("@/components/marketing/tilt-card").then((m) => m.TiltCard),
);
const Magnetic = dynamic(
  () => import("@/components/marketing/magnetic").then((m) => m.Magnetic),
);

const iconMap: Record<string, typeof Users> = {
  users: Users, calendar: Calendar, wallet: Wallet, award: Award,
  megaphone: Megaphone, book: BookOpen, sparkles: Sparkles,
  smartphone: Smartphone, shield: Shield,
};

export default async function LandingPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — aurora beams + floating orbs + parallax dashboard
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden mesh-bg-1">
        <div className="aurora-beam" aria-hidden />

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-20 start-[15%] size-80 rounded-full bg-primary/30 blur-[100px] animate-float-slow" />
          <div className="absolute top-[30%] end-[10%] size-96 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 start-[30%] size-72 rounded-full bg-secondary/20 blur-[100px] animate-glow-pulse" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          aria-hidden
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-8 px-4 py-24 text-center md:px-8">
          <Reveal variant="blur-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-md shadow-lg shadow-primary/10">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {t.hero.eyebrow}
            </span>
          </Reveal>

          <TextReveal
            as="h1"
            text={t.hero.title}
            className="max-w-6xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          />
          <Reveal variant="fade-up" delay={600}>
            <h1 className="max-w-6xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-gradient-primary animate-gradient -mt-2">
              {t.hero.titleHighlight}
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delay={800}>
            <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={1000} className="flex flex-col items-center gap-3 sm:flex-row">
            <Magnetic>
              <Link
                href="/register-school"
                className={buttonVariants({ size: "lg" }) + " group relative overflow-hidden bg-gradient-primary animate-gradient text-white text-base px-8 shadow-2xl shadow-primary/40 hover:shadow-primary/60"}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t.hero.primaryCta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" aria-hidden />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link href="/features" className={buttonVariants({ size: "lg", variant: "outline" }) + " group text-base px-8 backdrop-blur-sm border-border/60 hover:border-primary/50"}>
                {t.hero.secondaryCta}
                <ArrowUpRight className="ms-2 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Magnetic>
          </Reveal>

          <Reveal variant="fade-up" delay={1200}>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {t.hero.trustBadges.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1">{b}</span>
              ))}
            </div>
          </Reveal>

          {/* Dashboard mockup with 3D tilt and parallax */}
          <Reveal eager variant="fade-up" delay={400} className="relative w-full max-w-5xl mt-12">
            <div className="absolute -inset-8 rounded-[2rem] bg-gradient-primary opacity-30 blur-3xl animate-glow-pulse" aria-hidden />
            <TiltCard className="rounded-2xl">
              <div className="relative rounded-2xl border border-border/60 bg-card/80 p-2 shadow-2xl backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-xl bg-background/90 p-6 md:p-10 noise">
                  {/* Fake browser chrome */}
                  <div className="flex gap-1.5 mb-6">
                    <span className="size-3 rounded-full bg-destructive/60" />
                    <span className="size-3 rounded-full bg-warning/60" />
                    <span className="size-3 rounded-full bg-success/60" />
                    <span className="ms-auto text-xs text-muted-foreground">muhiussunnah.app/dashboard</span>
                  </div>
                  {/* Dashboard metrics */}
                  <div className="grid gap-3 md:grid-cols-4 text-start">
                    {[
                      { label: t.stats.students, value: t.heroPreview.sampleStudents, icon: Users, color: "from-primary to-primary/60" },
                      { label: t.heroPreview.todayAttendance, value: t.heroPreview.sampleAttendance, icon: Calendar, color: "from-success to-success/60" },
                      { label: t.heroPreview.monthIncome, value: t.heroPreview.sampleIncome, icon: Wallet, color: "from-accent to-accent/60" },
                      { label: t.heroPreview.outstandingFees, value: t.heroPreview.sampleDue, icon: TrendingUp, color: "from-warning to-warning/60" },
                    ].map((m) => (
                      <div key={m.label} className="group relative rounded-xl border border-border/40 bg-card/80 p-4 hover-lift">
                        <div className={`inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${m.color} text-white mb-2`}>
                          <m.icon className="size-4" />
                        </div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                        <div className="mt-1 text-2xl font-bold tabular-nums">{m.value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Fake chart */}
                  <div className="mt-6 h-40 rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 overflow-hidden relative">
                    <svg className="absolute inset-0 size-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 120 Q 50 80 100 90 T 200 50 T 300 70 T 400 30 L 400 160 L 0 160 Z" fill="url(#chart-fill)" />
                      <path d="M 0 120 Q 50 80 100 90 T 200 50 T 300 70 T 400 30" stroke="#7c5cff" strokeWidth="2.5" fill="none" />
                      <path d="M 0 140 Q 50 110 100 115 T 200 80 T 300 100 T 400 70" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.7" />
                    </svg>
                    <div className="absolute top-3 start-4 text-xs text-muted-foreground">{t.heroPreview.chartLegend}</div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 flex flex-col items-center gap-2">
          <span>{t.extras.scroll}</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-muted-foreground/50 to-transparent animate-float" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LOGO MARQUEE — "Trusted by"
      ═══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto border-y border-border/40 bg-muted/10 py-10">
        <Reveal variant="fade-in" className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            {t.extras.trustedBy}
          </p>
          <Marquee speed="45s">
            {t.extras.schools.map((n) => (
              <span key={n} className="text-xl md:text-2xl font-semibold text-muted-foreground/50 hover:text-foreground transition-colors">
                {n}
              </span>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS — animated counters
      ═══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto relative overflow-hidden py-24 mesh-bg-2">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <Reveal variant="fade-up" className="text-center mb-14">
            <Badge variant="outline" className="px-3 mb-4">{t.extras.statsBadge}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold">
              {t.extras.statsHeadingLead} <span className="text-gradient-primary">{t.extras.statsHeadingAccent}</span>
            </h2>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { value: 50000, suffix: "+", label: t.stats.students, icon: Users },
              { value: 120, suffix: "+", label: t.stats.schools, icon: Award },
              { value: 200, suffix: "M+", label: t.stats.transactions, icon: Wallet },
              { value: 2, suffix: "", label: t.stats.languages, icon: Globe },
            ].map((s, i) => (
              <Reveal key={s.label} variant="fade-up" delay={i * 100}>
                <TiltCard>
                  <div className="grad-border rounded-2xl p-6 hover-lift">
                    <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-primary text-white mb-4 shadow-lg shadow-primary/20">
                      <s.icon className="size-5" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-gradient-primary tabular-nums">
                      <AnimatedCounter value={s.value} suffix={s.suffix} bangla={locale === "bn"} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{s.label}</div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — bento grid with gradient borders
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="cv-auto relative overflow-hidden py-28">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <Reveal variant="fade-up" className="mb-16 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.features.eyebrow}</Badge>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t.features.title}{" "}
              <span className="text-gradient-primary animate-gradient">{t.features.titleHighlight}</span>
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.features.subtitle}</p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.list.map((f, i) => {
              const Icon = iconMap[f.icon] ?? Sparkles;
              return (
                <Reveal key={f.title} variant="fade-up" delay={(i % 3) * 100}>
                  <TiltCard>
                    <div className="shine-border group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                      <div className="absolute -end-8 -top-8 size-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" aria-hidden />
                      <div className="relative">
                        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                        <div className="mt-4 flex items-center text-xs text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          {t.extras.learnMore} <ArrowRight className="ms-1 size-3 rtl:rotate-180" />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PARTNERS — affiliate / promotion network
      ═══════════════════════════════════════════════════════════════ */}
      <PartnersStrip
        eyebrow={locale === "en" ? "OUR PARTNERS" : "আমাদের সাথী"}
        title={
          locale === "en"
            ? "Companions on the journey forward"
            : "সামনে এগিয়ে চলার সাথী"
        }
        subtitle={
          locale === "en"
            ? "These partners help us reach more institutions through affiliate marketing and product promotion. Inshaa Allah more companies will join the journey soon."
            : "এই সাথীরা অ্যাফিলিয়েট মার্কেটিং ও প্রচারের মাধ্যমে আরও প্রতিষ্ঠানের কাছে আমাদের পৌঁছাতে সাহায্য করেন। ইনশাআল্লাহ আরও অনেক প্রতিষ্ঠান শীঘ্রই যুক্ত হবেন।"
        }
      />

      {/* ═══════════════════════════════════════════════════════════════
          PRICING PREVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="cv-auto relative overflow-hidden py-28 mesh-bg-3 border-y border-border/40">
        <div className="aurora-beam opacity-30" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8">
          <Reveal variant="fade-up" className="mb-14 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.pricing.eyebrow}</Badge>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t.pricing.title}{" "}
              <span className="text-gradient-primary">{t.pricing.titleHighlight}</span>
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.pricing.subtitle}</p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.pricing.plans.map((plan, i) => (
              <Reveal key={plan.name} variant="fade-up" delay={i * 100}>
                <div className="relative h-full">
                  {/* Badges OUTSIDE the tilted card so nothing clips them */}
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 z-20 bg-gradient-primary animate-gradient text-white shadow-lg whitespace-nowrap">
                      <Sparkles className="me-1 size-3" /> {t.pricing.mostPopular}
                    </Badge>
                  )}
                  {plan.badge && !plan.highlighted && (
                    <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg whitespace-nowrap">
                      🏆 {plan.badge}
                    </Badge>
                  )}
                  <TiltCard className="h-full">
                    <div
                      className={`relative flex flex-col h-full rounded-2xl border p-6 backdrop-blur-sm hover-lift transition-all ${
                        plan.highlighted
                          ? "border-primary bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 shadow-2xl shadow-primary/20 scale-[1.03]"
                          : plan.priceUnit === "once"
                            ? "border-accent/50 bg-accent/5"
                            : "border-border/60 bg-card/50"
                      }`}
                    >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-muted-foreground text-lg">৳</span>
                        <span className="text-4xl font-bold tabular-nums">{plan.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground ms-1">
                          {plan.priceUnit === "once" ? t.pricing.oneTime : t.pricing.perMonth}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 flex-1 mb-5 text-xs">
                      {plan.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="size-3.5 text-success mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-primary font-medium">+ {plan.features.length - 5} more</li>
                      )}
                    </ul>

                    <Magnetic strength={0.15}>
                      <Link
                        href={`/pricing/${plan.slug}`}
                        className={
                          buttonVariants({ variant: plan.highlighted ? "default" : "outline", size: "sm" }) +
                          " w-full" +
                          (plan.highlighted ? " bg-gradient-primary text-white shadow-lg hover:shadow-xl" : "")
                        }
                      >
                        {plan.cta}
                      </Link>
                    </Magnetic>
                    </div>
                  </TiltCard>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS — two-row infinite marquee with BD-style avatars
      ═══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto relative py-28 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <Reveal variant="fade-up" className="mb-14 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.testimonials.eyebrow}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.testimonials.title}</h2>
          </Reveal>
        </div>

        {/* Row 1 — scrolls right → left, first half of items */}
        <Reveal variant="fade-up" className="mb-5">
          <Marquee speed="55s">
            {t.testimonials.list.slice(0, 3).map((tt, i) => (
              <TestimonialCard key={`r1-${i}`} {...tt} />
            ))}
            {/* repeat so the row is dense enough */}
            {t.testimonials.list.slice(0, 3).map((tt, i) => (
              <TestimonialCard key={`r1-dup-${i}`} {...tt} />
            ))}
          </Marquee>
        </Reveal>

        {/* Row 2 — scrolls left → right, second half + offset for variety */}
        <Reveal variant="fade-up" delay={200}>
          <Marquee reverse speed="65s">
            {t.testimonials.list.slice(3).map((tt, i) => (
              <TestimonialCard key={`r2-${i}`} {...tt} />
            ))}
            {t.testimonials.list.slice(3).map((tt, i) => (
              <TestimonialCard key={`r2-dup-${i}`} {...tt} />
            ))}
            {/* Also interleave first row items for fullness */}
            {t.testimonials.list.slice(0, 2).map((tt, i) => (
              <TestimonialCard key={`r2-extra-${i}`} {...tt} />
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto relative py-28 border-y border-border/40 mesh-bg-2">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
          <Reveal variant="fade-up" className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.faq.eyebrow}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.faq.title}</h2>
          </Reveal>

          <div className="space-y-3">
            {t.faq.list.map((item, i) => (
              <Reveal key={i} variant="fade-up" delay={i * 80}>
                <details className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition hover:border-primary/50 hover:shadow-xl shine-border">
                  <summary className="cursor-none flex items-center justify-between gap-4 font-semibold list-none">
                    <span>{item.q}</span>
                    <span className="transition-transform duration-300 group-open:rotate-45 flex size-7 items-center justify-center rounded-full border border-border/60 group-hover:border-primary/50 text-lg leading-none text-primary shrink-0">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — dramatic gradient card
      ═══════════════════════════════════════════════════════════════ */}
      <section className="cv-auto relative py-28">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-20 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_50%)]" aria-hidden />
              <div className="relative">
                <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl mb-6 animate-float">
                  <Zap className="size-8" />
                </div>
                <h2 className="text-3xl md:text-6xl font-bold mb-4 tracking-tight">{t.finalCta.title}</h2>
                <p className="text-white/90 mb-8 text-lg max-w-xl mx-auto">{t.finalCta.subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 text-base font-semibold hover:shadow-2xl transition-shadow">
                      {t.finalCta.primary} <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.25}>
                    <Link href="/contact" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-8 py-3.5 text-base font-semibold hover:bg-white/10 transition">
                      {t.finalCta.secondary}
                    </Link>
                  </Magnetic>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> SSL encrypted</span>
                  <span>·</span>
                  <span>99.9% uptime</span>
                  <span>·</span>
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
