/**
 * Marketing copy in 4 languages — used by the public site (landing, pricing,
 * features, about, contact, public school page). Kept separate from the
 * next-intl messages/*.json bundle so we can edit marketing copy without
 * touching product strings.
 */

import type { Locale } from "./config";

type Copy = {
  // Navigation
  nav: { home: string; features: string; pricing: string; about: string; contact: string; login: string; signup: string };

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
      /** URL slug for the detail page: /pricing/[slug] */
      slug: "lifetime" | "starter" | "growth" | "scale";
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
    /** avatarSeed = seed passed to DiceBear Notionists API for the profile image */
    list: Array<{ quote: string; author: string; role: string; school: string; avatarSeed: string }>;
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

  // Extras (common hardcoded strings previously scattered across landing page)
  extras: {
    scroll: string;
    trustedBy: string;
    statsHeadingLead: string;      // "By the numbers"
    statsHeadingAccent: string;    // "we are ahead"
    statsBadge: string;
    viewDetails: string;
    learnMore: string;
    schools: string[];              // marquee school names
    supportLabel: string;
    refundLabel: string;
    followUs: string;
    weAccept: string;
    allSystemsOperational: string;
  };

  // Contact page
  contact: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    formHeading: string;
    formSubheading: string;
    labels: { name: string; school: string; email: string; phone: string; subject: string; message: string };
    placeholders: { name: string; school: string; email: string; phone: string; message: string };
    subjectOptions: string[];
    submitCta: string;
    submitNote: string;
    infoCards: { phone: string; email: string; whatsapp: string; office: string };
    infoLines: { phoneHours: string; emailReply: string; whatsappResponse: string; officeVisit: string };
    supportHoursTitle: string;
    supportHoursBody: string;
    quickLinksTitle: string;
    quickLinksSubtitle: string;
    quickLinksSeePricing: string;
    quickLinksSeeFeatures: string;
    quickLinksFreeTrial: string;
    phoneDisplay: string;     // universal format +880 1767-682381
    officeLocation: string;
  };
};

