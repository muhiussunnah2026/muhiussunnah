import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "মূল্য পরিকল্পনা — Shikkha Platform",
  description: "প্রতিষ্ঠানের আকার অনুযায়ী সাশ্রয়ী প্রাইসিং। ১৫ দিন ফ্রি ট্রায়াল, কোন ক্রেডিট কার্ড প্রয়োজন নেই।",
};

const plans = [
  {
    name: "Starter",
    tagline: "ছোট স্কুল/মাদ্রাসা",
    price: 500,
    students: "১০০ জন পর্যন্ত",
    features: [
      "সকল একাডেমিক মডিউল",
      "ফি কালেকশন ও ইনভয়েস",
      "অভিভাবক পোর্টাল",
      "SMS ক্রেডিট: ১০০০/মাস",
      "ইমেইল সাপোর্ট",
    ],
  },
  {
    name: "Growth",
    tagline: "মাঝারি প্রতিষ্ঠান",
    price: 1500,
    students: "৫০০ জন পর্যন্ত",
    highlighted: true,
    features: [
      "Starter-এর সব কিছু",
      "অনলাইন পেমেন্ট (bKash, SSLCommerz)",
      "WhatsApp + Push notifications",
      "AI দ্রোপআউট ঝুঁকি বিশ্লেষণ",
      "SMS ক্রেডিট: ৫০০০/মাস",
      "প্রায়োরিটি সাপোর্ট",
    ],
  },
  {
    name: "Scale",
    tagline: "বড় প্রতিষ্ঠান / মাল্টি-ব্রাঞ্চ",
    price: 3500,
    students: "সীমাহীন",
    features: [
      "Growth-এর সব কিছু",
      "মাল্টি-ব্রাঞ্চ সাপোর্ট",
      "কাস্টম ডোমেইন",
      "AI রিপোর্ট কমেন্ট",
      "SMS ক্রেডিট: ২০,০০০/মাস",
      "২৪/৭ ফোন সাপোর্ট",
      "Dedicated success manager",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">মূল্য পরিকল্পনা</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">সাশ্রয়ী প্রাইসিং, স্বচ্ছ প্রাইসিং</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            প্রতিষ্ঠানের আকার অনুযায়ী প্ল্যান বেছে নিন। সকল প্ল্যানে <strong>১৫ দিনের ফ্রি ট্রায়াল</strong>, কোন ক্রেডিট কার্ড প্রয়োজন নেই।
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-hover ring-2 ring-primary/20" : ""}>
              <CardContent className="p-6 flex flex-col h-full">
                {plan.highlighted && (
                  <Badge className="mb-3 w-fit bg-gradient-primary text-white">সবচেয়ে জনপ্রিয়</Badge>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">৳<BanglaDigit value={plan.price} /></span>
                  <span className="text-muted-foreground text-sm">/মাস</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">শিক্ষার্থী: {plan.students}</p>

                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={buttonVariants({ variant: plan.highlighted ? "default" : "outline" }) + " w-full mt-6"}
                >
                  ট্রায়াল শুরু করুন
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-3">প্রায়ই জিজ্ঞাসিত প্রশ্ন</h2>
          <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto text-left">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">পেমেন্ট কিভাবে করব?</h3>
                <p className="text-sm text-muted-foreground">bKash, Nagad, Rocket, ব্যাংক ট্রান্সফার — সব পদ্ধতিই সাপোর্ট করি।</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">প্ল্যান পরিবর্তন করা যাবে?</h3>
                <p className="text-sm text-muted-foreground">যে কোন সময় upgrade বা downgrade করতে পারবেন। কোন ডেটা হারাবে না।</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">ডেটা সুরক্ষা কেমন?</h3>
                <p className="text-sm text-muted-foreground">Row-Level Security + 2FA + encrypted backup। আপনার ডেটা শুধুই আপনার।</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">পুরাতন সিস্টেম থেকে ডেটা আনা যাবে?</h3>
                <p className="text-sm text-muted-foreground">হ্যাঁ — Excel import ও API migration সহায়তা দিই। কোন পূর্ব-তথ্য হারাবে না।</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 rounded-lg bg-gradient-primary text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">আজই শুরু করুন</h2>
          <p className="mb-6 text-white/90">১৫ দিন ফ্রি, কোন ক্রেডিট কার্ড লাগবে না।</p>
          <Link href="/signup" className="inline-block rounded-md bg-white text-primary px-6 py-3 font-medium hover:bg-white/90">
            ফ্রি ট্রায়াল শুরু করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
