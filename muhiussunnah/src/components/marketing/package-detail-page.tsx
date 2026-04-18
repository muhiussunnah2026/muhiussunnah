import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X, Trophy, Sparkles } from "lucide-react";
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
import type { PackageDetailChromeCopy } from "@/lib/i18n/pages";

export type PackageDetail = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  priceUnit: "once" | "month";
  badge?: string;
  accent: "amber" | "gray" | "primary" | "violet";
  summary: string;
  whoFor: string[];
  sections: Array<{
    title: string;
    icon: string;
    items: Array<{ label: string; desc?: string; included: boolean }>;
  }>;
  notIncluded: string[];
  bestValue?: string;
  /** Optional savings comparison table — compares this plan's yearly cost against other plans. */
  savingsTable?: {
    title: string;
    subtitle: string;
    yourYearly: { label: string; amount: number };
    compareAgainst: Array<{ name: string; yearly: number; savingsPercent: number }>;
    footer?: string;
  };
};

const accentClasses: Record<PackageDetail["accent"], { border: string; bg: string; badge: string; icon: string }> = {
  amber: {
    border: "border-amber-500/40",
    bg: "from-amber-500/10 via-card to-orange-500/5",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
    icon: "from-amber-500 to-orange-600",
  },
  gray: {
    border: "border-border/60",
    bg: "from-card to-muted/20",
    badge: "bg-muted text-foreground",
    icon: "from-muted-foreground to-foreground",
  },
  primary: {
    border: "border-primary/50",
    bg: "from-primary/10 via-card to-accent/10",
    badge: "bg-gradient-primary text-white",
    icon: "from-primary to-accent",
  },
  violet: {
    border: "border-violet-500/40",
    bg: "from-violet-500/10 via-card to-fuchsia-500/5",
    badge: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
    icon: "from-violet-600 to-fuchsia-600",
  },
};

