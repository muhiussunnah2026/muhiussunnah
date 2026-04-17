/**
 * Marketing copy in 4 languages — used by the public site (landing, pricing,
 * features, about, contact, public school page). Kept separate from the
 * next-intl messages/*.json bundle so we can edit marketing copy without
 * touching product strings.
 */

import type { Locale } from "./config";

type Copy = {
  // Navigation
  nav: { features: string; pricing: string; about: string; contact: string; login: string; signup: string };

  // Hero section
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustBadges: string[];
  };

  // Stats section
  stats: { students: string; schools: string; transactions: string; languages: string };

  // Features section
  features: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    list: Array<{ icon: string; title: string; body: string }>;
  };

  // Pricing section
  pricing: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    mostPopular: string;
    lifetime: string;
    perMonth: string;
    oneTime: string;
    chooseCta: string;
    plans: Array<{
      name: string;
      tagline: string;
      price: number;
      priceUnit: "once" | "month";
      badge?: string;
      features: string[];
      cta: string;
      highlighted?: boolean;
    }>;
  };

  // Testimonials
  testimonials: {
    eyebrow: string;
    title: string;
    list: Array<{ quote: string; author: string; role: string; school: string }>;
  };

  // FAQ
  faq: {
    eyebrow: string;
    title: string;
    list: Array<{ q: string; a: string }>;
  };

  // Final CTA
  finalCta: { title: string; subtitle: string; primary: string; secondary: string };

  // Footer
  footer: { tagline: string; product: string; company: string; legal: string; privacy: string; terms: string; copyright: string };
};

