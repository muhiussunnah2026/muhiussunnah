import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";

export const metadata = {
  title: "Lifetime Basic প্যাকেজ — Muhius Sunnah",
  description: "৳20,000 একবার পরিশোধে সারাজীবন ব্যবহার। ২০০ জন পর্যন্ত শিক্ষার্থী। সব মূল feature।",
};

const pkg: PackageDetail = {
  slug: "lifetime",
  name: "Lifetime Basic",
  tagline: "ছোট প্রতিষ্ঠান · একবার পেমেন্ট · সারাজীবন ব্যবহার",
  price: 20000,
  priceUnit: "once",
  badge: "LIFETIME DEAL",
  accent: "amber",
  summary: "বাংলাদেশের ছোট প্রতিষ্ঠানের জন্য তৈরি — একবার ২০,০০০ টাকা দিলে সারাজীবন Muhius Sunnah ব্যবহার করতে পারবেন। কোন মাসিক ফি নেই, কোন hidden charge নেই। আপনার প্রতিষ্ঠানের প্রতিদিনের সব কাজ এই প্যাকেজেই হয়ে যাবে।",
  whoFor: [
    "২০০ জন পর্যন্ত শিক্ষার্থীর ছোট স্কুল/মাদ্রাসা",
    "যারা SMS/AI ছাড়াই চালাতে চান",
    "নতুন প্রতিষ্ঠান যারা খরচ কমাতে চান",
    "One-time পেমেন্ট প্রেফার করেন",
  ],
  bestValue: "মাসে মাত্র ৳১৬৭ (১০ বছরে) — বাজারে এত সস্তা কোথাও নেই। Bornomala এই feature set-এর জন্য মাসিক ৳২,৫০০+ নেয়।",
  sections: [
    {
      title: "একাডেমিক ব্যবস্থাপনা",
      icon: "📚",
      items: [
        { label: "শিক্ষার্থী ম্যানেজমেন্ট", desc: "২০০ জন পর্যন্ত — নাম, ছবি, অভিভাবক, roll, transfer, promotion — সব।", included: true },
        { label: "শিক্ষক ও স্টাফ management", desc: "সীমাহীন শিক্ষক — জয়েনিং তারিখ, বেতন scale, contact।", included: true },
        { label: "শ্রেণি, সেকশন, বিষয়", desc: "যত ইচ্ছা class/section/subject — limit নেই।", included: true },
        { label: "উপস্থিতি (ম্যানুয়াল)", desc: "প্রতিদিন ক্লাস-ভিত্তিক hazira nithe parben admin panel থেকে।", included: true },
        { label: "একাডেমিক বছর", desc: "বছর প্রতি সব ডেটা রাখা, archive সুবিধা।", included: true },
        { label: "Bulk import (Excel)", desc: "Excel sheet থেকে ১০০+ ছাত্র একসাথে upload।", included: true },
      ],
    },
    {
      title: "পরীক্ষা ও রেজাল্ট",
      icon: "📝",
      items: [
        { label: "পরীক্ষা তৈরি ও রুটিন", desc: "যে কোনো exam — মিডটার্ম, ফাইনাল — ও রুটিন management।", included: true },
        { label: "মার্কস এন্ট্রি", desc: "Keyboard-friendly grid, auto-grade, locked-approve workflow।", included: true },
        { label: "GPA 5.0 মার্কশীট", desc: "Bangla Unicode print-ready মার্কশীট।", included: true },
        { label: "পজিশন/র‍্যাংকিং", desc: "Class-wise position auto-calculated।", included: true },
        { label: "Admit card", desc: "প্রতিটি ছাত্রের জন্য printable admit card।", included: true },
      ],
    },
    {
      title: "ফি ও সার্টিফিকেট",
      icon: "💰",
      items: [
        { label: "ফি রেকর্ড (ম্যানুয়াল)", desc: "Cash/check/bank transfer — manually record করে হিসাব রাখুন।", included: true },
        { label: "Invoice তৈরি", desc: "প্রতি ছাত্রের জন্য invoice generate + print।", included: true },
        { label: "Student ledger", desc: "প্রতি ছাত্রের আর্থিক ইতিহাস (due/paid/balance)।", included: true },
        { label: "সার্টিফিকেট প্রিন্ট", desc: "Transfer, character, study — টেমপ্লেট-based certificate।", included: true },
      ],
    },
    {
      title: "অভিভাবক পোর্টাল",
      icon: "👨‍👩‍👧",
      items: [
        { label: "অভিভাবক লগইন", desc: "প্রত্যেক অভিভাবক নিজের সন্তানের ডেটা দেখতে পারবেন।", included: true },
        { label: "রেজাল্ট ভিউ", desc: "পোর্টাল থেকে মার্কশীট/grade দেখা।", included: true },
        { label: "উপস্থিতি ভিউ", desc: "কোন দিন present/absent সব দেখা।", included: true },
        { label: "ফি status ভিউ", desc: "কত পরিশোধ করেছেন, কত বাকি — সব clear।", included: true },
      ],
    },
    {
      title: "রিপোর্ট ও অপারেশন",
      icon: "📊",
      items: [
        { label: "Excel রিপোর্ট", desc: "সকল ডেটা Excel-এ export।", included: true },
        { label: "প্রিন্ট রিপোর্ট", desc: "Attendance sheet, class-wise student list, fee register — সব print-ready।", included: true },
        { label: "Community সাপোর্ট", desc: "Email + public help center (১০০+ video, ২০০+ article)।", included: true },
      ],
    },
  ],
  notIncluded: [
    "SMS নোটিফিকেশন (Lifetime Basic-এ SMS ক্রেডিট নেই)",
    "অনলাইন পেমেন্ট gateway (bKash/Nagad/Rocket)",
    "WhatsApp auto-messaging",
    "AI ড্রপআউট ঝুঁকি বিশ্লেষণ",
    "AI রিপোর্ট কমেন্ট",
    "Priority phone সাপোর্ট",
    "মাল্টি-ব্রাঞ্চ",
    "কাস্টম ডোমেইন",
  ],
};

export default function Page() {
  return <PackageDetailPage pkg={pkg} />;
}
