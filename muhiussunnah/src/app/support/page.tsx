import Link from "next/link";
import { cookies } from "next/headers";
import { PlayCircle, Phone, MessageCircle, BookOpen, Mail, Clock, LifeBuoy, ArrowRight, Video, Users } from "lucide-react";
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
import { getSupportPageCopy } from "@/lib/i18n/pages";

export const metadata = {
  title: "Support",
  description:
    "24/7 multi-channel support from Muhius Sunnah — video tutorials, live calls, WhatsApp, email. Get help in Bangla, English, Arabic, or Urdu.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support — Muhius Sunnah",
    description: "24/7 support — video tutorials, WhatsApp, live calls, email.",
    url: "/support",
  },
};

const channelIcons = { Video, Phone, MessageCircle, BookOpen } as const;
const contactIcons = { Mail, Phone, Clock } as const;

export default async function SupportPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const s = getSupportPageCopy(locale);

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-2 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">
                <LifeBuoy className="me-1 size-3" /> {s.heroBadge}
              </Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                {s.heroTitle}{" "}
                <span className="text-gradient-primary animate-gradient">{s.heroAccent}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{s.heroSubtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8 space-y-16">
          {/* 4 channel cards */}
          <div className="grid gap-5 md:grid-cols-2">
            {s.channels.map((ch, i) => {
              const Icon = channelIcons[ch.icon];
              return (
                <Reveal key={ch.title} variant="fade-up" delay={i * 120}>
                  <TiltCard>
                    <div className="group relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur-sm hover-lift">
                      <div className={`absolute -end-10 -top-10 size-40 rounded-full bg-gradient-to-br ${ch.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`} aria-hidden />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-5">
                          <div className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${ch.accent} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="size-6" />
                          </div>
                          <Badge variant="outline" className="text-xs">{ch.badge}</Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{ch.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{ch.desc}</p>
                        <a
                          href={ch.href}
                          target={ch.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
                        >
                          {ch.cta}
                          <ArrowRight className="size-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>

          {/* Demo featured card */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 p-10 md:p-14 noise">
              <div className="relative grid gap-8 md:grid-cols-[1fr_auto] items-center">
                <div>
                  <Badge className="bg-gradient-primary text-white mb-3">
                    <PlayCircle className="me-1 size-3" /> {s.demoBadge}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    {s.demoTitle}{" "}
                    <span className="text-gradient-primary">{s.demoAccent}</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{s.demoBody}</p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <a
                        href="https://wa.me/8801767682381?text=Hi%20-%20I%20want%20to%20book%20a%20live%20demo"
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ size: "lg" }) + " bg-gradient-primary text-white shadow-xl shadow-primary/30"}
                      >
                        <Video className="me-2 size-4" /> {s.demoBookCta}
                      </a>
                    </Magnetic>
                    <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
                      {s.demoContactCta}
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex size-40 items-center justify-center rounded-3xl bg-gradient-primary text-white shadow-2xl shadow-primary/40 animate-float">
                    <Users className="size-20" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Other channels */}
          <div>
            <Reveal variant="fade-up" className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{s.contactMoreTitle}</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {s.contactCards.map((c, i) => {
                const Icon = contactIcons[c.icon];
                return (
                  <Reveal key={c.label} variant="fade-up" delay={i * 100}>
                    <TiltCard>
                      <a href={c.href} className="grad-border flex items-center gap-4 rounded-2xl p-5 hover-lift transition">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{c.label}</div>
                          <div className="font-semibold">{c.value}</div>
                        </div>
                      </a>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* SLA table */}
          <Reveal variant="fade-up">
            <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
              <div className="p-6 border-b border-border/40">
                <h2 className="text-xl font-bold">{s.slaTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{s.slaSubtitle}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wider">
                    <tr>
                      {s.slaHeaders.map((h, i) => (
                        <th key={h} className={i === 0 ? "text-start p-4" : "p-4"}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.slaRows.map((r) => (
                      <tr key={r.plan} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold">{r.plan}</td>
                        <td className="p-4 text-center">{r.email}</td>
                        <td className="p-4 text-center">{r.whatsapp}</td>
                        <td className="p-4 text-center">{r.phone}</td>
                        <td className="p-4 text-center">{r.demo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