// ─── বাংলা ─────────────────────────────────────────────────────────────────
const bn: Copy = {
  nav: { features: "ফিচার", pricing: "প্রাইসিং", about: "আমাদের সম্পর্কে", contact: "যোগাযোগ", login: "লগইন", signup: "শুরু করুন" },

  hero: {
    eyebrow: "🇧🇩 বাংলাদেশের স্কুল ও মাদ্রাসার জন্য ১ নম্বর সফটওয়্যার",
    title: "সম্পূর্ণ স্কুল ম্যানেজমেন্ট —",
    titleHighlight: "এক প্ল্যাটফর্মে",
    subtitle: "ভর্তি থেকে পরীক্ষা, ফি থেকে অভিভাবক যোগাযোগ, হিফজ থেকে সার্টিফিকেট — সব কিছু সুন্দর বাংলায়। Bornomala-এর সব ফিচার + আরও অনেক কিছু।",
    primaryCta: "ফ্রি ট্রায়াল শুরু করুন",
    secondaryCta: "ডেমো দেখুন",
    trustBadges: ["✓ কোন ক্রেডিট কার্ড লাগবে না", "✓ ১৫ দিনের ফ্রি ট্রায়াল", "✓ ২৪/৭ বাংলা সাপোর্ট", "✓ SSL encrypted"],
  },

  stats: { students: "সক্রিয় শিক্ষার্থী", schools: "স্কুল ও মাদ্রাসা", transactions: "মাসিক লেনদেন", languages: "ভাষা সাপোর্ট" },

  features: {
    eyebrow: "ফিচার",
    title: "যা যা লাগবে",
    titleHighlight: "সব এক জায়গায়",
    subtitle: "শিক্ষার্থী ব্যবস্থাপনা থেকে অনলাইন পেমেন্ট, AI বিশ্লেষণ থেকে মাদ্রাসা মডিউল — কোন তৃতীয়-পক্ষ সফটওয়্যার লাগবে না।",
    list: [
      { icon: "users", title: "ছাত্র-ছাত্রী", body: "Excel import, guardian linking, profile, transfer — ৩০ সেকেন্ডে ভর্তি।" },
      { icon: "calendar", title: "QR উপস্থিতি", body: "২ মিনিটে পুরো ক্লাস। অভিভাবক তৎক্ষণাত SMS পান।" },
      { icon: "wallet", title: "অনলাইন পেমেন্ট", body: "bKash, Nagad, Rocket, SSLCommerz — সরাসরি ফি কালেকশন।" },
      { icon: "award", title: "পরীক্ষা ও রেজাল্ট", body: "GPA 5.0, position, Bangla Unicode মার্কশীট, ডিজিটাল সার্টিফিকেট।" },
      { icon: "megaphone", title: "SMS + WhatsApp + Push", body: "একটি নোটিশ চার চ্যানেলে — ৫০০+ অভিভাবকের কাছে তৎক্ষণাত।" },
      { icon: "book", title: "মাদ্রাসা মডিউল", body: "হিফজ heatmap, কিতাব curriculum, দৈনিক সবক গ্রিড। Hijri তারিখ।" },
      { icon: "sparkles", title: "AI ঝুঁকি বিশ্লেষণ", body: "উপস্থিতি + মার্কস + ফি বকেয়া → dropout ঝুঁকি। আগেই সতর্ক হন।" },
      { icon: "smartphone", title: "অফলাইন PWA", body: "নেট না থাকলেও হাজিরা ও মার্কস নিন। Auto-sync হবে।" },
      { icon: "shield", title: "Enterprise সুরক্ষা", body: "2FA, RLS, encrypted backups, audit log — ব্যাংক-grade সুরক্ষা।" },
    ],
  },

  pricing: {
    eyebrow: "প্রাইসিং",
    title: "স্বচ্ছ প্রাইসিং,",
    titleHighlight: "কোন লুকানো খরচ নেই",
    subtitle: "প্রতিষ্ঠানের আকার ও চাহিদা অনুযায়ী বেছে নিন। যে কোন সময় upgrade করতে পারবেন।",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    lifetime: "লাইফটাইম",
    perMonth: "/মাস",
    oneTime: "একবার পরিশোধ",
    chooseCta: "বেছে নিন",
    plans: [
      {
        name: "Lifetime Basic",
        tagline: "ছোট প্রতিষ্ঠান · একবার পেমেন্টে সারাজীবন",
        price: 5000,
        priceUnit: "once",
        badge: "লাইফটাইম ডিল",
        features: [
          "২০০ জন পর্যন্ত শিক্ষার্থী",
          "শিক্ষক ও স্টাফ ব্যবস্থাপনা",
          "উপস্থিতি (ম্যানুয়াল)",
          "ফি রেকর্ড (ক্যাশ পেমেন্ট)",
          "পরীক্ষা + মার্কশীট",
          "সার্টিফিকেট প্রিন্ট",
          "অভিভাবক পোর্টাল",
          "Excel রিপোর্ট",
          "কমিউনিটি সাপোর্ট (ইমেইল)",
        ],
        cta: "৫০০০ টাকায় কিনুন",
      },
      {
        name: "Starter",
        tagline: "বৃদ্ধিমান প্রতিষ্ঠান",
        price: 800,
        priceUnit: "month",
        features: [
          "Lifetime Basic-এর সব কিছু",
          "৫০০ শিক্ষার্থী পর্যন্ত",
          "SMS নোটিফিকেশন (১,০০০/মাস)",
          "১০+ রিপোর্ট টাইপ",
          "PWA অফলাইন মোড",
          "ইমেইল সাপোর্ট",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
      {
        name: "Growth",
        tagline: "মাঝারি থেকে বড় প্রতিষ্ঠান",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: [
          "Starter-এর সব কিছু",
          "সীমাহীন শিক্ষার্থী",
          "অনলাইন পেমেন্ট (bKash, SSLCommerz)",
          "WhatsApp + Push notifications",
          "AI দ্রোপআউট ঝুঁকি বিশ্লেষণ",
          "AI রিপোর্ট কমেন্ট",
          "SMS ক্রেডিট: ৫,০০০/মাস",
          "প্রায়োরিটি সাপোর্ট",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
      {
        name: "Scale",
        tagline: "এন্টারপ্রাইজ · মাল্টি-ব্রাঞ্চ",
        price: 4500,
        priceUnit: "month",
        features: [
          "Growth-এর সব কিছু",
          "মাল্টি-ব্রাঞ্চ সাপোর্ট",
          "কাস্টম ডোমেইন",
          "পাবলিক স্কুল ওয়েবসাইট",
          "SMS ক্রেডিট: ২০,০০০/মাস",
          "২৪/৭ ফোন সাপোর্ট",
          "Dedicated success manager",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
    ],
  },

  testimonials: {
    eyebrow: "প্রতিক্রিয়া",
    title: "শিক্ষকরা যা বলছেন",
    list: [
      { quote: "Bornomala ছেড়ে Shikkha নিয়েছি — অভিভাবকরা এখন নিজেরাই পেমেন্ট করেন, আমার অফিসে ভিড় কমে গেছে।", author: "মাওলানা আব্দুর রহমান", role: "প্রিন্সিপাল", school: "ঢাকা ইসলামিয়া মাদ্রাসা" },
      { quote: "হিফজ মডিউলটা দারুণ! ৩০ পারা heatmap দেখে কে কতদূর এসেছে এক নজরে বোঝা যায়।", author: "হাফেজ মোহাম্মদ ইউসুফ", role: "হিফজ শিক্ষক", school: "জামিয়া ইসলামিয়া" },
      { quote: "QR attendance-এ ২ মিনিটে ৬০ জনের হাজিরা — আগে ১৫ মিনিট লাগতো।", author: "ফারজানা আক্তার", role: "ক্লাস টিচার", school: "গ্রীন হাইস্কুল" },
    ],
  },

  faq: {
    eyebrow: "সাহায্য",
    title: "প্রায়ই জিজ্ঞাসিত প্রশ্ন",
    list: [
      { q: "লাইফটাইম ৫,০০০ টাকার প্ল্যানে কি কি পাব?", a: "২০০ জন পর্যন্ত শিক্ষার্থীর সম্পূর্ণ ব্যবস্থাপনা — student, staff, attendance, manual fee tracking, exam, marksheet, certificate, parent portal। একবার পেমেন্ট, সারাজীবন ব্যবহার। কোন AI বা SMS ক্রেডিট অন্তর্ভুক্ত নেই।" },
      { q: "পুরাতন সিস্টেম থেকে ডেটা আনা যাবে?", a: "হ্যাঁ। Excel import আছে সব ডেটার জন্য — students, staff, fees, attendance। পুরাতন Bornomala ডেটা-ও আমরা migrate করে দিই।" },
      { q: "প্ল্যান পরিবর্তন করা যাবে?", a: "যে কোন সময় upgrade বা downgrade করা যাবে। ডেটা কখনো হারাবে না।" },
      { q: "পেমেন্ট কিভাবে করব?", a: "bKash, Nagad, Rocket, ব্যাংক ট্রান্সফার — সব পদ্ধতি চলবে।" },
      { q: "আমার ডেটা কি নিরাপদ?", a: "Row-Level Security (প্রতিটি স্কুলের ডেটা আলাদা), 2FA, encrypted backup — ব্যাংক-level সুরক্ষা।" },
      { q: "বাংলাদেশের বাইরে ব্যবহার করা যাবে?", a: "হ্যাঁ। বাংলা, ইংরেজি, উর্দু, আরবি — ৪ ভাষায় সম্পূর্ণ সাপোর্ট।" },
    ],
  },

  finalCta: {
    title: "আজই শুরু করুন",
    subtitle: "১৫ দিন ফ্রি ট্রায়াল · কোন ক্রেডিট কার্ড লাগবে না · সম্পূর্ণ access",
    primary: "ফ্রি ট্রায়াল শুরু করুন",
    secondary: "বিক্রয় টিমের সাথে কথা বলুন",
  },

  footer: {
    tagline: "বাংলাদেশের স্কুল ও মাদ্রাসার জন্য আধুনিক ম্যানেজমেন্ট প্ল্যাটফর্ম।",
    product: "প্রোডাক্ট", company: "কোম্পানি", legal: "আইনি",
    privacy: "গোপনীয়তা নীতি", terms: "শর্তাবলী",
    copyright: "© ২০২৬ Shikkha Platform · সর্বস্বত্ব সংরক্ষিত।",
  },
};

// ─── English ───────────────────────────────────────────────────────────────
const en: Copy = {
  nav: { features: "Features", pricing: "Pricing", about: "About", contact: "Contact", login: "Log in", signup: "Get Started" },

  hero: {
    eyebrow: "🇧🇩 #1 School Management Software for Bangladesh",
    title: "Complete school management —",
    titleHighlight: "all in one platform",
    subtitle: "From admissions to exams, fees to parent communication, hifz to certificates — everything in beautiful Bangla. All Bornomala features + so much more.",
    primaryCta: "Start Free Trial",
    secondaryCta: "Watch Demo",
    trustBadges: ["✓ No credit card required", "✓ 15-day free trial", "✓ 24/7 Bangla support", "✓ SSL encrypted"],
  },

  stats: { students: "Active Students", schools: "Schools & Madrasas", transactions: "Monthly Transactions", languages: "Languages Supported" },

  features: {
    eyebrow: "Features",
    title: "Everything you need,",
    titleHighlight: "in one place",
    subtitle: "From student management to online payments, AI insights to madrasa modules — no third-party software needed.",
    list: [
      { icon: "users", title: "Student Management", body: "Excel import, guardian linking, profile, transfer — admit in 30 seconds." },
      { icon: "calendar", title: "QR Attendance", body: "Full class in 2 minutes. Parents get instant SMS." },
      { icon: "wallet", title: "Online Payments", body: "bKash, Nagad, Rocket, SSLCommerz — direct fee collection." },
      { icon: "award", title: "Exams & Results", body: "GPA 5.0, position, Bangla Unicode marksheets, digital certificates." },
      { icon: "megaphone", title: "SMS + WhatsApp + Push", body: "One notice, four channels — instant delivery to 500+ parents." },
      { icon: "book", title: "Madrasa Module", body: "Hifz heatmap, Kitab curriculum, daily sabaq grid. Hijri dates." },
      { icon: "sparkles", title: "AI Risk Analysis", body: "Attendance + marks + fee overdue → dropout risk. Know in advance." },
      { icon: "smartphone", title: "Offline PWA", body: "Take attendance & marks offline. Auto-sync when back online." },
      { icon: "shield", title: "Enterprise Security", body: "2FA, RLS, encrypted backups, audit log — bank-grade security." },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Transparent pricing,",
    titleHighlight: "no hidden costs",
    subtitle: "Choose based on your institution size and needs. Upgrade anytime.",
    mostPopular: "Most Popular",
    lifetime: "LIFETIME",
    perMonth: "/month",
    oneTime: "one-time",
    chooseCta: "Choose",
    plans: [
      {
        name: "Lifetime Basic",
        tagline: "Small institutions · pay once, use forever",
        price: 5000,
        priceUnit: "once",
        badge: "LIFETIME DEAL",
        features: [
          "Up to 200 students",
          "Teacher & staff management",
          "Attendance (manual)",
          "Fee records (cash payments)",
          "Exams + marksheets",
          "Certificate printing",
          "Parent portal",
          "Excel reports",
          "Community support (email)",
        ],
        cta: "Buy for ৳5,000",
      },
      {
        name: "Starter",
        tagline: "Growing institutions",
        price: 800,
        priceUnit: "month",
        features: [
          "Everything in Lifetime Basic",
          "Up to 500 students",
          "SMS notifications (1,000/mo)",
          "10+ report types",
          "PWA offline mode",
          "Email support",
        ],
        cta: "Start Trial",
      },
      {
        name: "Growth",
        tagline: "Medium to large institutions",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: [
          "Everything in Starter",
          "Unlimited students",
          "Online payments (bKash, SSLCommerz)",
          "WhatsApp + Push notifications",
          "AI dropout risk analysis",
          "AI report comments",
          "SMS credits: 5,000/mo",
          "Priority support",
        ],
        cta: "Start Trial",
      },
      {
        name: "Scale",
        tagline: "Enterprise · Multi-branch",
        price: 4500,
        priceUnit: "month",
        features: [
          "Everything in Growth",
          "Multi-branch support",
          "Custom domain",
          "Public school website",
          "SMS credits: 20,000/mo",
          "24/7 phone support",
          "Dedicated success manager",
        ],
        cta: "Start Trial",
      },
    ],
  },

  testimonials: {
    eyebrow: "Testimonials",
    title: "What educators are saying",
    list: [
      { quote: "Switched from Bornomala to Shikkha — parents now pay online themselves, my office is no longer crowded.", author: "Maulana Abdur Rahman", role: "Principal", school: "Dhaka Islamia Madrasa" },
      { quote: "The hifz module is incredible! See the 30-para heatmap to know everyone's progress at a glance.", author: "Hafez Mohammad Yousuf", role: "Hifz Teacher", school: "Jamia Islamia" },
      { quote: "60 students' attendance in 2 minutes with QR — used to take 15 minutes before.", author: "Farzana Akter", role: "Class Teacher", school: "Green High School" },
    ],
  },

  faq: {
    eyebrow: "Help",
    title: "Frequently Asked Questions",
    list: [
      { q: "What's included in the ৳5,000 Lifetime plan?", a: "Complete management for up to 200 students — student, staff, attendance, manual fee tracking, exams, marksheets, certificates, parent portal. One-time payment, lifetime use. No AI or SMS credits included." },
      { q: "Can I migrate data from my old system?", a: "Yes. Excel import available for all data types — students, staff, fees, attendance. We also migrate from Bornomala." },
      { q: "Can I change plans later?", a: "Upgrade or downgrade anytime. Your data is never lost." },
      { q: "How can I pay?", a: "bKash, Nagad, Rocket, bank transfer — all methods supported." },
      { q: "Is my data safe?", a: "Row-Level Security (each school's data isolated), 2FA, encrypted backups — bank-level security." },
      { q: "Can I use this outside Bangladesh?", a: "Yes. Bangla, English, Urdu, Arabic — full support in 4 languages." },
    ],
  },

  finalCta: {
    title: "Start today",
    subtitle: "15-day free trial · No credit card required · Full access",
    primary: "Start Free Trial",
    secondary: "Talk to Sales",
  },

  footer: {
    tagline: "Modern management platform for schools and madrasas in Bangladesh.",
    product: "Product", company: "Company", legal: "Legal",
    privacy: "Privacy Policy", terms: "Terms of Service",
    copyright: "© 2026 Shikkha Platform · All rights reserved.",
  },
};

// ─── اردو (Urdu, RTL) ──────────────────────────────────────────────────────
const ur: Copy = {
  nav: { features: "خصوصیات", pricing: "قیمتیں", about: "ہمارے بارے میں", contact: "رابطہ", login: "لاگ ان", signup: "شروع کریں" },

  hero: {
    eyebrow: "🇵🇰 اسکول اور مدرسے کے لیے نمبر ۱ سافٹ ویئر",
    title: "مکمل اسکول انتظام —",
    titleHighlight: "ایک پلیٹ فارم پر",
    subtitle: "داخلہ سے امتحان تک، فیس سے والدین کے رابطے تک، حفظ سے اسناد تک — سب کچھ خوبصورت اردو میں۔",
    primaryCta: "مفت آزمائش شروع کریں",
    secondaryCta: "ڈیمو دیکھیں",
    trustBadges: ["✓ کریڈٹ کارڈ کی ضرورت نہیں", "✓ ۱۵ دن کی مفت آزمائش", "✓ ۲۴/۷ سپورٹ", "✓ SSL محفوظ"],
  },

  stats: { students: "فعال طلباء", schools: "اسکول اور مدارس", transactions: "ماہانہ لین دین", languages: "زبانوں کی حمایت" },

  features: {
    eyebrow: "خصوصیات",
    title: "جو کچھ آپ کو چاہیے،",
    titleHighlight: "ایک جگہ",
    subtitle: "طالب علم کے انتظام سے آن لائن ادائیگی تک، AI تجزیہ سے مدرسہ ماڈیول تک — کسی تیسرے فریق کے سافٹ ویئر کی ضرورت نہیں۔",
    list: [
      { icon: "users", title: "طالب علم کا انتظام", body: "Excel درآمد، سرپرست لنکنگ، پروفائل — ۳۰ سیکنڈ میں داخلہ۔" },
      { icon: "calendar", title: "QR حاضری", body: "پوری کلاس ۲ منٹ میں۔ والدین کو فوری SMS ملتا ہے۔" },
      { icon: "wallet", title: "آن لائن ادائیگی", body: "bKash, Nagad, Rocket — براہ راست فیس وصولی۔" },
      { icon: "award", title: "امتحانات اور نتائج", body: "GPA 5.0، پوزیشن، مارک شیٹ، ڈیجیٹل اسناد۔" },
      { icon: "megaphone", title: "SMS + WhatsApp + Push", body: "ایک نوٹس، چار چینلز — ۵۰۰+ والدین کو فوری۔" },
      { icon: "book", title: "مدرسہ ماڈیول", body: "حفظ ہیٹ میپ، کتاب نصاب، روزانہ سبق گرڈ۔ ہجری تاریخیں۔" },
      { icon: "sparkles", title: "AI رسک تجزیہ", body: "حاضری + نمبر + بقایا فیس → ڈراپ آؤٹ رسک۔" },
      { icon: "smartphone", title: "آف لائن PWA", body: "نیٹ کے بغیر حاضری لیں۔ آن لائن ہونے پر خود بخود sync۔" },
      { icon: "shield", title: "انٹرپرائز سیکیورٹی", body: "2FA، RLS، encrypted بیک اپ — بینک گریڈ سیکیورٹی۔" },
    ],
  },

  pricing: {
    eyebrow: "قیمتیں",
    title: "شفاف قیمتیں،",
    titleHighlight: "کوئی چھپی ہوئی لاگت نہیں",
    subtitle: "اپنے ادارے کے سائز کے مطابق منتخب کریں۔ کسی بھی وقت اپ گریڈ کریں۔",
    mostPopular: "سب سے مقبول",
    lifetime: "لائف ٹائم",
    perMonth: "/ماہ",
    oneTime: "ایک بار ادائیگی",
    chooseCta: "منتخب کریں",
    plans: [
      {
        name: "Lifetime Basic",
        tagline: "چھوٹے ادارے · ایک بار ادائیگی، ہمیشہ کے لیے",
        price: 5000,
        priceUnit: "once",
        badge: "لائف ٹائم ڈیل",
        features: [
          "۲۰۰ طلباء تک",
          "اساتذہ اور سٹاف کا انتظام",
          "حاضری (دستی)",
          "فیس ریکارڈ (نقد ادائیگی)",
          "امتحانات + مارک شیٹ",
          "اسناد پرنٹنگ",
          "والدین پورٹل",
          "Excel رپورٹس",
          "کمیونٹی سپورٹ",
        ],
        cta: "۵۰۰۰ میں خریدیں",
      },
      {
        name: "Starter",
        tagline: "بڑھتے ہوئے ادارے",
        price: 800,
        priceUnit: "month",
        features: ["Lifetime Basic کی سب کچھ", "۵۰۰ طلباء تک", "SMS اطلاعات", "۱۰+ رپورٹ اقسام", "PWA آف لائن موڈ"],
        cta: "آزمائش شروع کریں",
      },
      {
        name: "Growth",
        tagline: "درمیانے سے بڑے ادارے",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: ["Starter کی سب کچھ", "لامحدود طلباء", "آن لائن ادائیگی", "WhatsApp + Push", "AI ڈراپ آؤٹ تجزیہ", "AI رپورٹ تبصرے", "۵۰۰۰ SMS/ماہ", "ترجیحی سپورٹ"],
        cta: "آزمائش شروع کریں",
      },
      {
        name: "Scale",
        tagline: "انٹرپرائز · ملٹی برانچ",
        price: 4500,
        priceUnit: "month",
        features: ["Growth کی سب کچھ", "ملٹی برانچ", "کسٹم ڈومین", "عوامی ویب سائٹ", "۲۰،۰۰۰ SMS/ماہ", "۲۴/۷ سپورٹ"],
        cta: "آزمائش شروع کریں",
      },
    ],
  },

  testimonials: {
    eyebrow: "آراء",
    title: "اساتذہ کیا کہتے ہیں",
    list: [
      { quote: "Bornomala چھوڑ کر Shikkha لیا — والدین اب خود آن لائن ادائیگی کرتے ہیں۔", author: "مولانا عبدالرحمن", role: "پرنسپل", school: "ڈھاکہ اسلامیہ مدرسہ" },
      { quote: "حفظ ماڈیول بہت اچھا ہے! ۳۰ پارہ ہیٹ میپ میں کون کہاں پہنچا فوراً نظر آتا ہے۔", author: "حافظ محمد یوسف", role: "حفظ استاد", school: "جامعہ اسلامیہ" },
      { quote: "QR حاضری میں ۶۰ طلباء کی حاضری ۲ منٹ میں — پہلے ۱۵ منٹ لگتے تھے۔", author: "فرزانہ اختر", role: "کلاس ٹیچر", school: "گرین ہائی اسکول" },
    ],
  },

  faq: {
    eyebrow: "مدد",
    title: "عام سوالات",
    list: [
      { q: "۵۰۰۰ کے لائف ٹائم پلان میں کیا ملے گا؟", a: "۲۰۰ طلباء تک کا مکمل انتظام — طالب علم، اساتذہ، حاضری، فیس، امتحانات، مارک شیٹ، اسناد، والدین پورٹل۔ ایک بار ادائیگی، ہمیشہ کے لیے۔" },
      { q: "پرانے سسٹم سے ڈیٹا منتقل کر سکتے ہیں؟", a: "ہاں۔ تمام ڈیٹا کے لیے Excel درآمد دستیاب ہے۔" },
      { q: "پلان تبدیل کر سکتے ہیں؟", a: "کسی بھی وقت اپ گریڈ یا ڈاؤن گریڈ کر سکتے ہیں۔ ڈیٹا ضائع نہیں ہوتا۔" },
      { q: "ادائیگی کیسے کریں؟", a: "bKash، Nagad، Rocket، بینک ٹرانسفر — تمام طریقے۔" },
      { q: "ڈیٹا محفوظ ہے؟", a: "Row-Level Security، 2FA، encrypted بیک اپ — بینک لیول سیکیورٹی۔" },
      { q: "کیا بنگلہ دیش کے باہر استعمال کر سکتے ہیں؟", a: "ہاں۔ بنگلہ، انگریزی، اردو، عربی — ۴ زبانوں میں مکمل سپورٹ۔" },
    ],
  },

  finalCta: {
    title: "آج ہی شروع کریں",
    subtitle: "۱۵ دن مفت آزمائش · کوئی کریڈٹ کارڈ نہیں · مکمل رسائی",
    primary: "مفت آزمائش شروع کریں",
    secondary: "سیلز سے بات کریں",
  },

  footer: {
    tagline: "اسکولوں اور مدارس کے لیے جدید انتظامی پلیٹ فارم۔",
    product: "پروڈکٹ", company: "کمپنی", legal: "قانونی",
    privacy: "رازداری", terms: "شرائط",
    copyright: "© ۲۰۲۶ Shikkha Platform · جملہ حقوق محفوظ۔",
  },
};

// ─── العربية (Arabic, RTL) ─────────────────────────────────────────────────
const ar: Copy = {
  nav: { features: "المميزات", pricing: "الأسعار", about: "من نحن", contact: "اتصل بنا", login: "تسجيل الدخول", signup: "ابدأ الآن" },

  hero: {
    eyebrow: "🕌 برنامج إدارة المدارس والمدارس الدينية الأول",
    title: "إدارة مدرسية كاملة —",
    titleHighlight: "في منصة واحدة",
    subtitle: "من القبول إلى الامتحانات، من الرسوم إلى التواصل مع الوالدين، من الحفظ إلى الشهادات — كل شيء في مكان واحد.",
    primaryCta: "ابدأ التجربة المجانية",
    secondaryCta: "شاهد العرض",
    trustBadges: ["✓ بدون بطاقة ائتمان", "✓ تجربة مجانية لمدة 15 يوم", "✓ دعم 24/7", "✓ مشفر SSL"],
  },

  stats: { students: "طلاب نشطون", schools: "مدارس", transactions: "معاملات شهرية", languages: "لغات مدعومة" },

  features: {
    eyebrow: "المميزات",
    title: "كل ما تحتاجه،",
    titleHighlight: "في مكان واحد",
    subtitle: "من إدارة الطلاب إلى المدفوعات عبر الإنترنت، من تحليلات الذكاء الاصطناعي إلى وحدة المدرسة الدينية.",
    list: [
      { icon: "users", title: "إدارة الطلاب", body: "استيراد Excel، ربط ولي الأمر، الملف الشخصي — القبول في 30 ثانية." },
      { icon: "calendar", title: "الحضور بـ QR", body: "الفصل بأكمله في دقيقتين. يتلقى الوالدان SMS فوريًا." },
      { icon: "wallet", title: "الدفع عبر الإنترنت", body: "bKash، Nagad، Rocket — جمع الرسوم مباشرة." },
      { icon: "award", title: "الامتحانات والنتائج", body: "GPA 5.0، المرتبة، كشوف الدرجات، الشهادات الرقمية." },
      { icon: "megaphone", title: "SMS + WhatsApp + Push", body: "إشعار واحد، أربع قنوات — وصول فوري لـ 500+ من الوالدين." },
      { icon: "book", title: "وحدة المدرسة الدينية", body: "خريطة حرارية للحفظ، منهج الكتاب، شبكة السبق اليومي. تواريخ هجرية." },
      { icon: "sparkles", title: "تحليل المخاطر بالذكاء الاصطناعي", body: "الحضور + الدرجات + الرسوم المتأخرة → مخاطر التسرب." },
      { icon: "smartphone", title: "PWA غير متصل", body: "خذ الحضور بدون إنترنت. يتم المزامنة تلقائيًا." },
      { icon: "shield", title: "أمان المؤسسات", body: "2FA، RLS، نسخ احتياطية مشفرة — أمان بمستوى البنوك." },
    ],
  },

  pricing: {
    eyebrow: "الأسعار",
    title: "أسعار شفافة،",
    titleHighlight: "بدون تكاليف خفية",
    subtitle: "اختر حسب حجم مؤسستك واحتياجاتك. يمكنك الترقية في أي وقت.",
    mostPopular: "الأكثر شعبية",
    lifetime: "مدى الحياة",
    perMonth: "/شهر",
    oneTime: "دفعة واحدة",
    chooseCta: "اختر",
    plans: [
      {
        name: "Lifetime Basic",
        tagline: "المؤسسات الصغيرة · ادفع مرة، استخدم للأبد",
        price: 5000,
        priceUnit: "once",
        badge: "صفقة مدى الحياة",
        features: [
          "حتى 200 طالب",
          "إدارة المعلمين والموظفين",
          "الحضور (يدوي)",
          "سجلات الرسوم (نقدًا)",
          "الامتحانات + كشوف الدرجات",
          "طباعة الشهادات",
          "بوابة الوالدين",
          "تقارير Excel",
          "دعم مجتمعي",
        ],
        cta: "اشتر بـ 5000",
      },
      {
        name: "Starter",
        tagline: "المؤسسات النامية",
        price: 800,
        priceUnit: "month",
        features: ["كل ما في Lifetime Basic", "حتى 500 طالب", "إشعارات SMS", "10+ أنواع تقارير", "وضع PWA غير متصل"],
        cta: "ابدأ التجربة",
      },
      {
        name: "Growth",
        tagline: "المؤسسات المتوسطة إلى الكبيرة",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: ["كل ما في Starter", "طلاب غير محدودين", "الدفع عبر الإنترنت", "WhatsApp + Push", "تحليل AI للتسرب", "تعليقات AI", "5000 SMS/شهر", "دعم ذو أولوية"],
        cta: "ابدأ التجربة",
      },
      {
        name: "Scale",
        tagline: "المؤسسات · متعدد الفروع",
        price: 4500,
        priceUnit: "month",
        features: ["كل ما في Growth", "متعدد الفروع", "نطاق مخصص", "موقع عام", "20،000 SMS/شهر", "دعم 24/7"],
        cta: "ابدأ التجربة",
      },
    ],
  },

  testimonials: {
    eyebrow: "الآراء",
    title: "ماذا يقول المعلمون",
    list: [
      { quote: "تركت Bornomala لصالح Shikkha — الوالدان يدفعون الآن بأنفسهم عبر الإنترنت.", author: "الشيخ عبد الرحمن", role: "مدير", school: "مدرسة دكا الإسلامية" },
      { quote: "وحدة الحفظ رائعة! الخريطة الحرارية لـ 30 جزءًا تُظهر تقدم الجميع.", author: "الحافظ محمد يوسف", role: "مدرس الحفظ", school: "جامعة إسلامية" },
      { quote: "حضور 60 طالبًا في دقيقتين بـ QR — كان يستغرق 15 دقيقة من قبل.", author: "فرزانة أختر", role: "معلمة فصل", school: "مدرسة الخضراء الثانوية" },
    ],
  },

  faq: {
    eyebrow: "المساعدة",
    title: "أسئلة شائعة",
    list: [
      { q: "ماذا تتضمن خطة 5000 مدى الحياة؟", a: "إدارة كاملة لما يصل إلى 200 طالب — الطلاب، الموظفين، الحضور، الرسوم، الامتحانات، كشوف الدرجات، الشهادات، بوابة الوالدين. دفعة واحدة، استخدام مدى الحياة." },
      { q: "هل يمكنني نقل البيانات؟", a: "نعم. يتوفر استيراد Excel لجميع أنواع البيانات." },
      { q: "هل يمكنني تغيير الخطة؟", a: "يمكنك الترقية أو التخفيض في أي وقت. لن تفقد أي بيانات." },
      { q: "كيف أدفع؟", a: "bKash، Nagad، Rocket، التحويل البنكي — جميع الطرق مدعومة." },
      { q: "هل بياناتي آمنة؟", a: "Row-Level Security، 2FA، نسخ احتياطية مشفرة — أمان بمستوى البنوك." },
      { q: "هل يمكنني الاستخدام خارج بنغلاديش؟", a: "نعم. البنغالية، الإنجليزية، الأردية، العربية — دعم كامل في 4 لغات." },
    ],
  },

  finalCta: {
    title: "ابدأ اليوم",
    subtitle: "تجربة مجانية لمدة 15 يوم · بدون بطاقة ائتمان · وصول كامل",
    primary: "ابدأ التجربة المجانية",
    secondary: "تحدث مع المبيعات",
  },

  footer: {
    tagline: "منصة إدارة حديثة للمدارس والمدارس الدينية.",
    product: "المنتج", company: "الشركة", legal: "قانوني",
    privacy: "سياسة الخصوصية", terms: "الشروط",
    copyright: "© 2026 Shikkha Platform · جميع الحقوق محفوظة.",
  },
};

const map: Record<Locale, Copy> = { bn, en, ur, ar };

export function getMarketingCopy(locale: Locale): Copy {
  return map[locale] ?? bn;
}

export type { Copy };
