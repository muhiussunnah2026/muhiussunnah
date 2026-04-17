import Link from "next/link";
import { Heart, Target, Users, Zap, ArrowRight } from "lucide-react";
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
import { AnimatedCounter } from "@/components/marketing/animated-counter";

export const metadata = {
  title: "About — Muhius Sunnah",
  description: "Our mission: modernize Bangladesh's schools and madrasas with local-first technology.",
};

export default function AboutPage() {
  return (
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-1 py-20 md:py-28">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">আমাদের গল্প</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-7xl leading-[1.05]">
                বাংলাদেশের জন্য তৈরি,{" "}
                <span className="text-gradient-primary animate-gradient">বাংলাদেশের মানুষদের দ্বারা</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Muhius Sunnah-এর যাত্রা শুরু একটি সহজ প্রশ্ন দিয়ে — কেন আমাদের স্কুলগুলোর জন্য বিদেশি software-ই একমাত্র বিকল্প?
              </p>
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
                <h2 className="text-2xl md:text-4xl font-bold mb-4">আমাদের মিশন</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  বাংলাদেশের প্রত্যেক স্কুল ও মাদ্রাসায় আধুনিক প্রযুক্তি পৌঁছে দেয়া — সাশ্রয়ী মূল্যে, বাংলা ভাষায়, স্থানীয় context-এ।
                </p>
              </div>
            </TiltCard>
          </Reveal>

          {/* Values */}
          <div>
            <Reveal variant="fade-up">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">আমাদের মূল্যবোধ</h2>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Heart, accent: "from-destructive to-secondary", title: "সাশ্রয়ী মূল্য", desc: "ছোট প্রতিষ্ঠানও যেন ব্যবহার করতে পারে — তাই Lifetime ৫,০০০ টাকার প্ল্যান।" },
                { icon: Users, accent: "from-primary to-accent", title: "স্থানীয় সহযোগিতা", desc: "আমাদের team পুরোপুরি বাংলাদেশে। বাংলা সাপোর্ট, বাংলাদেশি context।" },
                { icon: Zap, accent: "from-warning to-secondary", title: "গতি ও উদ্ভাবন", desc: "Bornomala যা করতে ২ বছর লাগায়, আমরা ২ সপ্তাহে করি।" },
              ].map((v, i) => (
                <Reveal key={v.title} variant="fade-up" delay={i * 120}>
                  <TiltCard>
                    <div className="shine-border group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                      <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.accent} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <v.icon className="size-5" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Story */}
          <Reveal variant="fade-up">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">কেন Muhius Sunnah?</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <TiltCard>
                <div className="h-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 hover-lift">
                  <div className="text-sm font-semibold text-destructive mb-2">❌ সমস্যা</div>
                  <p className="text-muted-foreground leading-relaxed">
                    বাংলাদেশের বেশিরভাগ স্কুল ও মাদ্রাসা এখনো কাগজে-কলমে চলে। Bornomala-র মতো সিস্টেম dated, অনলাইন পেমেন্ট নেই, মাদ্রাসা feature নেই, সাপোর্ট ধীর।
                  </p>
                </div>
              </TiltCard>
              <TiltCard>
                <div className="h-full rounded-2xl border border-success/30 bg-success/5 p-6 hover-lift">
                  <div className="text-sm font-semibold text-success mb-2">✅ আমাদের সমাধান</div>
                  <p className="text-muted-foreground leading-relaxed">
                    আধুনিক tech stack (Next.js 16, Supabase, AI) — কিন্তু UI বাংলায়, workflow বাংলাদেশি, pricing সাশ্রয়ী। হিফজ/কিতাব/সবক module, bKash/Nagad, অফলাইন mode।
                  </p>
                </div>
              </TiltCard>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal variant="fade-up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-10 md:p-14 noise">
              <div className="aurora-beam opacity-40" aria-hidden />
              <div className="relative grid gap-6 md:grid-cols-4 text-center">
                {[
                  { value: 2026, label: "প্রতিষ্ঠিত", bangla: true },
                  { value: 120, suffix: "+", label: "প্রতিষ্ঠান" },
                  { value: 50000, suffix: "+", label: "শিক্ষার্থী" },
                  { value: 4, label: "ভাষা" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl md:text-5xl font-bold text-gradient-primary tabular-nums">
                      <AnimatedCounter value={s.value} suffix={s.suffix ?? ""} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal variant="scale-in">
            <div className="text-center py-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">আমাদের journey-এ যোগ দিন</h2>
              <p className="text-muted-foreground mb-8 text-lg">আপনার প্রতিষ্ঠানকে আধুনিকীকরণে আমরা সাথে আছি।</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Magnetic>
                  <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-2xl shadow-primary/40 text-base px-8"}>
                    ফ্রি ট্রায়াল শুরু করুন <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
                  </Link>
                </Magnetic>
                <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-8"}>
                  আমাদের সাথে যোগাযোগ
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
