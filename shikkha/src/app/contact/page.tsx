import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata = {
  title: "Contact — Shikkha Platform",
  description: "Get in touch with Shikkha Platform — sales, support, or partnerships. Available in 4 languages.",
};

export default function ContactPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden />
          <div className="relative mx-auto w-full max-w-4xl px-4 py-16 md:px-8 md:py-20 text-center">
            <Badge variant="outline" className="px-3 mb-4">যোগাযোগ</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              আমরা আপনাকে{" "}
              <span className="text-gradient-primary">সাহায্য করতে প্রস্তুত</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              প্রশ্ন আছে? Demo চান? Partnership proposal? — নিচের ফর্ম দিয়ে জানান, ২৪ ঘণ্টার মধ্যে reply পাবেন।
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Contact form */}
            <Card className="order-2 lg:order-1">
              <CardContent className="p-6 md:p-8">
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
                      <Input id="school" name="school" placeholder="স্কুল / মাদ্রাসার নাম" />
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
                  <Button type="submit" size="lg" className="w-full bg-gradient-primary text-white hover:opacity-90">
                    <Send className="me-2 size-4" />
                    বার্তা পাঠান
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    আমরা সাধারণত ২৪ ঘণ্টার মধ্যে reply করি। Urgent হলে সরাসরি ফোন করুন।
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Contact info */}
            <div className="order-1 lg:order-2 space-y-4">
              {[
                { icon: Phone, title: "ফোন করুন", lines: ["+৮৮০ ১৭XX-XXXXXX", "সকাল ৯টা - রাত ৯টা"] },
                { icon: Mail, title: "ইমেইল করুন", lines: ["hello@shikkha.app", "২৪ ঘণ্টায় reply"] },
                { icon: MessageCircle, title: "WhatsApp", lines: ["+৮৮০ ১৭XX-XXXXXX", "দ্রুত response পেতে"] },
                { icon: MapPin, title: "অফিস", lines: ["ঢাকা, বাংলাদেশ", "appointment-এ visit"] },
              ].map((item) => (
                <Card key={item.title} className="border-border/60">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-white">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.lines.map((l, i) => (
                        <p key={i} className={i === 0 ? "text-sm font-medium" : "text-xs text-muted-foreground"}>{l}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-5 flex items-start gap-3">
                  <Clock className="size-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">সাপোর্ট সময়</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      রবি - বৃহস্পতিবার: সকাল ৯টা - রাত ৯টা<br />
                      শুক্র - শনিবার: সকাল ১০টা - সন্ধ্যা ৬টা<br />
                      Scale প্ল্যানে: ২৪/৭
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ quick links */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-3">দ্রুত উত্তর চান?</h3>
            <p className="text-muted-foreground mb-5 text-sm">আমাদের FAQ দেখুন অথবা প্রাইসিং পেজে যান।</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>
                প্রাইসিং দেখুন
              </Link>
              <Link href="/features" className={buttonVariants({ variant: "outline" })}>
                সকল ফিচার
              </Link>
              <Link href="/register-school" className={buttonVariants() + " bg-gradient-primary text-white hover:opacity-90"}>
                ফ্রি ট্রায়াল
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
