import { PackageDetailPage, type PackageDetail } from "@/components/marketing/package-detail-page";

export const metadata = {
  title: "Scale প্যাকেজ — Muhius Sunnah",
  description: "৳4,000/মাস — মাল্টি-ব্রাঞ্চ, কাস্টম ডোমেইন, ২৪/৭ সাপোর্ট। এন্টারপ্রাইজ চেইন প্রতিষ্ঠানের জন্য।",
};

const pkg: PackageDetail = {
  slug: "scale",
  name: "Scale",
  tagline: "এন্টারপ্রাইজ · মাল্টি-ব্রাঞ্চ · dedicated সাপোর্ট",
  price: 4000,
  priceUnit: "month",
  accent: "violet",
  summary: "বড় প্রতিষ্ঠানের জন্য designed — একাধিক campus/branch, নিজস্ব ডোমেইন (yourschool.edu.bd), পাবলিক ওয়েবসাইট, SMS ক্রেডিট ২০,০০০/মাস, ২৪/৭ ফোন সাপোর্ট, এবং একজন dedicated success manager যিনি আপনার প্রতিষ্ঠানকে জানেন।",
  whoFor: [
    "Multi-campus প্রতিষ্ঠান (২+ branch)",
    "যারা নিজস্ব domain চান (yourschool.edu.bd)",
    "Enterprise-grade সাপোর্ট প্রয়োজন",
    "পাবলিক ওয়েবসাইট দিয়ে ভর্তি আবেদন নিতে চান",
  ],
  bestValue: "একটি multi-campus প্রতিষ্ঠান সাধারণত প্রতি branch-এ আলাদা software ব্যবহার করে ৳৫,০০০-১০,০০০ খরচ করে। Scale-এ unified system মাত্র ৳৪,০০০।",
  sections: [
    {
      title: "Growth-এর সব কিছু +",
      icon: "🏢",
      items: [
        { label: "মাল্টি-ব্রাঞ্চ সাপোর্ট", desc: "সীমাহীন campus/branch একই অ্যাকাউন্টে। প্রতিটি branch-এর আলাদা admin, staff, students।", included: true },
        { label: "Branch switcher", desc: "Navbar থেকে এক ক্লিকে branch switch।", included: true },
        { label: "Cross-branch reports", desc: "সকল branch-এর combined + individual report।", included: true },
        { label: "Super admin ড্যাশবোর্ড", desc: "সকল branch-এর overview, comparison, management।", included: true },
      ],
    },
    {
      title: "কাস্টম ব্র্যান্ডিং",
      icon: "🌐",
      items: [
        { label: "কাস্টম ডোমেইন", desc: "yourschool.edu.bd → আপনার পোর্টাল। আমাদের hosting, আপনার URL।", included: true },
        { label: "পাবলিক স্কুল ওয়েবসাইট", desc: "/s/your-slug → আপনার প্রতিষ্ঠানের public homepage (নোটিশ, ভর্তি, contact)।", included: true },
        { label: "Logo + color customization", desc: "আপনার ব্র্যান্ড কালার অনুযায়ী theme।", included: true },
        { label: "Branded emails + SMS", desc: "সকল communication-এ আপনার প্রতিষ্ঠানের নাম।", included: true },
      ],
    },
    {
      title: "এন্টারপ্রাইজ সাপোর্ট",
      icon: "🛟",
      items: [
        { label: "২৪/৭ ফোন সাপোর্ট", desc: "দিন/রাত যে কোনো সময় — urgent issue? এক কল।", included: true },
        { label: "WhatsApp instant response", desc: "১৫ মিনিটের মধ্যে reply, working hours-এ।", included: true },
        { label: "Dedicated success manager", desc: "একজন account manager যিনি আপনার প্রতিষ্ঠানকে জানেন।", included: true },
        { label: "Monthly review call", desc: "প্রতি মাসে ৩০ মিনিটের call — KPI review, feature requests।", included: true },
        { label: "Custom onboarding", desc: "In-person বা remote setup সাপোর্ট।", included: true },
        { label: "Priority feature requests", desc: "আপনার feature request roadmap-এ priority পাবে।", included: true },
      ],
    },
    {
      title: "বড় volume",
      icon: "📦",
      items: [
        { label: "SMS ক্রেডিট: ২০,০০০/মাস", desc: "Growth-এর ৪ গুণ।", included: true },
        { label: "Storage: ১০০ GB", desc: "ছাত্রদের ডকুমেন্ট, ছবি, সার্টিফিকেট।", included: true },
        { label: "API access", desc: "আপনার অন্য system-এ integration।", included: true },
        { label: "Custom reports", desc: "Your specific report on demand — dev team তৈরি করে দেয়।", included: true },
      ],
    },
  ],
  notIncluded: [
    "Extra SMS: ২০,০০০-এর বেশি লাগলে extra কিনতে হবে",
    "Hardware (biometric attendance device) — আলাদা কিনতে হবে",
    "Physical on-site training (remote ফ্রি)",
  ],
};

export default function Page() {
  return <PackageDetailPage pkg={pkg} />;
}