// ─── বাংলা ─────────────────────────────────────────────────────────────────
const bn: Copy = {
  nav: { home: "হোম", features: "ফিচার", pricing: "প্রাইসিং", about: "আমাদের সম্পর্কে", contact: "যোগাযোগ", login: "লগইন", signup: "শুরু করুন" },

  hero: {
    eyebrow: "🕌 বাংলাদেশের মাদ্রাসা ও স্কুলের জন্য ১ নম্বর সফটওয়্যার",
    title: "সম্পূর্ণ মাদ্রাসা ও স্কুল ম্যানেজমেন্ট —",
    titleHighlight: "এক প্ল্যাটফর্মে",
    subtitle: "ভর্তি থেকে পরীক্ষা, ফি থেকে অভিভাবক যোগাযোগ, হিফজ থেকে সার্টিফিকেট — সব কিছু সুন্দর বাংলায়। আধুনিক, সাশ্রয়ী ও সম্পূর্ণ দেশীয় সমাধান।",
    primaryCta: "ফ্রি ট্রায়াল শুরু করুন",
    secondaryCta: "ডেমো দেখুন",
    trustBadges: ["✓ কোন ক্রেডিট কার্ড লাগবে না", "✓ ১৫ দিনের ফ্রি ট্রায়াল", "✓ ২৪/৭ বাংলা সাপোর্ট", "✓ SSL encrypted"],
  },

  stats: { students: "সক্রিয় শিক্ষার্থী", schools: "মাদ্রাসা ও স্কুল", transactions: "মাসিক লেনদেন", languages: "ভাষা সাপোর্ট" },

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
        slug: "lifetime",
        name: "Lifetime Basic",
        tagline: "ছোট প্রতিষ্ঠান · একবার পেমেন্টে সারাজীবন",
        price: 20000,
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
        cta: "লাইফটাইম কিনুন",
      },
      {
        slug: "starter",
        name: "Starter",
        tagline: "বৃদ্ধিমান প্রতিষ্ঠান",
        price: 1000,
        priceUnit: "month",
        features: [
          "Lifetime Basic-এর সব কিছু",
          "৫০০ শিক্ষার্থী পর্যন্ত",
          "SMS নোটিফিকেশন (১,০০০/মাস)",
          "১০+ রিপোর্ট টাইপ",
          "PWA অফলাইন মোড",
          "ইমেইল সাপোর্ট (২৪ ঘণ্টা reply)",
          "Bulk SMS টেমপ্লেট",
          "মাসিক ফি auto-invoice",
          "অভিভাবক broadcast announcement",
          "Automated daily backup",
          "Install prompt (মোবাইল/ট্যাবলেট)",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
      {
        slug: "growth",
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
          "প্রায়োরিটি সাপোর্ট (৮ ঘণ্টা reply)",
          "অনলাইন ক্লাস (Zoom / Google Meet)",
          "Smart SMS টেমপ্লেট (AI-generated)",
          "২-স্তর প্রমাণীকরণ (2FA)",
          "Certificate auto-generation",
          "Real-time financial analytics",
          "Granular staff permissions",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
      {
        slug: "scale",
        name: "Scale",
        tagline: "এন্টারপ্রাইজ · মাল্টি-ব্রাঞ্চ",
        price: 4000,
        priceUnit: "month",
        features: [
          "Growth-এর সব কিছু",
          "সীমাহীন মাল্টি-ব্রাঞ্চ সাপোর্ট",
          "কাস্টম ডোমেইন (yourschool.edu.bd)",
          "পাবলিক স্কুল ওয়েবসাইট",
          "API access + webhooks",
          "১০০ GB ফাইল স্টোরেজ",
          "SMS ক্রেডিট: ২০,০০০/মাস",
          "Advanced audit log + security reports",
          "Custom reports তৈরি করে দিই",
          "২৪/৭ ফোন + WhatsApp সাপোর্ট",
          "Dedicated success manager",
          "মাসিক review call + roadmap priority",
          "SLA guarantee — 99.9% uptime",
          "White-label solution",
          "Custom integrations (ERP, accounting)",
          "Single Sign-On (SSO)",
          "Mobile app rebranding",
          "Disaster recovery + geo-backup",
          "Priority feature requests",
          "Onsite/remote team training",
        ],
        cta: "ট্রায়াল শুরু করুন",
      },
    ],
  },

  testimonials: {
    eyebrow: "প্রতিক্রিয়া",
    title: "শিক্ষকরা যা বলছেন",
    list: [
      { quote: "Muhius Sunnah নেওয়ার পর অভিভাবকরা এখন নিজেরাই পেমেন্ট করেন, আমার অফিসে ভিড় কমে গেছে — সম্পূর্ণ ডিজিটাল হয়ে গেছে।", author: "মাওলানা আব্দুর রহমান", role: "প্রিন্সিপাল", school: "ঢাকা ইসলামিয়া মাদ্রাসা", avatarSeed: "Abdur-Rahman" },
      { quote: "হিফজ মডিউলটা দারুণ! ৩০ পারা heatmap দেখে কে কতদূর এসেছে এক নজরে বোঝা যায়।", author: "হাফেজ মোহাম্মদ ইউসুফ", role: "হিফজ শিক্ষক", school: "জামিয়া ইসলামিয়া", avatarSeed: "Md-Yousuf" },
      { quote: "QR attendance-এ ২ মিনিটে ৬০ জনের হাজিরা — আগে ১৫ মিনিট লাগতো।", author: "ফারজানা আক্তার", role: "ক্লাস টিচার", school: "গ্রীন হাইস্কুল", avatarSeed: "Farzana-Akter" },
      { quote: "AI dropout risk দেখে আগেই বুঝি কোন ছাত্রকে বেশি নজর দিতে হবে — এ বছর কেউ বাদ পড়েনি।", author: "মোহাম্মদ রফিকুল ইসলাম", role: "ভাইস প্রিন্সিপাল", school: "সাউদিয়া মডেল স্কুল", avatarSeed: "Rafiqul-Islam" },
      { quote: "WhatsApp-এ অভিভাবক instant ফি রিমাইন্ডার পান — collection ৪০% বেড়েছে।", author: "রাশিদা সুলতানা", role: "হিসাবরক্ষক", school: "মিরপুর মাদ্রাসা", avatarSeed: "Rashida-Sultana" },
      { quote: "দৈনিক সবক-সবকী-মানজিল grid ছাত্রদের অনুপ্রেরণা দেয়। আলহামদুলিল্লাহ, হিফজ সম্পূর্ণ হার ২৫% বেড়েছে।", author: "মাওলানা আনোয়ার হোসেন", role: "মুহতামিম", school: "আল-আমিন মাদ্রাসা", avatarSeed: "Anwar-Hossain" },
    ],
  },

  faq: {
    eyebrow: "সাহায্য",
    title: "প্রায়ই জিজ্ঞাসিত প্রশ্ন",
    list: [
      { q: "লাইফটাইম ২০,০০০ টাকার প্ল্যানে কি কি পাব?", a: "২০০ জন পর্যন্ত শিক্ষার্থীর সম্পূর্ণ ব্যবস্থাপনা — student, staff, attendance, manual fee tracking, exam, marksheet, certificate, parent portal। একবার পেমেন্ট, সারাজীবন ব্যবহার। কোন AI বা SMS ক্রেডিট অন্তর্ভুক্ত নেই।" },
      { q: "পুরাতন সিস্টেম থেকে ডেটা আনা যাবে?", a: "হ্যাঁ। Excel import আছে সব ডেটার জন্য — students, staff, fees, attendance। যেকোনো পুরাতন সফটওয়্যার বা ম্যানুয়াল রেকর্ড থেকে migrate করতে আমরা সাহায্য করি।" },
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
    copyright: "© ২০২৬ Muhius Sunnah · সর্বস্বত্ব সংরক্ষিত।",
  },

  extras: {
    scroll: "স্ক্রল",
    trustedBy: "১২০+ প্রতিষ্ঠানের বিশ্বস্ত",
    statsHeadingLead: "সংখ্যায় যা বলে —",
    statsHeadingAccent: "আমরা এগিয়ে",
    statsBadge: "পরিসংখ্যান",
    viewDetails: "বিস্তারিত দেখুন",
    learnMore: "আরও জানুন",
    schools: ["ঢাকা ইসলামিয়া", "গ্রীন হাইস্কুল", "জামিয়া ইসলামিয়া", "সাউদিয়া মডেল", "রাজউক কলেজ", "মিরপুর মাদ্রাসা", "বাকলিয়া একাডেমি", "ময়মনসিংহ স্কুল", "চট্টগ্রাম পাবলিক", "সিলেট ক্যাডেট", "নর্থ সাউথ প্রি-স্কুল", "আল-আমিন মাদ্রাসা"],
    supportLabel: "সাপোর্ট",
    refundLabel: "Refund Policy",
    followUs: "আমাদের ফলো করুন",
    weAccept: "আমরা গ্রহণ করি",
    allSystemsOperational: "সব সিস্টেম চালু আছে",
  },

  contact: {
    badge: "যোগাযোগ",
    title: "আমরা আপনাকে",
    titleAccent: "সাহায্য করতে প্রস্তুত",
    subtitle: "প্রশ্ন আছে? Demo চান? Partnership proposal? — নিচের ফর্ম দিয়ে জানান, ২৪ ঘণ্টার মধ্যে reply পাবেন।",
    formHeading: "একটি বার্তা পাঠান",
    formSubheading: "আমাদের sales টিম দ্রুত যোগাযোগ করবে।",
    labels: { name: "পূর্ণ নাম *", school: "প্রতিষ্ঠানের নাম", email: "ইমেইল *", phone: "মোবাইল", subject: "কী নিয়ে?", message: "বার্তা *" },
    placeholders: { name: "আপনার নাম", school: "স্কুল / মাদ্রাসা", email: "you@example.com", phone: "01XXXXXXXXX", message: "আপনার চাহিদা বা প্রশ্ন লিখুন" },
    subjectOptions: ["Demo দেখতে চাই", "Pricing সম্পর্কে প্রশ্ন", "টেকনিক্যাল সাপোর্ট", "Partnership / Reseller", "Migration সহায়তা", "অন্যান্য"],
    submitCta: "বার্তা পাঠান",
    submitNote: "আমরা সাধারণত ২৪ ঘণ্টার মধ্যে reply করি। Urgent হলে সরাসরি ফোন করুন।",
    infoCards: { phone: "ফোন করুন", email: "ইমেইল করুন", whatsapp: "WhatsApp", office: "অফিস" },
    infoLines: { phoneHours: "সকাল ৯টা - রাত ৯টা", emailReply: "২৪ ঘণ্টায় reply", whatsappResponse: "দ্রুত response পেতে", officeVisit: "appointment-এ visit" },
    supportHoursTitle: "সাপোর্ট সময়",
    supportHoursBody: "রবি - বৃহস্পতি: সকাল ৯টা - রাত ৯টা\nশুক্র - শনি: সকাল ১০টা - সন্ধ্যা ৬টা\nScale প্ল্যানে: ২৪/৭",
    quickLinksTitle: "দ্রুত উত্তর চান?",
    quickLinksSubtitle: "আমাদের FAQ দেখুন অথবা প্রাইসিং পেজে যান।",
    quickLinksSeePricing: "প্রাইসিং দেখুন",
    quickLinksSeeFeatures: "সকল ফিচার",
    quickLinksFreeTrial: "ফ্রি ট্রায়াল",
    phoneDisplay: "+880 1767-682381",
    officeLocation: "ঢাকা, বাংলাদেশ",
  },
};

// ─── English ───────────────────────────────────────────────────────────────
const en: Copy = {
  nav: { home: "Home", features: "Features", pricing: "Pricing", about: "About", contact: "Contact", login: "Log in", signup: "Get Started" },

  hero: {
    eyebrow: "🕌 #1 Madrasa & School Management Software for Bangladesh",
    title: "Complete madrasa & school management —",
    titleHighlight: "all in one platform",
    subtitle: "From admissions to exams, fees to parent communication, hifz to certificates — everything in beautiful Bangla. Modern, affordable, and built entirely for Bangladesh.",
    primaryCta: "Start Free Trial",
    secondaryCta: "Watch Demo",
    trustBadges: ["✓ No credit card required", "✓ 15-day free trial", "✓ 24/7 Bangla support", "✓ SSL encrypted"],
  },

  stats: { students: "Active Students", schools: "Madrasas & Schools", transactions: "Monthly Transactions", languages: "Languages Supported" },

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
        slug: "lifetime",
        name: "Lifetime Basic",
        tagline: "Small institutions · pay once, use forever",
        price: 20000,
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
        cta: "Buy Lifetime",
      },
      {
        slug: "starter",
        name: "Starter",
        tagline: "Growing institutions",
        price: 1000,
        priceUnit: "month",
        features: [
          "Everything in Lifetime Basic",
          "Up to 500 students",
          "SMS notifications (1,000/mo)",
          "10+ report types",
          "PWA offline mode",
          "Email support (24h reply)",
          "Bulk SMS templates",
          "Monthly auto-invoice generation",
          "Parent broadcast announcements",
          "Automated daily backup",
          "Install prompt (mobile/tablet)",
        ],
        cta: "Start Trial",
      },
      {
        slug: "growth",
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
          "Priority support (8h reply)",
          "Online classes (Zoom / Google Meet)",
          "Smart SMS templates (AI-generated)",
          "Two-factor authentication (2FA)",
          "Auto certificate generation",
          "Real-time financial analytics",
          "Granular staff permissions",
        ],
        cta: "Start Trial",
      },
      {
        slug: "scale",
        name: "Scale",
        tagline: "Enterprise · Multi-branch",
        price: 4000,
        priceUnit: "month",
        features: [
          "Everything in Growth",
          "Unlimited multi-branch support",
          "Custom domain (yourschool.edu.bd)",
          "Public school website",
          "API access + webhooks",
          "100 GB file storage",
          "SMS credits: 20,000/mo",
          "Advanced audit log + security reports",
          "Custom reports built on demand",
          "24/7 phone + WhatsApp support",
          "Dedicated success manager",
          "Monthly review call + roadmap priority",
          "SLA guarantee — 99.9% uptime",
          "White-label solution",
          "Custom integrations (ERP, accounting)",
          "Single Sign-On (SSO)",
          "Mobile app rebranding",
          "Disaster recovery + geo-backup",
          "Priority feature requests",
          "Onsite/remote team training",
        ],
        cta: "Start Trial",
      },
    ],
  },

  testimonials: {
    eyebrow: "Testimonials",
    title: "What educators are saying",
    list: [
      { quote: "After switching to Muhius Sunnah, parents now pay online themselves — my office is no longer crowded. Fully digital.", author: "Maulana Abdur Rahman", role: "Principal", school: "Dhaka Islamia Madrasa", avatarSeed: "Abdur-Rahman" },
      { quote: "The hifz module is incredible! See the 30-para heatmap to know everyone's progress at a glance.", author: "Hafez Mohammad Yousuf", role: "Hifz Teacher", school: "Jamia Islamia", avatarSeed: "Md-Yousuf" },
      { quote: "60 students' attendance in 2 minutes with QR — used to take 15 minutes before.", author: "Farzana Akter", role: "Class Teacher", school: "Green High School", avatarSeed: "Farzana-Akter" },
      { quote: "AI dropout risk lets us intervene early — this year not a single student dropped out. Game-changer.", author: "Mohammad Rafiqul Islam", role: "Vice Principal", school: "Saudia Model School", avatarSeed: "Rafiqul-Islam" },
      { quote: "Parents get instant WhatsApp fee reminders. Our collection rate jumped 40% in the first month.", author: "Rashida Sultana", role: "Accountant", school: "Mirpur Madrasa", avatarSeed: "Rashida-Sultana" },
      { quote: "Daily Sabaq-Sabqi-Manzil grid motivates students. Alhamdulillah, hifz completion rate up 25%.", author: "Maulana Anwar Hossain", role: "Principal", school: "Al-Amin Madrasa", avatarSeed: "Anwar-Hossain" },
    ],
  },

  faq: {
    eyebrow: "Help",
    title: "Frequently Asked Questions",
    list: [
      { q: "What's included in the ৳20,000 Lifetime plan?", a: "Complete management for up to 200 students — student, staff, attendance, manual fee tracking, exams, marksheets, certificates, parent portal. One-time payment, lifetime use. No AI or SMS credits included." },
      { q: "Can I migrate data from my old system?", a: "Yes. Excel import available for all data types — students, staff, fees, attendance. We also help migrate from any old software or manual records." },
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
    copyright: "© 2026 Muhius Sunnah · All rights reserved.",
  },

  extras: {
    scroll: "Scroll",
    trustedBy: "Trusted by 120+ institutions",
    statsHeadingLead: "The numbers speak —",
    statsHeadingAccent: "we're ahead",
    statsBadge: "By the Numbers",
    viewDetails: "View Details",
    learnMore: "Learn More",
    schools: ["Dhaka Islamia", "Green Highschool", "Jamia Islamia", "Saudia Model", "Rajuk College", "Mirpur Madrasa", "Baklia Academy", "Mymensingh School", "Chittagong Public", "Sylhet Cadet", "North South Pre-School", "Al-Amin Madrasa"],
    supportLabel: "Support",
    refundLabel: "Refund Policy",
    followUs: "Follow Us",
    weAccept: "We Accept",
    allSystemsOperational: "All systems operational",
  },

  contact: {
    badge: "Contact",
    title: "We're ready to",
    titleAccent: "help you succeed",
    subtitle: "Questions? Want a demo? Partnership proposal? — fill the form below and we'll reply within 24 hours.",
    formHeading: "Send us a message",
    formSubheading: "Our sales team will reach out shortly.",
    labels: { name: "Full Name *", school: "Institution Name", email: "Email *", phone: "Mobile", subject: "What's this about?", message: "Message *" },
    placeholders: { name: "Your name", school: "School / madrasa", email: "you@example.com", phone: "01XXXXXXXXX", message: "Describe your needs or question" },
    subjectOptions: ["Book a demo", "Pricing question", "Technical support", "Partnership / Reseller", "Migration help", "Other"],
    submitCta: "Send Message",
    submitNote: "We typically reply within 24 hours. For urgent matters please call.",
    infoCards: { phone: "Call Us", email: "Email Us", whatsapp: "WhatsApp", office: "Office" },
    infoLines: { phoneHours: "9 AM - 9 PM", emailReply: "Reply within 24 hrs", whatsappResponse: "Fastest response", officeVisit: "By appointment" },
    supportHoursTitle: "Support Hours",
    supportHoursBody: "Sun - Thu: 9 AM - 9 PM\nFri - Sat: 10 AM - 6 PM\nScale plan: 24/7",
    quickLinksTitle: "Need a quick answer?",
    quickLinksSubtitle: "Check our FAQ or go to pricing.",
    quickLinksSeePricing: "See Pricing",
    quickLinksSeeFeatures: "All Features",
    quickLinksFreeTrial: "Free Trial",
    phoneDisplay: "+880 1767-682381",
    officeLocation: "Dhaka, Bangladesh",
  },
};

