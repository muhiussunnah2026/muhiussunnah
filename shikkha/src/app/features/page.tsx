import Link from "next/link";
import {
  Users2, CalendarCheck, Wallet, ScrollText, Megaphone, BookOpen,
  Sparkles, Shield, Globe, Smartphone, Video, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "ফিচার — Shikkha Platform",
  description: "বাংলাদেশের স্কুল ও মাদ্রাসার জন্য সম্পূর্ণ ম্যানেজমেন্ট সিস্টেম — একাডেমিক, ফি, যোগাযোগ, AI — সব এক জায়গায়।",
};

const features = [
  {
    icon: <Users2 />,
    title: "ছাত্র-ছাত্রী ব্যবস্থাপনা",
    desc: "বাল্ক import, profile, guardian linking, transfer/promotion — ৩০ সেকেন্ডে ভর্তি।",
  },
  {
    icon: <CalendarCheck />,
    title: "QR উপস্থিতি",
    desc: "শিক্ষক ২ মিনিটে পুরো ক্লাসের হাজিরা নিতে পারেন। অভিভাবক তৎক্ষণাত SMS পান।",
  },
  {
    icon: <Wallet />,
    title: "অনলাইন পেমেন্ট",
    desc: "bKash, Nagad, Rocket, SSLCommerz — সরাসরি ফি কালেকশন। ৩০টি ফি হেড pre-configured।",
  },
  {
    icon: <ScrollText />,
    title: "পরীক্ষা ও রেজাল্ট",
    desc: "GPA 5.0 scale, position ranking, Bangla Unicode মার্কশীট, ডিজিটাল সার্টিফিকেট।",
  },
  {
    icon: <Megaphone />,
    title: "যোগাযোগ",
    desc: "SMS + WhatsApp + Push + Email — একটি নোটিশ চার চ্যানেলে। SMS ক্রেডিট system।",
  },
  {
    icon: <BookOpen />,
    title: "মাদ্রাসা মডিউল",
    desc: "হিফজ heatmap (৩০ পারা), কিতাব curriculum, দৈনিক সবক-সবকি-মানযিল গ্রিড। Hijri তারিখ।",
  },
  {
    icon: <Sparkles />,
    title: "AI দ্রোপআউট ঝুঁকি",
    desc: "উপস্থিতি + মার্কস + বকেয়া ফি দেখে risk score — গুরুতর কেস আগেই শনাক্ত।",
  },
  {
    icon: <Video />,
    title: "অনলাইন ক্লাস",
    desc: "Zoom / Google Meet / Teams integration। ছাত্ররা পোর্টাল থেকে যোগ দেয়।",
  },
  {
    icon: <BarChart3 />,
    title: "রিপোর্ট ও এনালিটিক্স",
    desc: "১০+ টাইপের রিপোর্ট — ফি কালেকশন, বকেয়া aging, উপস্থিতি, আয়-ব্যয়, বেতন।",
  },
  {
    icon: <Shield />,
    title: "২-স্তর সুরক্ষা",
    desc: "TOTP-based 2FA, RLS per tenant, encrypted backups, audit log — enterprise-grade।",
  },
  {
    icon: <Smartphone />,
    title: "অফলাইন PWA",
    desc: "নেট না থাকলেও হাজিরা ও মার্কস নিন — Auto-sync হবে যখন আবার অনলাইন হবে।",
  },
  {
    icon: <Globe />,
    title: "পাবলিক ওয়েবসাইট",
    desc: "প্রত্যেক স্কুলের জন্য ফ্রি পাবলিক পেজ। নোটিশ, ভর্তি তথ্য — শেয়ার করুন।",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">ফিচার</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">সম্পূর্ণ সমাধান — এক জায়গায়</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            বাংলাদেশের স্কুল ও মাদ্রাসার প্রতিটি চাহিদা মাথায় রেখে তৈরি। অতিরিক্ত সফটওয়্যার লাগবে না।
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-gradient-primary text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">সব ফিচার ১৫ দিন ফ্রি চেষ্টা করুন</h2>
          <p className="mb-6 text-white/90">কোন ক্রেডিট কার্ড লাগবে না — আজই শুরু করুন।</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="rounded-md bg-white text-primary px-6 py-3 font-medium hover:bg-white/90">
              ফ্রি ট্রায়াল শুরু করুন
            </Link>
            <Link href="/pricing" className={buttonVariants({ variant: "outline" }) + " border-white/30 text-white hover:bg-white/10"}>
              মূল্য দেখুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
