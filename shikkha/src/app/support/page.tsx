import Link from "next/link";
import { PlayCircle, Phone, MessageCircle, BookOpen, Mail, Clock, LifeBuoy, ArrowRight, Video, Users } from "lucide-react";
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

export const metadata = {
  title: "Support — Muhius Sunnah",
  description: "Multi-channel support: video tutorials, live calls, WhatsApp, email — we're here to help you succeed.",
};

export default function SupportPage() {
  return (
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg-2 py-20 md:py-28">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">
                <LifeBuoy className="me-1 size-3" /> Support Center
              </Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                আমরা আপনার সাথে{" "}
                <span className="text-gradient-primary animate-gradient">সবসময় আছি</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Video টিউটোরিয়াল, live call, WhatsApp — যে চ্যানেলে সুবিধা, সেখানেই সাপোর্ট পান। বাংলায়, ২৪/৭।
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8 space-y-16">
          {/* Main 4-channel grid */}
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: Video,
                accent: "from-[#FF0000] to-[#cc0000]",
                title: "Video Tutorial Library",
                desc: "১০০+ বাংলা video tutorial — setup থেকে advanced features পর্যন্ত সব। প্রতিটি মডিউলের step-by-step walkthrough। নতুন update-এ নতুন video।",
                cta: "Tutorials দেখুন",
                href: "#",
                badge: "১০০+ videos",
                badgeColor: "bg-red-500/10 text-red-500 border-red-500/30",
              },
              {
                icon: Phone,
                accent: "from-primary to-accent",
                title: "Live Phone Call",
                desc: "সরাসরি আমাদের সাপোর্ট engineer-এর সাথে কথা বলুন। Screen share, guided setup, problem-solving — সব সম্ভব। Scale plan-এ ২৪/৭ available।",
                cta: "ফোন করুন",
                href: "tel:+8801767682381",
                badge: "২৪/৭ (Scale plan)",
                badgeColor: "bg-primary/10 text-primary border-primary/30",
              },
              {
                icon: MessageCircle,
                accent: "from-[#25D366] to-[#128C7E]",
                title: "WhatsApp Chat",
                desc: "আপনার প্রশ্ন WhatsApp-এ পাঠান, গড়ে ১৫ মিনিটে reply। Screenshot, voice message, video call — সব support করি।",
                cta: "WhatsApp-এ Chat",
                href: "https://wa.me/8801767682381",
                badge: "১৫ মিনিট avg response",
                badgeColor: "bg-green-500/10 text-green-500 border-green-500/30",
              },
              {
                icon: BookOpen,
                accent: "from-accent to-secondary",
                title: "Help Center & Docs",
                desc: "Self-service documentation — ২০০+ article, FAQ, troubleshooting guides, video walkthroughs। Search-করে instant answer পান।",
                cta: "ডকুমেন্টেশন দেখুন",
                href: "#",
                badge: "২০০+ articles",
                badgeColor: "bg-accent/10 text-accent border-accent/30",
              },
            ].map((ch, i) => (
              <Reveal key={ch.title} variant="fade-up" delay={i * 120}>
                <TiltCard>
                  <div className="group shine-border relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur-sm hover-lift">
                    <div className={`absolute -end-10 -top-10 size-40 rounded-full bg-gradient-to-br ${ch.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`} aria-hidden />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-5">
                        <div className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${ch.accent} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <ch.icon className="size-6" />
                        </div>
                        <Badge variant="outline" className={`text-xs ${ch.badgeColor}`}>{ch.badge}</Badge>
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
            ))}
          </div>

          {/* Featured — live demo/call CTA */}
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 p-10 md:p-14 noise">
              <div className="relative grid gap-8 md:grid-cols-[1fr_auto] items-center">
                <div>
                  <Badge className="bg-gradient-primary text-white mb-3">
                    <PlayCircle className="me-1 size-3" /> Featured
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    একটি <span className="text-gradient-primary">Live Demo</span> বুকিং করুন
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    আমাদের expert-এর সাথে ৩০ মিনিটের personalized demo। আপনার প্রতিষ্ঠানের exact চাহিদা অনুযায়ী সফটওয়্যার walk-through। ফ্রি, কোন obligation নেই।
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <a
                        href="https://wa.me/8801767682381?text=Hi%20-%20I%20want%20to%20book%20a%20live%20demo"
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ size: "lg" }) + " bg-gradient-primary text-white shadow-xl shadow-primary/30"}
                      >
                        <Video className="me-2 size-4" /> ফ্রি Demo Book
                      </a>
                    </Magnetic>
                    <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
                      Contact Form
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
              <h2 className="text-2xl md:text-3xl font-bold">আরও যোগাযোগের উপায়</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Mail, label: "Email সাপোর্ট", value: "itsinjamul@gmail.com", href: "mailto:itsinjamul@gmail.com" },
                { icon: Phone, label: "Hotline", value: "+৮৮০ ১৭৬৭-৬৮২৩৮১", href: "tel:+8801767682381" },
                { icon: Clock, label: "সাপোর্ট সময়", value: "সকাল ৯টা - রাত ৯টা", href: "#" },
              ].map((c, i) => (
                <Reveal key={c.label} variant="fade-up" delay={i * 100}>
                  <TiltCard>
                    <a
                      href={c.href}
                      className="grad-border flex items-center gap-4 rounded-2xl p-5 hover-lift transition"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <c.icon className="size-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{c.label}</div>
                        <div className="font-semibold">{c.value}</div>
                      </div>
                    </a>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* SLA table */}
          <Reveal variant="fade-up">
            <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
              <div className="p-6 border-b border-border/40">
                <h2 className="text-xl font-bold">Response Time (SLA)</h2>
                <p className="text-sm text-muted-foreground mt-1">আপনার plan অনুযায়ী সাপোর্ট response</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-start p-4">Plan</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">WhatsApp</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Live Demo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { plan: "Lifetime Basic", email: "৪৮ ঘণ্টা", whatsapp: "—", phone: "—", demo: "একবার" },
                      { plan: "Starter", email: "২৪ ঘণ্টা", whatsapp: "—", phone: "—", demo: "✓" },
                      { plan: "Growth", email: "৮ ঘণ্টা", whatsapp: "১৫ মিনিট", phone: "Office hours", demo: "✓" },
                      { plan: "Scale", email: "৪ ঘণ্টা", whatsapp: "ইনস্ট্যান্ট", phone: "২৪/৭", demo: "unlimited" },
                    ].map((r) => (
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
