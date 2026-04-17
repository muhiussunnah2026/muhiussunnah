import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";

export const metadata = {
  title: "Growth প্যাকেজ — Muhius Sunnah",
  description: "৳2,000/মাস — সীমাহীন ছাত্র, অনলাইন পেমেন্ট, AI, WhatsApp। বেশিরভাগ প্রতিষ্ঠানের জন্য সেরা।",
};

const pkg: PackageDetail = {
  slug: "growth",
  name: "Growth",
  tagline: "মাঝারি থেকে বড় প্রতিষ্ঠান · সবচেয়ে জনপ্রিয়",
  price: 2000,
  priceUnit: "month",
  badge: "MOST POPULAR",
  accent: "primary",
  summary: "আমাদের সবচেয়ে জনপ্রিয় প্যাকেজ — বাংলাদেশের ৮০%+ প্রতিষ্ঠান এটিই বেছে নেন। সীমাহীন শিক্ষার্থী, bKash/Nagad/SSLCommerz অনলাইন পেমেন্ট, WhatsApp + Push notifications, AI ড্রপআউট ঝুঁকি বিশ্লেষণ, AI রিপোর্ট কমেন্ট — সব একসাথে।",
  whoFor: [
    "সীমাহীন শিক্ষার্থী — যে কোনো আকারের প্রতিষ্ঠান",
    "অভিভাবকদের কাছ থেকে অনলাইনে ফি নিতে চান",
    "WhatsApp-এ auto-notify করতে চান",
    "AI দিয়ে স্মার্ট ডিসিশন নিতে চান",
  ],
  bestValue: "মাসে ৳২,০০০ = বাজারে এই feature-এর জন্য সর্বনিম্ন দাম। Bornomala এই set-এর জন্য ৳৫,০০০+ নেয়।",
  sections: [
    {
      title: "Starter-এর সব কিছু +",
      icon: "🚀",
      items: [
        { label: "সীমাহীন শিক্ষার্থী", desc: "৫,০০০ বা ৫০,০০০ — কোন limit নেই।", included: true },
        { label: "অনলাইন পেমেন্ট gateway", desc: "bKash, Nagad, Rocket, SSLCommerz — অভিভাবক সরাসরি পোর্টাল থেকে ফি দেবেন।", included: true },
        { label: "WhatsApp auto-messaging", desc: "Meta Cloud API দিয়ে ছাত্রদের পিতামাতাদের কাছে।", included: true },
        { label: "Push notification (Firebase)", desc: "Instant mobile push — মোবাইল app-এ।", included: true },
        { label: "Email notification (Resend)", desc: "Professional email with branding।", included: true },
        { label: "SMS credit: ৫,০০০/মাস", desc: "Starter-এর ৫ গুণ।", included: true },
        { label: "Priority email সাপোর্ট", desc: "৮ ঘণ্টায় reply।", included: true },
      ],
    },
    {
      title: "AI ফিচার",
      icon: "🤖",
      items: [
        { label: "AI ড্রপআউট ঝুঁকি বিশ্লেষণ", desc: "উপস্থিতি + মার্কস + ফি বকেয়া → প্রতি ছাত্রের risk score (low/medium/high/critical) + AI suggestion।", included: true },
        { label: "AI রিপোর্ট কমেন্ট", desc: "প্রত্যেক ছাত্রের রেজাল্টে Claude AI-তৈরি বাংলা comment।", included: true },
        { label: "Smart SMS টেমপ্লেট", desc: "AI দিয়ে personalized SMS তৈরি — ফি রিমাইন্ডার, অনুপস্থিতি।", included: true },
        { label: "সাপ্তাহিক risk recompute", desc: "Automated weekly cron — প্রতি সপ্তাহে risk update।", included: true },
      ],
    },
    {
      title: "মাদ্রাসা বিশেষ ফিচার",
      icon: "🕌",
      items: [
        { label: "হিফজ heatmap", desc: "৩০ পারা × ছাত্র গ্রিড — কে কতদূর পৌঁছেছে এক নজরে।", included: true },
        { label: "কিতাব curriculum", desc: "৬ স্তর — প্রাথমিক থেকে তাকমিল।", included: true },
        { label: "দৈনিক সবক-সবকী-মানজিল", desc: "১০-কলামের grid, daily tracking।", included: true },
        { label: "Hijri তারিখ + Arabic RTL", desc: "পুরো সিস্টেমে Islamic calendar + Arabic সাপোর্ট।", included: true },
      ],
    },
    {
      title: "LMS + Assignments",
      icon: "📖",
      items: [
        { label: "অ্যাসাইনমেন্ট ব্যবস্থাপনা", desc: "শিক্ষক create, ছাত্র submit, শিক্ষক grade।", included: true },
        { label: "অনলাইন ক্লাস", desc: "Zoom/Meet/Teams integration — সরাসরি পোর্টাল থেকে join।", included: true },
        { label: "ক্লাস রেকর্ডিং", desc: "Past class recording link।", included: true },
      ],
    },
    {
      title: "সুরক্ষা",
      icon: "🔒",
      items: [
        { label: "২-স্তর প্রমাণীকরণ (2FA)", desc: "TOTP — Google Authenticator / Authy / 1Password।", included: true },
        { label: "Granular permissions", desc: "প্রতিটি স্টাফের জন্য exact অনুমতি নির্ধারণ।", included: true },
        { label: "অডিট লগ", desc: "কে কী করেছে — সম্পূর্ণ trail।", included: true },
      ],
    },
  ],
  notIncluded: [
    "মাল্টি-ব্রাঞ্চ (২+ campus) — Scale প্যাকেজে",
    "কাস্টম ডোমেইন — Scale প্যাকেজে",
    "পাবলিক স্কুল ওয়েবসাইট — Scale প্যাকেজে",
    "২৪/৭ ফোন সাপোর্ট — Scale প্যাকেজে",
    "Dedicated success manager — Scale প্যাকেজে",
  ],
};

export default function Page() {
  return <PackageDetailPage pkg={pkg} />;
}