export function PackageDetailPage({ pkg, chrome }: { pkg: PackageDetail; chrome: PackageDetailChromeCopy }) {
  const a = accentClasses[pkg.accent];

  return (
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg-1 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-5xl px-4 md:px-8">
            <Reveal variant="fade-up">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-6"
              >
                <ArrowLeft className="size-3.5 rtl:rotate-180" /> {chrome.backToAll}
              </Link>
            </Reveal>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <Reveal variant="fade-up" delay={100}>
                <div>
                  {pkg.badge && (
                    <Badge className={`${a.badge} mb-3 shadow-md`}>
                      <Trophy className="me-1 size-3" /> {pkg.badge}
                    </Badge>
                  )}
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                    {pkg.name}{" "}
                    <span className="text-gradient-primary animate-gradient">{chrome.packageSuffix}</span>
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">{pkg.tagline}</p>
                  <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">{pkg.summary}</p>

                  <div className="mt-8 flex flex-wrap items-baseline gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-muted-foreground text-2xl">৳</span>
                      <span className="text-6xl font-bold tabular-nums">{pkg.price.toLocaleString("en-IN")}</span>
                      <span className="text-base text-muted-foreground ms-1">
                        {pkg.priceUnit === "once" ? chrome.payOnce : chrome.perMonth}
                      </span>
                    </div>
                    {pkg.priceUnit === "once" && (
                      <Badge className="bg-accent/10 text-accent border-accent/30" variant="outline">
                        {chrome.lifetimeBadge}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Magnetic>
                      <Link
                        href="/register-school"
                        className={buttonVariants({ size: "lg" }) + " bg-gradient-primary animate-gradient text-white shadow-xl shadow-primary/30 text-base px-8"}
                      >
                        {chrome.buyCta} <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
                      </Link>
                    </Magnetic>
                    <Link
                      href="https://wa.me/8801767682381?text=Hi%20-%20I%20want%20to%20know%20more%20about%20the%20package"
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-8"}
                    >
                      {chrome.whatsappCta}
                    </Link>
                  </div>
                </div>
              </Reveal>

              <Reveal variant="scale-in" delay={300}>
                <TiltCard>
                  <div className={`rounded-3xl border ${a.border} bg-gradient-to-br ${a.bg} p-8 backdrop-blur-sm shadow-2xl`}>
                    <div className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.icon} text-white shadow-lg mb-4`}>
                      <Sparkles className="size-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">{chrome.whoFor}</h3>
                    <ul className="space-y-2">
                      {pkg.whoFor.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-sm">
                          <Check className="size-4 text-success mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                    {pkg.bestValue && (
                      <div className="mt-5 pt-5 border-t border-border/40">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{chrome.bestValue}</div>
                        <p className="text-sm font-medium leading-relaxed">{pkg.bestValue}</p>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Savings comparison (optional — only for Lifetime-style plans) */}
        {pkg.savingsTable && (
          <section className="mx-auto w-full max-w-5xl px-4 pt-16 md:px-8">
            <Reveal variant="scale-in">
              <div className="relative overflow-hidden rounded-3xl border border-success/40 bg-gradient-to-br from-success/10 via-card to-success/5 p-8 md:p-12 shadow-2xl shadow-success/10">
                <div className="absolute -top-20 -end-20 size-56 rounded-full bg-success/20 blur-3xl" aria-hidden />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/20 text-success px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {chrome.hugeSaving}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">{pkg.savingsTable.title}</h2>
                  <p className="text-muted-foreground mb-6">{pkg.savingsTable.subtitle}</p>

                  <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                    {/* Your yearly cost highlighted */}
                    <div className="rounded-2xl border border-success/40 bg-success/10 p-5 md:w-56">
                      <div className="text-xs uppercase tracking-wider text-success font-semibold mb-1">
                        {pkg.savingsTable.yourYearly.label}
                      </div>
                      <div className="text-4xl font-bold text-foreground tabular-nums">
                        ৳{pkg.savingsTable.yourYearly.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{chrome.perYear}</div>
                    </div>

                    {/* Comparison rows */}
                    <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-5 py-3 border-b border-border/40">
                        {chrome.savingsCompareHeading}
                      </div>
                      {pkg.savingsTable.compareAgainst.map((c) => (
                        <div key={c.name} className="flex items-center justify-between px-5 py-3 border-b border-border/40 last:border-0 hover:bg-muted/20 transition">
                          <div>
                            <div className="font-semibold text-sm">{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ৳{c.yearly.toLocaleString("en-IN")}{chrome.perYearSuffix}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-success/15 border border-success/30 px-3 py-1">
                            <span className="text-sm font-bold text-success tabular-nums">{c.savingsPercent}%</span>
                            <span className="text-xs text-success">{chrome.savings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {pkg.savingsTable.footer && (
                    <p className="mt-5 text-xs text-muted-foreground leading-relaxed">* {pkg.savingsTable.footer}</p>
                  )}
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* Feature sections */}
        <section className="mx-auto w-full max-w-5xl px-4 py-20 md:px-8 space-y-12">
          {pkg.sections.map((sec, i) => (
            <Reveal key={sec.title} variant="fade-up" delay={i * 80}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{sec.icon}</span>
                  <h2 className="text-2xl md:text-3xl font-bold">{sec.title}</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {sec.items.map((it) => (
                    <div
                      key={it.label}
                      className={`shine-border rounded-xl border p-4 transition hover-lift ${
                        it.included
                          ? "border-success/30 bg-success/5"
                          : "border-muted/40 bg-muted/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${it.included ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground"}`}>
                          {it.included ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{it.label}</div>
                          {it.desc && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.desc}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

          {/* Not included */}
          {pkg.notIncluded.length > 0 && (
            <Reveal variant="fade-up">
              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <X className="size-5 text-warning" /> {chrome.notIncludedTitle} <em>{chrome.notIncludedTitleEm}</em>
                </h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {pkg.notIncluded.map((n) => (
                    <li key={n} className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  {chrome.notIncludedFooterBefore}
                  <Link href="/pricing" className="text-primary hover:underline font-medium">{chrome.notIncludedFooterLink}</Link>
                  {chrome.notIncludedFooterAfter}
                </p>
              </div>
            </Reveal>
          )}

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-14 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{pkg.name} {chrome.ctaStart}</h2>
                <p className="text-white/90 mb-6">{chrome.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition">
                      {chrome.ctaPrimary} <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Link href="/pricing" className="inline-flex items-center gap-2 rounded-md border border-white/40 px-8 py-3.5 font-semibold hover:bg-white/10 transition">
                    {chrome.ctaSecondary}
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
