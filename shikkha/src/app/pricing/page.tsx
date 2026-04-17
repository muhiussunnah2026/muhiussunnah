import Link from "next/link";
import { cookies } from "next/headers";
import { Check, Sparkles, Shield, Trophy, X, ArrowRight } from "lucide-react";
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
  title: "Pricing — Muhius Sunnah",
  description: "Transparent pricing for schools and madrasas. Lifetime deal ৳20,000 one-time. No hidden costs.",
};

export default async function PricingPage() {
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
        {/* Header */}
        <section className="relative overflow-hidden mesh-bg-1 py-20 md:py-28">
          <div className="aurora-beam opacity-40" aria-hidden />
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -top-20 start-[20%] size-72 rounded-full bg-primary/20 blur-[100px] animate-float-slow" />
            <div className="absolute top-10 end-[15%] size-80 rounded-full bg-accent/15 blur-[100px] animate-float" />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">{t.pricing.eyebrow}</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-7xl leading-[1.05]">
                {t.pricing.title}{" "}
                <span className="text-gradient-primary animate-gradient">{t.pricing.titleHighlight}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{t.pricing.subtitle}</p>
            </Reveal>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8 -mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {t.pricing.plans.map((plan, i) => (
              <Reveal key={plan.name} variant="fade-up" delay={i * 100}>
                <div className="relative h-full">
                  {/* Badge lives OUTSIDE TiltCard/shine-border so overflow:hidden doesn't clip it */}
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 z-20 bg-gradient-primary animate-gradient text-white shadow-lg whitespace-nowrap">
                      <Sparkles className="me-1 size-3" /> {t.pricing.mostPopular}
                    </Badge>
                  )}
                  {plan.badge && !plan.highlighted && (
                    <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg whitespace-nowrap">
                      <Trophy className="me-1 size-3" /> {plan.badge}
                    </Badge>
                  )}
                  <TiltCard className="h-full">
                    <div
                      className={`relative flex flex-col h-full rounded-2xl border p-6 backdrop-blur-sm transition-all hover-lift ${
                        plan.highlighted
                          ? "border-primary bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 shadow-2xl shadow-primary/20 scale-[1.03]"
                          : plan.priceUnit === "once"
                            ? "border-accent/50 bg-accent/5 shine-border"
                            : "border-border/60 bg-card/50 shine-border"
                      }`}
                    >
                    <div className="mb-5 pt-2">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-muted-foreground text-xl">৳</span>
                        <span className="text-4xl font-bold tabular-nums">{plan.price.toLocaleString("en-IN")}</span>
                        <span className="text-sm text-muted-foreground ms-1">
                          {plan.priceUnit === "once" ? t.pricing.oneTime : t.pricing.perMonth}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 flex-1 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="size-4 text-success mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Lifetime: tiny '* শর্ত প্রযোজ্য' note — no duplicate link, user clicks the single 'বিস্তারিত দেখুন' below the CTA */}
                    {plan.priceUnit === "once" && (
                      <p className="mb-3 text-[11px] text-muted-foreground/70 italic">
                        * শর্ত প্রযোজ্য
                      </p>
                    )}

                    <Magnetic strength={0.15}>
                      <Link
                        href="/register-school"
                        className={
                          buttonVariants({ variant: plan.highlighted ? "default" : "outline" }) +
                          " w-full" +
                          (plan.highlighted ? " bg-gradient-primary text-white shadow-lg hover:shadow-xl" : "")
                        }
                      >
                        {plan.cta}
                      </Link>
                    </Magnetic>
                    <Link
                      href={`/pricing/${plan.priceUnit === "once" ? "lifetime" : plan.name.toLowerCase()}`}
                      className="mt-2 text-center text-xs text-primary hover:underline underline-offset-4 font-medium"
                    >
                      {t.extras.viewDetails} →
                    </Link>
                    </div>
                  </TiltCard>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Comparison table */}
          <Reveal variant="fade-up" className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">ফিচার তুলনা</h2>
            <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shine-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="text-start p-4 font-medium">ফিচার</th>
                      <th className="p-4 font-semibold text-accent whitespace-nowrap">Lifetime</th>
                      <th className="p-4 font-semibold">Starter</th>
                      <th className="p-4 font-semibold text-primary">Growth</th>
                      <th className="p-4 font-semibold">Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "শিক্ষার্থী সীমা", values: ["২০০", "৫০০", "সীমাহীন", "সীমাহীন"] },
                      { label: "শিক্ষক ও স্টাফ ম্যানেজমেন্ট", values: [true, true, true, true] },
                      { label: "QR উপস্থিতি", values: [true, true, true, true] },
                      { label: "পরীক্ষা ও মার্কশীট", values: [true, true, true, true] },
                      { label: "সার্টিফিকেট প্রিন্ট", values: [true, true, true, true] },
                      { label: "অভিভাবক পোর্টাল", values: [true, true, true, true] },
                      { label: "ম্যানুয়াল ফি ট্র্যাকিং", values: [true, true, true, true] },
                      { label: "SMS নোটিফিকেশন", values: [false, "১,০০০/মাস", "৫,০০০/মাস", "২০,০০০/মাস"] },
                      { label: "অনলাইন পেমেন্ট (bKash, SSLCommerz)", values: [false, false, true, true] },
                      { label: "WhatsApp + Push", values: [false, false, true, true] },
                      { label: "AI ড্রপআউট ঝুঁকি", values: [false, false, true, true] },
                      { label: "AI রিপোর্ট কমেন্ট", values: [false, false, true, true] },
                      { label: "মাল্টি-ব্রাঞ্চ", values: [false, false, false, true] },
                      { label: "কাস্টম ডোমেইন", values: [false, false, false, true] },
                      { label: "পাবলিক স্কুল ওয়েবসাইট", values: [false, false, false, true] },
                      { label: "সাপোর্ট", values: ["কমিউনিটি", "ইমেইল", "প্রায়োরিটি", "২৪/৭ ফোন"] },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{row.label}</td>
                        {row.values.map((v, j) => (
                          <td key={j} className="p-4 text-center">
                            {v === true ? <Check className="inline size-4 text-success" />
                              : v === false ? <X className="inline size-4 text-muted-foreground/40" />
                              : <span className="text-xs">{v}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* Trust section */}
          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {[
              { icon: Shield, color: "text-success", title: "কোন লুকানো খরচ নেই", desc: "যা দেখছেন তাই পাবেন। Setup ফি নেই, cancellation ফি নেই।" },
              { icon: Sparkles, color: "text-accent", title: "১৫ দিন ফ্রি ট্রায়াল", desc: "সম্পূর্ণ access, কোন ক্রেডিট কার্ড লাগবে না।" },
              { icon: Trophy, color: "text-primary", title: "৫০,০০০+ শিক্ষার্থী", desc: "১২০+ প্রতিষ্ঠানের বিশ্বস্ত — বাংলাদেশের #১ পছন্দ।" },
            ].map((item, i) => (
              <Reveal key={item.title} variant="fade-up" delay={i * 120}>
                <TiltCard>
                  <div className="grad-border rounded-2xl p-6 hover-lift h-full">
                    <item.icon className={`size-8 ${item.color} mb-3`} />
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <Reveal variant="fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t.faq.title}</h2>
            </Reveal>
            <div className="space-y-3">
              {t.faq.list.slice(0, 4).map((item, i) => (
                <Reveal key={i} variant="fade-up" delay={i * 80}>
                  <details className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition hover:border-primary/50 shine-border">
                    <summary className="cursor-none flex items-center justify-between gap-4 font-semibold list-none">
                      <span>{item.q}</span>
                      <span className="transition-transform duration-300 group-open:rotate-45 flex size-7 items-center justify-center rounded-full border border-border/60 text-lg leading-none text-primary shrink-0">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Reveal variant="scale-in" className="mt-20">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/30 noise">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold mb-3">{t.finalCta.title}</h2>
                <p className="text-white/90 mb-8 text-lg">{t.finalCta.subtitle}</p>
                <Magnetic>
                  <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition-shadow">
                    {t.finalCta.primary} <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Magnetic>
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
