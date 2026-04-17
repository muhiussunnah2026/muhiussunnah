import Link from "next/link";
import { Heart, Target, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata = {
  title: "About — Shikkha Platform",
  description: "Shikkha — bengali-first school and madrasa management platform. Our mission, story, and team.",
};

export default function AboutPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 py-16 md:px-8 md:py-24 text-center">
            <Badge variant="outline" className="px-3 mb-4">আমাদের গল্প</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              বাংলাদেশের জন্য তৈরি,{" "}
              <span className="text-gradient-primary">বাংলাদেশের মানুষদের দ্বারা</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Shikkha Platform-এর যাত্রা শুরু একটি সহজ প্রশ্ন দিয়ে — কেন আমাদের স্কুলগুলোর জন্য বিদেশি software-ই একমাত্র বিকল্প? আমরা তৈরি করেছি নিজস্ব সমাধান।
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8 space-y-12">
          {/* Mission */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8 md:p-12 text-center">
              <Target className="size-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">আমাদের মিশন</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                বাংলাদেশের প্রত্যেক স্কুল ও মাদ্রাসায় আধুনিক প্রযুক্তি পৌঁছে দেয়া — সাশ্রয়ী মূল্যে, বাংলা ভাষায়, স্থানীয় context-এ।
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">আমাদের মূল্যবোধ</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Heart, title: "সাশ্রয়ী মূল্য", desc: "ছোট প্রতিষ্ঠানও যেন ব্যবহার করতে পারে — তাই Lifetime ৫,০০০ টাকার প্ল্যান। আমাদের লক্ষ্য access, profit নয়।" },
                { icon: Users, title: "স্থানীয় সহযোগিতা", desc: "আমাদের team পুরোপুরি বাংলাদেশে। সাপোর্ট বাংলায়, time zone বাংলাদেশ, context বাংলাদেশ।" },
                { icon: Zap, title: "গতি ও উদ্ভাবন", desc: "নতুন feature দ্রুত, feedback-based পরিবর্তন। Bornomala যা করতে ২ বছর লাগায়, আমরা ২ সপ্তাহে।" },
              ].map((v) => (
                <Card key={v.title} className="border-border/60">
                  <CardContent className="p-6">
                    <div className="inline-flex size-10 items-center justify-center rounded-lg bg-gradient-primary text-white mb-3">
                      <v.icon className="size-5" />
                    </div>
                    <h3 className="font-semibold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Story */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">কেন Shikkha?</h2>
            <div className="grid gap-8 md:grid-cols-2 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-lg mb-2">সমস্যা</h3>
                <p className="text-muted-foreground leading-relaxed">
                  বাংলাদেশের বেশিরভাগ স্কুল ও মাদ্রাসা এখনো কাগজে-কলমে চলে। যারা software ব্যবহার করেন, তাঁদের অপশন সীমিত — Bornomala-এর মতো সিস্টেম dated, অনলাইন পেমেন্ট নেই, মাদ্রাসা feature নেই, সাপোর্ট ধীর।
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">আমাদের সমাধান</h3>
                <p className="text-muted-foreground leading-relaxed">
                  আধুনিক tech stack (Next.js 16, Supabase, AI) — কিন্তু UI বাংলায়, workflow বাংলাদেশি, pricing সাশ্রয়ী। হিফজ/কিতাব/সবক module আছে, bKash/Nagad integration আছে, অফলাইন mode আছে।
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8 md:p-12">
            <div className="grid gap-6 md:grid-cols-4 text-center">
              {[
                { value: "২০২৬", label: "প্রতিষ্ঠিত" },
                { value: "১২০+", label: "প্রতিষ্ঠান" },
                { value: "৫০,০০০+", label: "শিক্ষার্থী" },
                { value: "৪", label: "ভাষা" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl md:text-4xl font-bold text-gradient-primary">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">আমাদের journey-এ যোগ দিন</h2>
            <p className="text-muted-foreground mb-6">আপনার প্রতিষ্ঠানকে আধুনিকীকরণে আমরা সাথে আছি।</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register-school" className={buttonVariants({ size: "lg" }) + " bg-gradient-primary text-white hover:opacity-90"}>
                ফ্রি ট্রায়াল শুরু করুন
              </Link>
              <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
                আমাদের সাথে যোগাযোগ
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
