import Link from "next/link";
import { cookies } from "next/headers";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ContactForm } from "./contact-form";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

export const metadata = {
  title: "Contact",
  description:
    "Talk to Muhius Sunnah — demos, partnerships, support. Call +880 1767-682381 or email us. Bangla, English, Arabic, Urdu support available.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Muhius Sunnah",
    description: "Talk to us — demos, partnerships, support. Multi-language support team.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);
  const c = t.contact;

  const infoCards = [
    { icon: Phone,          accent: "from-primary to-accent",   title: c.infoCards.phone,    href: "tel:+8801767682381",              line1: c.phoneDisplay,     line2: c.infoLines.phoneHours },
    { icon: Mail,           accent: "from-accent to-secondary", title: c.infoCards.email,    href: "mailto:muhiussunnah2026@gmail.com", line1: "muhiussunnah2026@gmail.com", line2: c.infoLines.emailReply },
    { icon: MessageCircle,  accent: "from-success to-accent",   title: c.infoCards.whatsapp, href: "https://wa.me/8801767682381",     line1: c.phoneDisplay,     line2: c.infoLines.whatsappResponse },
    { icon: MapPin,         accent: "from-secondary to-primary",title: c.infoCards.office,   href: "#",                               line1: c.officeLocation,   line2: c.infoLines.officeVisit },
  ];

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg-3 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">{c.badge}</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                {c.title}{" "}
                <span className="text-gradient-primary animate-gradient">{c.titleAccent}</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{c.subtitle}</p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Contact form */}
            <Reveal variant="slide-right">
              <div className="grad-border rounded-3xl overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-1">{c.formHeading}</h2>
                  <p className="text-sm text-muted-foreground mb-6">{c.formSubheading}</p>
                  <ContactForm
                    labels={c.labels}
                    placeholders={c.placeholders}
                    subjectOptions={c.subjectOptions}
                    submitCta={c.submitCta}
                    submittingCta={locale === "en" ? "Sending…" : "পাঠানো হচ্ছে…"}
                  />
                  <p className="mt-3 text-xs text-muted-foreground text-center">{c.submitNote}</p>
                </div>
              </div>
            </Reveal>

            {/* Contact info cards — no shine-border so the phone number never clips */}
            <div className="space-y-4">
              {infoCards.map((item, i) => (
                <Reveal key={item.title} variant="slide-left" delay={i * 100}>
                  <TiltCard>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group h-full rounded-2xl border border-border/60 bg-card/50 p-5 flex items-start gap-4 backdrop-blur-sm hover-lift transition"
                    >
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg transition-transform group-hover:scale-110`}>
                        <item.icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors whitespace-nowrap overflow-hidden text-ellipsis" dir="ltr">
                          {item.line1}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.line2}</p>
                      </div>
                    </a>
                  </TiltCard>
                </Reveal>
              ))}

              <Reveal variant="slide-left" delay={400}>
                <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex items-start gap-3 backdrop-blur-sm">
                  <Clock className="size-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">{c.supportHoursTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
                      {c.supportHoursBody}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Quick links */}
          <Reveal variant="fade-up" className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-3">{c.quickLinksTitle}</h3>
            <p className="text-muted-foreground mb-5 text-sm">{c.quickLinksSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>{c.quickLinksSeePricing}</Link>
              <Link href="/features" className={buttonVariants({ variant: "outline" })}>{c.quickLinksSeeFeatures}</Link>
              <Magnetic strength={0.15}>
                <Link href="/register-school" className={buttonVariants() + " bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20"}>
                  {c.quickLinksFreeTrial}
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
