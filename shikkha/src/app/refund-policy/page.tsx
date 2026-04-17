import Link from "next/link";
import { Shield, CheckCircle2, CalendarClock, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
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
  title: "Refund Policy — Muhius Sunnah",
  description: "30-day full money-back guarantee, no questions asked. Your trust is our priority.",
};

export default function RefundPolicyPage() {
  return (
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg-1 py-20 md:py-28">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">
                <Shield className="me-1 size-3" /> Refund Policy
              </Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                ৩০ দিনের{" "}
                <span className="text-gradient-primary animate-gradient">Full Money-Back Guarantee</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                No Questions Asked. আপনি যদি কোনো কারণে সন্তুষ্ট না হন, ৩০ দিনের মধ্যে ১০০% টাকা ফেরত পাবেন।
              </p>
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
                      <Badge className="bg-success text-white">GUARANTEED</Badge>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">100% Satisfaction</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                      কোন সন্তুষ্টি নেই? <span className="text-success">টাকা ফেরত।</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      আমরা আমাদের সফটওয়্যারের মানের উপর সম্পূর্ণ আত্মবিশ্বাসী। যদি কোনো কারণে আপনি সন্তুষ্ট না হন, কেনাকাটার ৩০ দিনের মধ্যে ইমেইল/WhatsApp করুন — আমরা <strong className="text-foreground">পূর্ণ টাকা ফেরত দেব। কোনো প্রশ্ন করা হবে না।</strong>
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* How it works — 3 steps */}
          <div>
            <Reveal variant="fade-up" className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">Refund কিভাবে পাবেন?</h2>
              <p className="text-muted-foreground mt-2">মাত্র ৩ ধাপে</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { step: "১", icon: MessageCircle, accent: "from-primary to-accent", title: "যোগাযোগ করুন", desc: "refund@muhiussunnah.com-এ ইমেইল পাঠান অথবা WhatsApp-এ message দিন। আপনার purchase invoice number mention করুন।" },
                { step: "২", icon: CalendarClock, accent: "from-accent to-secondary", title: "২৪ ঘণ্টায় reply", desc: "আমাদের support team ২৪ ঘণ্টার মধ্যে আপনাকে যোগাযোগ করে refund process শুরু করবে।" },
                { step: "৩", icon: CreditCard, accent: "from-success to-accent", title: "৩-৭ দিনে টাকা ফেরত", desc: "আপনার পেমেন্ট method-এ (bKash/Nagad/bank) ৩-৭ কর্মদিবসে টাকা জমা হবে।" },
              ].map((s, i) => (
                <Reveal key={s.step} variant="fade-up" delay={i * 120}>
                  <TiltCard>
                    <div className="shine-border relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift">
                      <div className="absolute top-3 end-3 text-5xl font-black text-primary/10">{s.step}</div>
                      <div className={`relative inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-lg mb-4`}>
                        <s.icon className="size-5" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal variant="slide-right">
              <TiltCard>
                <div className="h-full rounded-2xl border border-success/30 bg-success/5 p-6 hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="size-5 text-success" />
                    <h3 className="font-semibold text-lg">যা Cover করা হয়</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> ৩০ দিনের মধ্যে যে কোনো সাবস্ক্রিপশন plan</li>
                    <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> Lifetime Basic plan (৩০ দিন পর্যন্ত)</li>
                    <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> Technical issue, software bug — instant refund</li>
                    <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> যদি আপনার প্রত্যাশা পূরণ না হয়</li>
                    <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> কোনো কারণ ছাড়াই — No Questions Asked</li>
                  </ul>
                </div>
              </TiltCard>
            </Reveal>

            <Reveal variant="slide-left">
              <TiltCard>
                <div className="h-full rounded-2xl border border-warning/30 bg-warning/5 p-6 hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarClock className="size-5 text-warning" />
                    <h3 className="font-semibold text-lg">শর্ত</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-warning mt-0.5">•</span> কেনাকাটার তারিখ থেকে ৩০ দিন সময়সীমা</li>
                    <li className="flex items-start gap-2"><span className="text-warning mt-0.5">•</span> Purchase invoice / transaction ID লাগবে</li>
                    <li className="flex items-start gap-2"><span className="text-warning mt-0.5">•</span> SMS credit-এ টাকা খরচ হলে সেটা বাদ পড়বে</li>
                    <li className="flex items-start gap-2"><span className="text-warning mt-0.5">•</span> Custom development / migration fee non-refundable</li>
                    <li className="flex items-start gap-2"><span className="text-warning mt-0.5">•</span> Refund শুধু original পেমেন্ট method-এ যাবে</li>
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
                <h2 className="text-3xl md:text-5xl font-bold mb-3">ঝুঁকি ছাড়া Try করুন</h2>
                <p className="text-white/90 mb-8 text-lg">১৫ দিন ফ্রি ট্রায়াল + ৩০ দিন refund গ্যারান্টি = মোট ৪৫ দিন সম্পূর্ণ নিরাপদ</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Magnetic>
                    <Link href="/register-school" className="inline-flex items-center gap-2 rounded-md bg-white text-primary px-8 py-3.5 font-semibold hover:shadow-2xl transition">
                      ফ্রি ট্রায়াল শুরু <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-2 rounded-md border-2 border-white/60 bg-white/10 backdrop-blur-sm px-8 py-3.5 font-semibold text-white transition hover:bg-white/20 hover:border-white"
                  >
                    সাপোর্ট টিমের সাথে কথা
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
