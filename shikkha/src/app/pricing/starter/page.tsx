import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";

export const metadata = {
  title: "Starter প্যাকেজ — Muhius Sunnah",
  description: "৳1,000/মাস — ৫০০ ছাত্র পর্যন্ত, SMS নোটিফিকেশন, offline mode। বৃদ্ধিমান প্রতিষ্ঠানের জন্য।",
};

const pkg: PackageDetail = {
  slug: "starter",
  name: "Starter",
  tagline: "বৃদ্ধিমান প্রতিষ্ঠান · মাসিক বিল · সহজ cancel",
  price: 1000,
  priceUnit: "month",
  accent: "gray",
  summary: "আপনার প্রতিষ্ঠান বাড়ছে — Starter প্যাকেজ তার জন্য perfect। Lifetime Basic-এর সব ফিচার + SMS নোটিফিকেশন (মাসে ১,০০০ SMS), অফলাইন PWA mode, এবং ১০+ advanced report। অভিভাবকরা instant SMS পাবেন ফি due, অনুপস্থিতি, পরীক্ষার রুটিনে।",
  whoFor: [
    "৫০০ জন পর্যন্ত শিক্ষার্থীর মাঝারি স্কুল/মাদ্রাসা",
    "যারা SMS নোটিফিকেশন চালু করতে চান",
    "যাদের internet connection weak — অফলাইন mode দরকার",
    "Monthly billing পছন্দ করেন",
  ],
  bestValue: "মাসে ৳১,০০০ = প্রতি ছাত্রের জন্য মাত্র ৳২। SMS credit বাদে বাকি সব free।",
  sections: [
    {
      title: "Lifetime Basic-এর সব কিছু +",
      icon: "✨",
      items: [
        { label: "২০০ → ৫০০ শিক্ষার্থী", desc: "আড়াই গুণ বেশি ক্যাপাসিটি।", included: true },
        { label: "SMS নোটিফিকেশন", desc: "মাসে ১,০০০ SMS অন্তর্ভুক্ত। ছাত্র, অভিভাবক, শিক্ষক — সবার কাছে instant।", included: true },
        { label: "অফলাইন PWA mode", desc: "নেট না থাকলেও হাজিরা ও মার্কস — অনলাইনে আসলে auto-sync।", included: true },
        { label: "১০+ advanced রিপোর্ট", desc: "ফি কালেকশন, বকেয়া aging, উপস্থিতি summary, আয়-ব্যয় — PDF/Excel।", included: true },
        { label: "Bulk SMS টেমপ্লেট", desc: "প্রি-configured templates — ফি রিমাইন্ডার, ছুটি, পরীক্ষা।", included: true },
        { label: "নোটিশ composer", desc: "এক ক্লিকে সকল অভিভাবকের কাছে notice।", included: true },
        { label: "Email সাপোর্ট (২৪ ঘণ্টা reply)", desc: "Community থেকে upgraded support।", included: true },
        { label: "Install prompt (মোবাইল)", desc: "অভিভাবকরা phone home screen-এ install করতে পারবেন।", included: true },
      ],
    },
    {
      title: "ফি ও ইনভয়েস",
      icon: "💳",
      items: [
        { label: "মাসিক ইনভয়েস auto-generate", desc: "প্রতি মাসের ১ তারিখে সকল ছাত্রের invoice তৈরি।", included: true },
        { label: "SMS-এ ফি রিমাইন্ডার", desc: "Due date-এর আগে auto-reminder পাঠান।", included: true },
        { label: "৩০+ ফি হেড", desc: "Tuition, exam, library, transport — pre-configured।", included: true },
      ],
    },
    {
      title: "রিয়েলটাইম + মোবাইল",
      icon: "📱",
      items: [
        { label: "Live dashboard", desc: "Payment/admission হলেই dashboard auto-refresh।", included: true },
        { label: "Push notification", desc: "মোবাইল app-এ push alerts (অপশনাল)।", included: true },
        { label: "Multi-device access", desc: "যত ইচ্ছা device থেকে login।", included: true },
      ],
    },
  ],
  notIncluded: [
    "অনলাইন পেমেন্ট gateway (bKash/Nagad/Rocket) — Growth প্যাকেজে পাবেন",
    "WhatsApp auto-messaging — Growth প্যাকেজে পাবেন",
    "AI ড্রপআউট ঝুঁকি + AI রিপোর্ট কমেন্ট — Growth প্যাকেজে",
    "Priority phone সাপোর্ট",
    "মাল্টি-ব্রাঞ্চ + কাস্টম ডোমেইন — Scale প্যাকেজে",
    "SMS credit ১,০০০-এর বেশি লাগলে extra কিনতে হবে (৳২০/১০০ SMS)",
  ],
};

export default function Page() {
  return <PackageDetailPage pkg={pkg} />;
}