// ─── اردو (Urdu, RTL) ──────────────────────────────────────────────────────
const ur: Copy = {
  nav: { home: "ہوم", features: "خصوصیات", pricing: "قیمتیں", about: "ہمارے بارے میں", contact: "رابطہ", login: "لاگ ان", signup: "شروع کریں" },

  hero: {
    eyebrow: "🕌 مدارس اور اسکولوں کے لیے نمبر ۱ سافٹ ویئر",
    title: "مکمل مدرسہ اور اسکول انتظام —",
    titleHighlight: "ایک پلیٹ فارم پر",
    subtitle: "داخلہ سے امتحان تک، فیس سے والدین کے رابطے تک، حفظ سے اسناد تک — سب کچھ خوبصورت اردو میں۔",
    primaryCta: "مفت آزمائش شروع کریں",
    secondaryCta: "ڈیمو دیکھیں",
    trustBadges: ["✓ کریڈٹ کارڈ کی ضرورت نہیں", "✓ ۱۵ دن کی مفت آزمائش", "✓ ۲۴/۷ سپورٹ", "✓ SSL محفوظ"],
  },

  stats: { students: "فعال طلباء", schools: "مدارس اور اسکول", transactions: "ماہانہ لین دین", languages: "زبانوں کی حمایت" },

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
        slug: "lifetime",
        name: "Lifetime Basic",
        tagline: "چھوٹے ادارے · ایک بار ادائیگی، ہمیشہ کے لیے",
        price: 20000,
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
        cta: "لائف ٹائم خریدیں",
      },
      {
        slug: "starter",
        name: "Starter",
        tagline: "بڑھتے ہوئے ادارے",
        price: 1000,
        priceUnit: "month",
        features: [
          "Lifetime Basic کی سب کچھ",
          "۵۰۰ طلباء تک",
          "SMS اطلاعات (۱،۰۰۰/ماہ)",
          "۱۰+ رپورٹ اقسام",
          "PWA آف لائن موڈ",
          "ای میل سپورٹ (۲۴ گھنٹے reply)",
          "Bulk SMS ٹیمپلیٹس",
          "ماہانہ فیس کی خودکار انوائس",
          "والدین کو broadcast اعلانات",
          "روزانہ خودکار بیک اپ",
          "انسٹال پرامپٹ (موبائل/ٹیبلٹ)",
        ],
        cta: "آزمائش شروع کریں",
      },
      {
        slug: "growth",
        name: "Growth",
        tagline: "درمیانے سے بڑے ادارے",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: [
          "Starter کی سب کچھ",
          "لامحدود طلباء",
          "آن لائن ادائیگی (bKash, SSLCommerz)",
          "WhatsApp + Push اطلاعات",
          "AI ڈراپ آؤٹ تجزیہ",
          "AI رپورٹ تبصرے",
          "۵۰۰۰ SMS/ماہ",
          "ترجیحی سپورٹ (۸ گھنٹے reply)",
          "آن لائن کلاسز (Zoom / Google Meet)",
          "Smart SMS ٹیمپلیٹس (AI)",
          "دو مرحلہ تصدیق (2FA)",
          "خودکار اسناد کی تیاری",
          "حقیقی وقت کی مالی رپورٹس",
          "اسٹاف اجازت نامے کی تفصیل",
        ],
        cta: "آزمائش شروع کریں",
      },
      {
        slug: "scale",
        name: "Scale",
        tagline: "انٹرپرائز · ملٹی برانچ",
        price: 4000,
        priceUnit: "month",
        features: [
          "Growth کی سب کچھ",
          "لامحدود ملٹی برانچ سپورٹ",
          "کسٹم ڈومین (yourschool.edu.bd)",
          "عوامی اسکول ویب سائٹ",
          "API access + webhooks",
          "۱۰۰ GB فائل اسٹوریج",
          "SMS کریڈٹ: ۲۰،۰۰۰/ماہ",
          "Advanced audit log + security رپورٹس",
          "آپ کی ضرورت کے مطابق کسٹم رپورٹس",
          "۲۴/۷ فون + WhatsApp سپورٹ",
          "Dedicated success manager",
          "ماہانہ review کال + roadmap ترجیح",
          "SLA ضمانت — 99.9% uptime",
          "White-label حل",
          "کسٹم انٹیگریشنز (ERP، اکاؤنٹنگ)",
          "Single Sign-On (SSO)",
          "موبائل ایپ ری برانڈنگ",
          "Disaster recovery + geo-backup",
          "Priority feature درخواستیں",
          "آن سائٹ/ریموٹ ٹیم ٹریننگ",
        ],
        cta: "آزمائش شروع کریں",
      },
    ],
  },

  testimonials: {
    eyebrow: "آراء",
    title: "اساتذہ کیا کہتے ہیں",
    list: [
      { quote: "Muhius Sunnah لینے کے بعد والدین اب خود آن لائن ادائیگی کرتے ہیں — میرا دفتر اب بھیڑ سے خالی ہے۔", author: "مولانا عبدالرحمن", role: "پرنسپل", school: "ڈھاکہ اسلامیہ مدرسہ", avatarSeed: "Abdur-Rahman" },
      { quote: "حفظ ماڈیول بہت اچھا ہے! ۳۰ پارہ ہیٹ میپ میں کون کہاں پہنچا فوراً نظر آتا ہے۔", author: "حافظ محمد یوسف", role: "حفظ استاد", school: "جامعہ اسلامیہ", avatarSeed: "Md-Yousuf" },
      { quote: "QR حاضری میں ۶۰ طلباء کی حاضری ۲ منٹ میں — پہلے ۱۵ منٹ لگتے تھے۔", author: "فرزانہ اختر", role: "کلاس ٹیچر", school: "گرین ہائی اسکول", avatarSeed: "Farzana-Akter" },
      { quote: "AI ڈراپ آؤٹ رسک سے پہلے ہی پتہ چل جاتا ہے — اس سال کوئی طالب علم نہیں چھوڑا۔", author: "محمد رفیق الاسلام", role: "وائس پرنسپل", school: "سعودیہ ماڈل اسکول", avatarSeed: "Rafiqul-Islam" },
      { quote: "WhatsApp پر والدین کو فوری فیس یاد دہانی ملتی ہے — وصولی ۴۰٪ بڑھ گئی۔", author: "راشدہ سلطانہ", role: "اکاؤنٹنٹ", school: "میرپور مدرسہ", avatarSeed: "Rashida-Sultana" },
      { quote: "روزانہ سبق گرڈ طلباء کو متحرک کرتا ہے۔ الحمدللہ، حفظ مکمل ہونے کی شرح ۲۵٪ بڑھی۔", author: "مولانا انور حسین", role: "مہتمم", school: "الامین مدرسہ", avatarSeed: "Anwar-Hossain" },
    ],
  },

  faq: {
    eyebrow: "مدد",
    title: "عام سوالات",
    list: [
      { q: "۲۰،۰۰۰ کے لائف ٹائم پلان میں کیا ملے گا؟", a: "۲۰۰ طلباء تک کا مکمل انتظام — طالب علم، اساتذہ، حاضری، فیس، امتحانات، مارک شیٹ، اسناد، والدین پورٹل۔ ایک بار ادائیگی، ہمیشہ کے لیے۔" },
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
    copyright: "© ۲۰۲۶ Muhius Sunnah · جملہ حقوق محفوظ۔",
  },

  extras: {
    scroll: "سکرول",
    trustedBy: "۱۲۰+ اداروں کا اعتماد",
    statsHeadingLead: "اعداد کہتے ہیں —",
    statsHeadingAccent: "ہم آگے ہیں",
    statsBadge: "اعداد و شمار",
    viewDetails: "تفصیلات دیکھیں",
    learnMore: "مزید جانیں",
    schools: ["ڈھاکہ اسلامیہ", "گرین ہائی اسکول", "جامعہ اسلامیہ", "سعودیہ ماڈل", "راجوک کالج", "میرپور مدرسہ", "باقلیہ اکیڈمی", "میمن سنگھ اسکول", "چٹاگانگ پبلک", "سلہٹ کیڈٹ", "نارتھ ساؤتھ پری اسکول", "الامین مدرسہ"],
    supportLabel: "سپورٹ",
    refundLabel: "رقم کی واپسی",
    followUs: "فالو کریں",
    weAccept: "ہم قبول کرتے ہیں",
    allSystemsOperational: "تمام سسٹم چل رہے ہیں",
  },

  contact: {
    badge: "رابطہ",
    title: "ہم آپ کی",
    titleAccent: "مدد کے لیے تیار ہیں",
    subtitle: "سوالات ہیں؟ ڈیمو چاہیے؟ پارٹنرشپ؟ — ذیل کا فارم بھریں، ہم ۲۴ گھنٹوں میں جواب دیں گے۔",
    formHeading: "ایک پیغام بھیجیں",
    formSubheading: "ہماری سیلز ٹیم جلد رابطہ کرے گی۔",
    labels: { name: "پورا نام *", school: "ادارے کا نام", email: "ای میل *", phone: "موبائل", subject: "کس بارے میں؟", message: "پیغام *" },
    placeholders: { name: "آپ کا نام", school: "اسکول / مدرسہ", email: "you@example.com", phone: "01XXXXXXXXX", message: "اپنی ضرورت یا سوال لکھیں" },
    subjectOptions: ["ڈیمو دیکھنا چاہتا ہوں", "قیمت کے بارے میں سوال", "ٹیکنیکل سپورٹ", "پارٹنرشپ / ری سیلر", "مائیگریشن مدد", "دیگر"],
    submitCta: "پیغام بھیجیں",
    submitNote: "ہم عام طور پر ۲۴ گھنٹوں میں جواب دیتے ہیں۔ فوری بات کے لیے فون کریں۔",
    infoCards: { phone: "فون کریں", email: "ای میل کریں", whatsapp: "WhatsApp", office: "دفتر" },
    infoLines: { phoneHours: "صبح ۹ تا رات ۹", emailReply: "۲۴ گھنٹے میں جواب", whatsappResponse: "تیز ترین جواب", officeVisit: "اپائنٹمنٹ پر" },
    supportHoursTitle: "سپورٹ اوقات",
    supportHoursBody: "اتوار - جمعرات: ۹ صبح تا ۹ رات\nجمعہ - ہفتہ: ۱۰ صبح تا ۶ شام\nScale پلان: ۲۴/۷",
    quickLinksTitle: "فوری جواب چاہیے؟",
    quickLinksSubtitle: "ہمارا FAQ دیکھیں یا قیمت پیج پر جائیں۔",
    quickLinksSeePricing: "قیمت دیکھیں",
    quickLinksSeeFeatures: "تمام خصوصیات",
    quickLinksFreeTrial: "مفت ٹرائل",
    phoneDisplay: "+880 1767-682381",
    officeLocation: "ڈھاکہ، بنگلہ دیش",
  },
};

