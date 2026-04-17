import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { CustomCursor } from "@/components/marketing/custom-cursor";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";

export const metadata = {
  title: "Contact — Muhius Sunnah",
  description: "Get in touch for demos, support, or partnerships. Available in 4 languages.",
};

export default function ContactPage() {
  return (
    <div data-custom-cursor="on">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden mesh-bg-3 py-20 md:py-24">
          <div className="aurora-beam opacity-30" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="px-3 mb-4">যোগাযোগ</Badge>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.05]">
                আমরা আপনাকে{" "}
                <span className="text-gradient-primary animate-gradient">সাহায্য করতে প্রস্তুত</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={400}>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                প্রশ্ন আছে? Demo চান? Partnership proposal? — নিচের ফর্ম দিয়ে জানান, ২৪ ঘণ্টার মধ্যে reply পাবেন।
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Contact form */}
            <Reveal variant="slide-right">
              <div className="grad-border rounded-3xl overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-1">একটি বার্তা পাঠান</h2>
                  <p className="text-sm text-muted-foreground mb-6">আমাদের sales টিম দ্রুত যোগাযোগ করবে।</p>
                  <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">পূর্ণ নাম *</Label>
                        <Input id="name" name="name" placeholder="আপনার নাম" required />
                      </div>
                      <div>
                        <Label htmlFor="school">প্রতিষ্ঠানের নাম</Label>
                        <Input id="school" name="school" placeholder="স্কুল / মাদ্রাসা" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="email">ইমেইল *</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">মোবাইল</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="01XXXXXXXXX" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">কী নিয়ে?</Label>
                      <select id="subject" name="subject" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Demo দেখতে চাই</option>
                        <option>Pricing সম্পর্কে প্রশ্ন</option>
                        <option>টেকনিক্যাল সাপোর্ট</option>
                        <option>Partnership / Reseller</option>
                        <option>Migration সহায়তা</option>
                        <option>অন্যান্য</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="message">বার্তা *</Label>
                      <Textarea id="message" name="message" rows={5} placeholder="আপনার চাহিদা বা প্রশ্ন লিখুন" required />
                    </div>
                    <Magnetic strength={0.15}>
                      <Button type="submit" size="lg" className="w-full bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20">
                        <Send className="me-2 size-4" />
                        বার্তা পাঠান
                      </Button>
                    </Magnetic>
                    <p className="text-xs text-muted-foreground text-center">
                      আমরা সাধারণত ২৪ ঘণ্টার মধ্যে reply করি। Urgent হলে সরাসরি ফোন করুন।
                    </p>
                  </form>
                </div>
              </div>
            </Reveal>

            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: Phone, accent: "from-primary to-accent", title: "ফোন করুন", href: "tel:+8801767682381", lines: ["+৮৮০ ১৭৬৭-৬৮২৩৮১", "সকাল ৯টা - রাত ৯টা"] },
                { icon: Mail, accent: "from-accent to-secondary", title: "ইমেইল করুন", href: "mailto:itsinjamul@gmail.com", lines: ["itsinjamul@gmail.com", "২৪ ঘণ্টায় reply"] },
                { icon: MessageCircle, accent: "from-success to-accent", title: "WhatsApp", href: "https://wa.me/8801767682381", lines: ["+৮৮০ ১৭৬৭-৬৮২৩৮১", "দ্রুত response পেতে"] },
                { icon: MapPin, accent: "from-secondary to-primary", title: "অফিস", href: "#", lines: ["ঢাকা, বাংলাদেশ", "appointment-এ visit"] },
              ].map((item, i) => (
                <Reveal key={item.title} variant="slide-left" delay={i * 100}>
                  <TiltCard>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="shine-border group h-full rounded-2xl border border-border/60 bg-card/50 p-5 flex items-start gap-4 backdrop-blur-sm hover-lift"
                    >
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg transition-transform group-hover:scale-110`}>
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.lines.map((l, j) => (
                          <p key={j} className={j === 0 ? "text-sm font-medium group-hover:text-primary transition-colors" : "text-xs text-muted-foreground mt-0.5"}>{l}</p>
                        ))}
                      </div>
                    </a>
                  </TiltCard>
                </Reveal>
              ))}

              <Reveal variant="slide-left" delay={400}>
                <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex items-start gap-3 backdrop-blur-sm">
                  <Clock className="size-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">সাপোর্ট সময়</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      রবি - বৃহস্পতি: সকাল ৯টা - রাত ৯টা<br />
                      শুক্র - শনি: সকাল ১০টা - সন্ধ্যা ৬টা<br />
                      Scale প্ল্যানে: ২৪/৭
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Quick links */}
          <Reveal variant="fade-up" className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-3">দ্রুত উত্তর চান?</h3>
            <p className="text-muted-foreground mb-5 text-sm">আমাদের FAQ দেখুন অথবা প্রাইসিং পেজে যান।</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>প্রাইসিং দেখুন</Link>
              <Link href="/features" className={buttonVariants({ variant: "outline" })}>সকল ফিচার</Link>
              <Magnetic strength={0.15}>
                <Link href="/register-school" className={buttonVariants() + " bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20"}>
                  ফ্রি ট্রায়াল
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
