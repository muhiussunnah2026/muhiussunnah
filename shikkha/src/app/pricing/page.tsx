import Link from "next/link";
import { cookies } from "next/headers";
import { Check, Sparkles, Shield, Trophy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

export const metadata = {
  title: "Pricing — Shikkha Platform",
  description: "Transparent pricing for schools and madrasas. Lifetime deal from ৳5,000 one-time. No hidden costs.",
};

export default async function PricingPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <>
      <MarketingNav />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24 text-center">
            <Badge variant="outline" className="px-3 mb-4">{t.pricing.eyebrow}</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              {t.pricing.title} <span className="text-gradient-primary">{t.pricing.titleHighlight}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t.pricing.subtitle}</p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.pricing.plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col transition-all hover:shadow-hover ${
                  plan.highlighted
                    ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20 scale-[1.02]"
                    : plan.priceUnit === "once"
                      ? "border-accent/50 bg-accent/5"
                      : "border-border/60"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-gradient-primary text-white shadow-lg whitespace-nowrap">
                    <Sparkles className="me-1 size-3" /> {t.pricing.mostPopular}
                  </Badge>
                )}
                {plan.badge && !plan.highlighted && (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg whitespace-nowrap">
                    <Trophy className="me-1 size-3" /> {plan.badge}
                  </Badge>
                )}

                <CardContent className="flex flex-col h-full p-6 pt-8">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-muted-foreground text-xl">৳</span>
                      <span className="text-4xl font-bold">{plan.price.toLocaleString("en-IN")}</span>
                      <span className="text-sm text-muted-foreground ms-1">
                        {plan.priceUnit === "once" ? t.pricing.oneTime : t.pricing.perMonth}
                      </span>
                    </div>
                    {plan.priceUnit === "once" && (
                      <p className="text-xs text-accent font-medium mt-1">✨ {t.pricing.lifetime}</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-success mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register-school"
                    className={
                      buttonVariants({ variant: plan.highlighted ? "default" : "outline" }) +
                      " w-full" +
                      (plan.highlighted ? " bg-gradient-primary text-white hover:opacity-90 shadow-lg" : "")
                    }
                  >
                    {plan.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">ফিচার তুলনা</h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-start p-4 font-medium">ফিচার</th>
                      <th className="p-4 font-semibold text-accent">Lifetime</th>
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
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
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
              </CardContent>
            </Card>
          </div>

          {/* Trust section */}
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-6">
                <Shield className="size-8 text-success mb-3" />
                <h3 className="font-semibold mb-1">কোন লুকানো খরচ নেই</h3>
                <p className="text-sm text-muted-foreground">যা দেখছেন তাই পাবেন। Setup ফি নেই, cancellation ফি নেই।</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-6">
                <Sparkles className="size-8 text-accent mb-3" />
                <h3 className="font-semibold mb-1">১৫ দিন ফ্রি ট্রায়াল</h3>
                <p className="text-sm text-muted-foreground">সম্পূর্ণ access, কোন ক্রেডিট কার্ড লাগবে না।</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-6">
                <Trophy className="size-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">৫০,০০০+ শিক্ষার্থী</h3>
                <p className="text-sm text-muted-foreground">১২০+ প্রতিষ্ঠানের বিশ্বস্ত — বাংলাদেশের #১ পছন্দ।</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">{t.faq.title}</h2>
            <div className="space-y-3">
              {t.faq.list.slice(0, 4).map((item, i) => (
                <details key={i} className="group rounded-lg border border-border/60 bg-card/50 p-5 transition hover:border-primary/40">
                  <summary className="cursor-pointer flex items-center justify-between font-semibold list-none">
                    {item.q}
                    <span className="transition-transform group-open:rotate-45 text-2xl leading-none text-primary">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl bg-gradient-primary animate-gradient p-10 md:p-16 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">{t.finalCta.title}</h2>
            <p className="text-white/90 mb-6">{t.finalCta.subtitle}</p>
            <Link href="/register-school" className="inline-block rounded-md bg-white text-primary px-8 py-3 font-medium hover:bg-white/90">
              {t.finalCta.primary}
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