// ─── العربية (Arabic, RTL) ─────────────────────────────────────────────────
const ar: Copy = {
  nav: { home: "الرئيسية", features: "المميزات", pricing: "الأسعار", about: "من نحن", contact: "اتصل بنا", login: "تسجيل الدخول", signup: "ابدأ الآن" },

  hero: {
    eyebrow: "🕌 برنامج إدارة المدارس الدينية والعامة الأول",
    title: "إدارة كاملة للمدارس الدينية والمدارس —",
    titleHighlight: "في منصة واحدة",
    subtitle: "من القبول إلى الامتحانات، من الرسوم إلى التواصل مع الوالدين، من الحفظ إلى الشهادات — كل شيء في مكان واحد.",
    primaryCta: "ابدأ التجربة المجانية",
    secondaryCta: "شاهد العرض",
    trustBadges: ["✓ بدون بطاقة ائتمان", "✓ تجربة مجانية لمدة 15 يوم", "✓ دعم 24/7", "✓ مشفر SSL"],
  },

  stats: { students: "طلاب نشطون", schools: "مدارس دينية وعامة", transactions: "معاملات شهرية", languages: "لغات مدعومة" },

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
        slug: "lifetime",
        name: "Lifetime Basic",
        tagline: "المؤسسات الصغيرة · ادفع مرة، استخدم للأبد",
        price: 20000,
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
        cta: "اشتر مدى الحياة",
      },
      {
        slug: "starter",
        name: "Starter",
        tagline: "المؤسسات النامية",
        price: 1000,
        priceUnit: "month",
        features: [
          "كل ما في Lifetime Basic",
          "حتى 500 طالب",
          "إشعارات SMS (1،000/شهر)",
          "10+ أنواع تقارير",
          "وضع PWA غير متصل",
          "دعم بريد إلكتروني (رد خلال 24 ساعة)",
          "قوالب SMS مجمعة",
          "إصدار فواتير شهرية تلقائية",
          "إعلانات واسعة للوالدين",
          "نسخ احتياطي تلقائي يومي",
          "مطالبة التثبيت (جوال/جهاز لوحي)",
        ],
        cta: "ابدأ التجربة",
      },
      {
        slug: "growth",
        name: "Growth",
        tagline: "المؤسسات المتوسطة إلى الكبيرة",
        price: 2000,
        priceUnit: "month",
        highlighted: true,
        features: [
          "كل ما في Starter",
          "طلاب غير محدودين",
          "الدفع عبر الإنترنت (bKash, SSLCommerz)",
          "WhatsApp + Push",
          "تحليل AI للتسرب",
          "تعليقات AI",
          "5000 SMS/شهر",
          "دعم ذو أولوية (رد خلال 8 ساعات)",
          "حصص عبر الإنترنت (Zoom / Google Meet)",
          "قوالب SMS ذكية (AI)",
          "المصادقة الثنائية (2FA)",
          "إنشاء شهادات تلقائي",
          "تحليلات مالية فورية",
          "صلاحيات دقيقة للموظفين",
        ],
        cta: "ابدأ التجربة",
      },
      {
        slug: "scale",
        name: "Scale",
        tagline: "المؤسسات · متعدد الفروع",
        price: 4000,
        priceUnit: "month",
        features: [
          "كل ما في Growth",
          "دعم فروع متعددة غير محدود",
          "نطاق مخصص (yourschool.edu.bd)",
          "موقع مدرسي عام",
          "API access + webhooks",
          "100 GB تخزين ملفات",
          "رصيد SMS: 20،000/شهر",
          "Advanced audit log + تقارير أمنية",
          "تقارير مخصصة حسب الطلب",
          "دعم هاتفي + WhatsApp 24/7",
          "مدير نجاح مخصص",
          "مكالمة مراجعة شهرية + أولوية خارطة الطريق",
          "ضمان SLA — 99.9% uptime",
          "حل White-label",
          "تكاملات مخصصة (ERP، محاسبة)",
          "تسجيل دخول موحد (SSO)",
          "إعادة تسمية تطبيق الجوال",
          "استعادة الكوارث + النسخ الجغرافي",
          "أولوية طلبات الميزات",
          "تدريب الفريق في الموقع/عن بُعد",
        ],
        cta: "ابدأ التجربة",
      },
    ],
  },

  testimonials: {
    eyebrow: "الآراء",
    title: "ماذا يقول المعلمون",
    list: [
      { quote: "بعد التحول إلى Muhius Sunnah، يدفع الوالدان الآن عبر الإنترنت بأنفسهم — لم يعد مكتبي مزدحمًا.", author: "الشيخ عبد الرحمن", role: "مدير", school: "مدرسة دكا الإسلامية", avatarSeed: "Abdur-Rahman" },
      { quote: "وحدة الحفظ رائعة! الخريطة الحرارية لـ 30 جزءًا تُظهر تقدم الجميع.", author: "الحافظ محمد يوسف", role: "مدرس الحفظ", school: "جامعة إسلامية", avatarSeed: "Md-Yousuf" },
      { quote: "حضور 60 طالبًا في دقيقتين بـ QR — كان يستغرق 15 دقيقة من قبل.", author: "فرزانة أختر", role: "معلمة فصل", school: "مدرسة الخضراء الثانوية", avatarSeed: "Farzana-Akter" },
      { quote: "تحليل مخاطر التسرب بالذكاء الاصطناعي يتيح التدخل المبكر — لم يتسرب أي طالب هذا العام.", author: "محمد رفيق الإسلام", role: "نائب المدير", school: "مدرسة سعودية النموذجية", avatarSeed: "Rafiqul-Islam" },
      { quote: "يتلقى الوالدون تذكيرات الرسوم عبر WhatsApp فورًا — زاد معدل التحصيل 40٪.", author: "رشيدة سلطانة", role: "محاسبة", school: "مدرسة ميربور", avatarSeed: "Rashida-Sultana" },
      { quote: "شبكة السبق اليومي تحفز الطلاب. الحمد لله، ارتفع معدل إكمال الحفظ بنسبة 25٪.", author: "مولانا أنور حسين", role: "مدير", school: "مدرسة الأمين", avatarSeed: "Anwar-Hossain" },
    ],
  },

  faq: {
    eyebrow: "المساعدة",
    title: "أسئلة شائعة",
    list: [
      { q: "ماذا تتضمن خطة 20،000 مدى الحياة؟", a: "إدارة كاملة لما يصل إلى 200 طالب — الطلاب، الموظفين، الحضور، الرسوم، الامتحانات، كشوف الدرجات، الشهادات، بوابة الوالدين. دفعة واحدة، استخدام مدى الحياة." },
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
    copyright: "© 2026 Muhius Sunnah · جميع الحقوق محفوظة.",
  },

  extras: {
    scroll: "مرّر",
    trustedBy: "موثوق به من 120+ مؤسسة",
    statsHeadingLead: "الأرقام تتحدث —",
    statsHeadingAccent: "نحن في المقدمة",
    statsBadge: "إحصائيات",
    viewDetails: "عرض التفاصيل",
    learnMore: "اعرف المزيد",
    schools: ["دكا الإسلامية", "المدرسة الخضراء", "جامعة إسلامية", "نموذج سعودية", "كلية راجوك", "مدرسة ميربور", "أكاديمية باقليا", "مدرسة ميمنسنغ", "شيتاغونغ العامة", "سيلهيت كاديت", "روضة شمال جنوب", "مدرسة الأمين"],
    supportLabel: "الدعم",
    refundLabel: "سياسة الاسترداد",
    followUs: "تابعنا",
    weAccept: "نقبل",
    allSystemsOperational: "جميع الأنظمة تعمل",
  },

  contact: {
    badge: "اتصل بنا",
    title: "نحن مستعدون",
    titleAccent: "لمساعدتك",
    subtitle: "لديك أسئلة؟ تريد عرضًا توضيحيًا؟ شراكة؟ — املأ النموذج أدناه وسنرد خلال 24 ساعة.",
    formHeading: "أرسل رسالة",
    formSubheading: "سيتواصل معك فريق المبيعات قريبًا.",
    labels: { name: "الاسم الكامل *", school: "اسم المؤسسة", email: "البريد الإلكتروني *", phone: "الجوال", subject: "ما الموضوع؟", message: "الرسالة *" },
    placeholders: { name: "اسمك", school: "مدرسة / مدرسة دينية", email: "you@example.com", phone: "01XXXXXXXXX", message: "صف احتياجك أو سؤالك" },
    subjectOptions: ["أريد عرضًا توضيحيًا", "سؤال عن الأسعار", "دعم فني", "شراكة / وسيط بيع", "مساعدة في الترحيل", "أخرى"],
    submitCta: "إرسال الرسالة",
    submitNote: "نرد عادةً خلال 24 ساعة. للأمور العاجلة، اتصل مباشرة.",
    infoCards: { phone: "اتصل بنا", email: "البريد الإلكتروني", whatsapp: "WhatsApp", office: "المكتب" },
    infoLines: { phoneHours: "9 صباحًا - 9 مساءً", emailReply: "الرد خلال 24 ساعة", whatsappResponse: "أسرع استجابة", officeVisit: "بموعد مسبق" },
    supportHoursTitle: "أوقات الدعم",
    supportHoursBody: "الأحد - الخميس: 9 صباحًا - 9 مساءً\nالجمعة - السبت: 10 صباحًا - 6 مساءً\nخطة Scale: 24/7",
    quickLinksTitle: "تحتاج إجابة سريعة؟",
    quickLinksSubtitle: "تحقق من الأسئلة الشائعة أو اذهب إلى الأسعار.",
    quickLinksSeePricing: "عرض الأسعار",
    quickLinksSeeFeatures: "كل الميزات",
    quickLinksFreeTrial: "تجربة مجانية",
    phoneDisplay: "+880 1767-682381",
    officeLocation: "دكا، بنغلاديش",
  },
};

const map: Record<Locale, Copy> = { bn, en, ur, ar };

export function getMarketingCopy(locale: Locale): Copy {
  return map[locale] ?? bn;
}

export type { Copy };
