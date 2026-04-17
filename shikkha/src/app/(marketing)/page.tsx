import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight, Check, Star, Users, Calendar, Wallet, Award, Megaphone, BookOpen,
  Sparkles, Smartphone, Shield, Quote, ShieldCheck, Zap, TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

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
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -start-40 size-96 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -end-40 size-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 start-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center md:px-8 md:py-28 lg:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
            {t.hero.eyebrow}
          </span>

          <h1 className="max-w-5xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl animate-fade-up">
            {t.hero.title}{" "}
            <span className="text-gradient-primary animate-gradient">{t.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-gradient-primary text-white hover:opacity-90 shadow-xl shadow-primary/20 text-base px-8"}>
              {t.hero.primaryCta} <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
            </Link>
            <Link href="/features" className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-8"}>
              {t.hero.secondaryCta}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {t.hero.trustBadges.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1">{b}</span>
            ))}
          </div>

          {/* Product mockup */}
          <div className="relative mt-10 w-full max-w-5xl animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" aria-hidden />
            <div className="relative rounded-2xl border border-border/60 bg-card/50 p-2 shadow-2xl backdrop-blur">
              <div className="rounded-xl bg-background/80 p-6 md:p-10">
                {/* Dashboard preview */}
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: t.stats.students, value: "১,২৪৭", icon: Users, color: "text-primary" },
                    { label: "আজকের উপস্থিতি", value: "৯৪%", icon: Calendar, color: "text-success" },
                    { label: "এ মাসের আয়", value: "৳৮.৫লক্ষ", icon: Wallet, color: "text-accent" },
                    { label: "বাকি ফি", value: "৳১.২লক্ষ", icon: TrendingUp, color: "text-warning" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-border/40 bg-card p-4 text-start">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <m.icon className={`size-4 ${m.color}`} />
                        {m.label}
                      </div>
                      <div className="mt-2 text-2xl font-bold">{m.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-40 rounded-lg border border-border/40 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center text-muted-foreground text-sm">
                  📊 Live Dashboard Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: "৫০,০০০+", label: t.stats.students },
              { value: "১২০+", label: t.stats.schools },
              { value: "৳২কোটি+", label: t.stats.transactions },
              { value: "৪", label: t.stats.languages },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-gradient-primary">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <Badge variant="outline" className="px-3">{t.features.eyebrow}</Badge>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            {t.features.title}{" "}
            <span className="text-gradient-primary">{t.features.titleHighlight}</span>
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t.features.subtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.list.map((f) => {
            const Icon = iconMap[f.icon] ?? Sparkles;
            return (
              <Card key={f.title} className="group relative overflow-hidden border-border/60 bg-card/50 transition-all hover:shadow-hover hover:border-primary/40">
                <div className="absolute -start-10 -top-10 size-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-20" aria-hidden />
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section id="pricing" className="bg-muted/20 border-y border-border/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.pricing.eyebrow}</Badge>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t.pricing.title}{" "}
              <span className="text-gradient-primary">{t.pricing.titleHighlight}</span>
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.pricing.subtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {t.pricing.plans.map((plan) => (
              <Card key={plan.name} className={`relative flex flex-col ${plan.highlighted ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20" : "border-border/60"} ${plan.priceUnit === "once" ? "border-accent/50" : ""}`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-gradient-primary text-white shadow-md">
                    ⭐ {t.pricing.mostPopular}
                  </Badge>
                )}
                {plan.badge && !plan.highlighted && (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-accent text-accent-foreground shadow-md">
                    🏆 {plan.badge}
                  </Badge>
                )}
                <CardContent className="flex flex-col h-full p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">৳{plan.price.toLocaleString("en-IN")}</span>
                      <span className="text-sm text-muted-foreground">{plan.priceUnit === "once" ? ` ${t.pricing.oneTime}` : t.pricing.perMonth}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="size-3.5 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-xs text-primary">+ {plan.features.length - 5} more</li>
                    )}
                  </ul>

                  <Link
                    href="/pricing"
                    className={buttonVariants({ variant: plan.highlighted ? "default" : "outline", size: "sm" }) + " w-full" + (plan.highlighted ? " bg-gradient-primary text-white hover:opacity-90" : "")}
                  >
                    {plan.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <Badge variant="outline" className="px-3">{t.testimonials.eyebrow}</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.testimonials.title}</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {t.testimonials.list.map((tt, i) => (
            <Card key={i} className="border-border/60 bg-card/50">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-3 text-warning">
                  {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="size-4 fill-current" />)}
                </div>
                <Quote className="size-6 text-primary/40 mb-2" />
                <p className="text-sm leading-relaxed">{tt.quote}</p>
                <div className="mt-4 pt-4 border-t border-border/40">
                  <div className="font-semibold text-sm">{tt.author}</div>
                  <div className="text-xs text-muted-foreground">{tt.role} · {tt.school}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-muted/20 border-y border-border/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="px-3">{t.faq.eyebrow}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.faq.title}</h2>
          </div>

          <div className="space-y-3">
            {t.faq.list.map((item, i) => (
              <details key={i} className="group rounded-lg border border-border/60 bg-card/50 p-5 transition hover:border-primary/40">
                <summary className="cursor-pointer flex items-center justify-between font-semibold list-none">
                  {item.q}
                  <span className="transition-transform group-open:rotate-45 text-2xl leading-none text-primary">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" aria-hidden />
          <div className="relative">
            <Zap className="mx-auto size-12 mb-4 animate-float" />
            <h2 className="text-3xl md:text-5xl font-bold mb-3">{t.finalCta.title}</h2>
            <p className="text-white/90 mb-8 text-lg max-w-xl mx-auto">{t.finalCta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-white text-primary hover:bg-white/90 text-base px-8"}>
                {t.finalCta.primary} <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
              </Link>
              <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" }) + " border-white/40 text-white hover:bg-white/10 text-base px-8"}>
                {t.finalCta.secondary}
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> SSL encrypted</span>
              <span>·</span>
              <span>99.9% uptime</span>
              <span>·</span>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
