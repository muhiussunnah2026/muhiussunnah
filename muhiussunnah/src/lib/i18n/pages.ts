/**
 * Per-page copy bundles in 4 languages (bn/en/ur/ar).
 *
 * Marketing pages (features, about, support, refund-policy, pricing/[slug])
 * have long content blocks that don't belong in marketing.ts. They live here
 * and are picked by locale.
 */

import type { Locale } from "./config";

// ─── /features ────────────────────────────────────────────────────────────

export type FeaturesPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  groups: Array<{
    title: string;
    items: Array<{ iconName: string; title: string; desc: string }>;
  }>;
};

const featuresPage: Record<Locale, FeaturesPageCopy> = {
  bn: {
    heroBadge: "ফিচার",
    heroTitle: "যা যা লাগবে",
    heroAccent: "সব এক জায়গায়",
    heroSubtitle: "শিক্ষার্থী ব্যবস্থাপনা থেকে অনলাইন পেমেন্ট, AI বিশ্লেষণ থেকে মাদ্রাসা মডিউল — কোন তৃতীয়-পক্ষ সফটওয়্যার লাগবে না।",
    ctaTitle: "আজই শুরু করুন",
    ctaSubtitle: "১৫ দিন ফ্রি ট্রায়াল · কোন ক্রেডিট কার্ড লাগবে না · সম্পূর্ণ access",
    ctaPrimary: "ফ্রি ট্রায়াল শুরু করুন",
    ctaSecondary: "প্রাইসিং",
    groups: [
      { title: "📚 একাডেমিক", items: [
        { iconName: "Users", title: "শিক্ষার্থী ব্যবস্থাপনা", desc: "Excel import, guardian linking, transfer, promotion, profile photo।" },
        { iconName: "Calendar", title: "QR উপস্থিতি", desc: "২ মিনিটে ক্লাসের হাজিরা। অভিভাবক instant SMS পান।" },
        { iconName: "ScrollText", title: "পরীক্ষা ও রেজাল্ট", desc: "GPA 5.0, position ranking, keyboard-friendly marks entry grid।" },
        { iconName: "FileText", title: "সার্টিফিকেট", desc: "টেমপ্লেট-based certificate তৈরি, Bangla Unicode print-ready।" },
        { iconName: "ClipboardCheck", title: "অ্যাসাইনমেন্ট", desc: "শিক্ষক তৈরি করেন, ছাত্র জমা দেয়, শিক্ষক গ্রেড দেন।" },
        { iconName: "Video", title: "অনলাইন ক্লাস", desc: "Zoom, Google Meet, Teams — সরাসরি পোর্টাল থেকে যোগ।" },
      ]},
      { title: "💰 ফিন্যান্স", items: [
        { iconName: "Wallet", title: "অনলাইন পেমেন্ট", desc: "bKash, Nagad, Rocket, SSLCommerz — directly ফি collection।" },
        { iconName: "TrendingUp", title: "খরচ ও আয় ট্র্যাকিং", desc: "২৪টি pre-configured expense heads + donation campaigns।" },
        { iconName: "Award", title: "বৃত্তি ব্যবস্থাপনা", desc: "Need-based + merit-based scholarship assignment।" },
        { iconName: "BarChart3", title: "১০+ রিপোর্ট", desc: "ফি কালেকশন, বকেয়া aging, আয়-ব্যয়, বেতন — PDF/Excel।" },
      ]},
      { title: "📱 যোগাযোগ", items: [
        { iconName: "Megaphone", title: "SMS + WhatsApp + Push", desc: "একটি নোটিশ ৪ চ্যানেলে — SSL Wireless + Meta Cloud + FCM।" },
        { iconName: "MessageCircle", title: "সাপোর্ট টিকেট", desc: "অভিভাবক প্রশ্ন করেন, admin reply করেন — threaded inbox।" },
        { iconName: "Sparkles", title: "AI SMS টেমপ্লেট", desc: "ফি রিমাইন্ডার, অনুপস্থিতি — AI দিয়ে তৈরি বাংলা কপি।" },
      ]},
      { title: "🕌 মাদ্রাসা", items: [
        { iconName: "BookOpen", title: "হিফজ heatmap", desc: "৩০ পারা × শিক্ষার্থী — সম্পূর্ণ hifz progress এক নজরে।" },
        { iconName: "BookOpen", title: "কিতাব curriculum", desc: "৬ স্তর — প্রাথমিক থেকে তাকমিল পর্যন্ত।" },
        { iconName: "Calendar", title: "দৈনিক সবক-সবকী-মানজিল", desc: "প্রতিদিনের সবক track — ১০ কলামের গ্রিড।" },
        { iconName: "Globe", title: "Hijri তারিখ + Arabic RTL", desc: "Islamic calendar integration + পুরো সিস্টেম Arabic RTL সাপোর্ট।" },
      ]},
      { title: "🏢 অপারেশনাল", items: [
        { iconName: "BookOpen", title: "লাইব্রেরি", desc: "বই ক্যাটালগ, issue/return, overdue tracking।" },
        { iconName: "Users", title: "পরিবহন", desc: "রুট, গাড়ি, ছাত্র assignment, GPS-ready।" },
        { iconName: "Users", title: "হোস্টেল", desc: "ভবন, রুম, বেড allocation, warden ব্যবস্থাপনা।" },
        { iconName: "ClipboardCheck", title: "ইনভেন্টরি", desc: "স্টেশনারি ও সম্পদ stock movement, reorder alert।" },
      ]},
      { title: "🔒 নিরাপত্তা ও স্কেল", items: [
        { iconName: "Shield", title: "২-স্তর প্রমাণীকরণ (2FA)", desc: "TOTP-based 2FA — Google Authenticator + recovery codes।" },
        { iconName: "Shield", title: "Row-Level Security", desc: "প্রত্যেক স্কুলের ডেটা RLS-দ্বারা আলাদা, cross-tenant leak অসম্ভব।" },
        { iconName: "Smartphone", title: "অফলাইন PWA", desc: "নেট না থাকলেও হাজিরা ও মার্কস — auto-sync on reconnect।" },
        { iconName: "TrendingUp", title: "Realtime Live Dashboard", desc: "Supabase Realtime — পেমেন্ট/ভর্তি হলেই dashboard auto-update।" },
        { iconName: "Sparkles", title: "AI ড্রপআউট ঝুঁকি", desc: "উপস্থিতি + মার্কস + ফি → ঝুঁকি স্কোর + AI suggestion।" },
        { iconName: "Globe", title: "৪ ভাষা সাপোর্ট", desc: "বাংলা, English, উর্দু, আরবি — RTL + hijri + Bangla digits।" },
      ]},
    ],
  },
  en: {
    heroBadge: "Features",
    heroTitle: "Everything you need,",
    heroAccent: "in one place",
    heroSubtitle: "From student management to online payments, AI insights to madrasa modules — no third-party software needed.",
    ctaTitle: "Start today",
    ctaSubtitle: "15-day free trial · No credit card required · Full access",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Pricing",
    groups: [
      { title: "📚 Academic", items: [
        { iconName: "Users", title: "Student Management", desc: "Excel import, guardian linking, transfer, promotion, profile photo." },
        { iconName: "Calendar", title: "QR Attendance", desc: "Full class in 2 minutes. Parents get instant SMS." },
        { iconName: "ScrollText", title: "Exams & Results", desc: "GPA 5.0, position ranking, keyboard-friendly marks entry grid." },
        { iconName: "FileText", title: "Certificates", desc: "Template-based certificate creation, Bangla Unicode print-ready." },
        { iconName: "ClipboardCheck", title: "Assignments", desc: "Teachers create, students submit, teachers grade." },
        { iconName: "Video", title: "Online Classes", desc: "Zoom, Google Meet, Teams — join directly from the portal." },
      ]},
      { title: "💰 Finance", items: [
        { iconName: "Wallet", title: "Online Payments", desc: "bKash, Nagad, Rocket, SSLCommerz — direct fee collection." },
        { iconName: "TrendingUp", title: "Income & Expense Tracking", desc: "24 pre-configured expense heads + donation campaigns." },
        { iconName: "Award", title: "Scholarship Management", desc: "Need-based + merit-based scholarship assignment." },
        { iconName: "BarChart3", title: "10+ Reports", desc: "Fee collection, dues aging, P&L, payroll — PDF/Excel." },
      ]},
      { title: "📱 Communication", items: [
        { iconName: "Megaphone", title: "SMS + WhatsApp + Push", desc: "One notice, 4 channels — SSL Wireless + Meta Cloud + FCM." },
        { iconName: "MessageCircle", title: "Support Tickets", desc: "Parents ask, admins reply — threaded inbox." },
        { iconName: "Sparkles", title: "AI SMS Templates", desc: "Fee reminders, absences — AI-generated Bangla copy." },
      ]},
      { title: "🕌 Madrasa", items: [
        { iconName: "BookOpen", title: "Hifz heatmap", desc: "30-para × student grid — entire hifz progress at a glance." },
        { iconName: "BookOpen", title: "Kitab curriculum", desc: "6 stages — primary to Takmeel." },
        { iconName: "Calendar", title: "Daily Sabaq-Sabqi-Manzil", desc: "Track every day — 10-column grid." },
        { iconName: "Globe", title: "Hijri dates + Arabic RTL", desc: "Islamic calendar + full system Arabic RTL support." },
      ]},
      { title: "🏢 Operational", items: [
        { iconName: "BookOpen", title: "Library", desc: "Book catalog, issue/return, overdue tracking." },
        { iconName: "Users", title: "Transport", desc: "Routes, vehicles, student assignment, GPS-ready." },
        { iconName: "Users", title: "Hostel", desc: "Buildings, rooms, bed allocation, warden management." },
        { iconName: "ClipboardCheck", title: "Inventory", desc: "Stationery & asset stock movement, reorder alerts." },
      ]},
      { title: "🔒 Security & Scale", items: [
        { iconName: "Shield", title: "Two-Factor Auth (2FA)", desc: "TOTP-based 2FA — Google Authenticator + recovery codes." },
        { iconName: "Shield", title: "Row-Level Security", desc: "Each school's data isolated by RLS, cross-tenant leak impossible." },
        { iconName: "Smartphone", title: "Offline PWA", desc: "Attendance & marks without internet — auto-sync on reconnect." },
        { iconName: "TrendingUp", title: "Realtime Live Dashboard", desc: "Supabase Realtime — payment/admission triggers auto-update." },
        { iconName: "Sparkles", title: "AI Dropout Risk", desc: "Attendance + marks + fees → risk score + AI suggestion." },
        { iconName: "Globe", title: "4-language support", desc: "Bangla, English, Urdu, Arabic — RTL + Hijri + Bangla digits." },
      ]},
    ],
  },
  ur: {
    heroBadge: "خصوصیات",
    heroTitle: "جو کچھ آپ کو چاہیے،",
    heroAccent: "ایک جگہ",
    heroSubtitle: "طالب علم کے انتظام سے آن لائن ادائیگی تک، AI تجزیہ سے مدرسہ ماڈیول تک — کسی تیسرے فریق کے سافٹ ویئر کی ضرورت نہیں۔",
    ctaTitle: "آج ہی شروع کریں",
    ctaSubtitle: "۱۵ دن مفت آزمائش · کوئی کریڈٹ کارڈ نہیں · مکمل رسائی",
    ctaPrimary: "مفت آزمائش شروع کریں",
    ctaSecondary: "قیمتیں",
    groups: [
      { title: "📚 تعلیمی", items: [
        { iconName: "Users", title: "طالب علم کا انتظام", desc: "Excel درآمد، سرپرست لنکنگ، ٹرانسفر، پروموشن، پروفائل فوٹو۔" },
        { iconName: "Calendar", title: "QR حاضری", desc: "۲ منٹ میں پوری کلاس۔ والدین کو فوری SMS۔" },
        { iconName: "ScrollText", title: "امتحانات اور نتائج", desc: "GPA 5.0، پوزیشن رینکنگ، کی بورڈ دوستانہ مارک انٹری گرڈ۔" },
        { iconName: "FileText", title: "اسناد", desc: "ٹیمپلیٹ پر مبنی سند، اردو پرنٹ ریڈی۔" },
        { iconName: "ClipboardCheck", title: "اسائنمنٹس", desc: "اساتذہ بناتے ہیں، طلباء جمع کرتے ہیں، اساتذہ گریڈ کرتے ہیں۔" },
        { iconName: "Video", title: "آن لائن کلاسز", desc: "Zoom، Google Meet، Teams — براہ راست پورٹل سے شمولیت۔" },
      ]},
      { title: "💰 مالیاتی", items: [
        { iconName: "Wallet", title: "آن لائن ادائیگی", desc: "bKash، Nagad، Rocket، SSLCommerz — براہ راست فیس وصولی۔" },
        { iconName: "TrendingUp", title: "آمدنی اور اخراجات کی نگرانی", desc: "۲۴ پہلے سے ترتیب شدہ اخراجات اقسام + عطیہ مہمات۔" },
        { iconName: "Award", title: "اسکالرشپ انتظام", desc: "ضرورت پر مبنی + میرٹ پر مبنی اسکالرشپ۔" },
        { iconName: "BarChart3", title: "۱۰+ رپورٹس", desc: "فیس وصولی، واجبات، منافع و نقصان، تنخواہ — PDF/Excel۔" },
      ]},
      { title: "📱 رابطہ", items: [
        { iconName: "Megaphone", title: "SMS + WhatsApp + Push", desc: "ایک نوٹس، ۴ چینلز — SSL Wireless + Meta Cloud + FCM۔" },
        { iconName: "MessageCircle", title: "سپورٹ ٹکٹ", desc: "والدین پوچھتے ہیں، منتظمین جواب دیتے ہیں — تھریڈڈ ان باکس۔" },
        { iconName: "Sparkles", title: "AI SMS ٹیمپلیٹس", desc: "فیس یاد دہانی، غیر حاضری — AI سے تیار کردہ۔" },
      ]},
      { title: "🕌 مدرسہ", items: [
        { iconName: "BookOpen", title: "حفظ ہیٹ میپ", desc: "۳۰ پارہ × طالب علم — مکمل حفظ پیش رفت۔" },
        { iconName: "BookOpen", title: "کتاب نصاب", desc: "۶ مراحل — ابتدائی سے تکمیل تک۔" },
        { iconName: "Calendar", title: "روزانہ سبق-سبقی-منزل", desc: "ہر دن ٹریک — ۱۰ کالم کا گرڈ۔" },
        { iconName: "Globe", title: "ہجری تاریخیں + عربی RTL", desc: "اسلامی کیلنڈر + مکمل سسٹم RTL۔" },
      ]},
      { title: "🏢 آپریشنل", items: [
        { iconName: "BookOpen", title: "لائبریری", desc: "کتابوں کا فہرست، ایشو/واپسی، اوور ڈیو ٹریکنگ۔" },
        { iconName: "Users", title: "ٹرانسپورٹ", desc: "روٹس، گاڑیاں، طلباء اسائنمنٹ، GPS-ریڈی۔" },
        { iconName: "Users", title: "ہاسٹل", desc: "عمارات، کمرے، بستر مختص، وارڈن انتظام۔" },
        { iconName: "ClipboardCheck", title: "انوینٹری", desc: "اسٹیشنری اور اثاثہ جات اسٹاک، دوبارہ آرڈر الرٹس۔" },
      ]},
      { title: "🔒 سیکیورٹی اور پیمانہ", items: [
        { iconName: "Shield", title: "دو عوامل تصدیق (2FA)", desc: "TOTP پر مبنی 2FA — Google Authenticator + ریکوری کوڈز۔" },
        { iconName: "Shield", title: "Row-Level Security", desc: "ہر اسکول کا ڈیٹا RLS سے الگ، کراس ٹیننٹ لیک ناممکن۔" },
        { iconName: "Smartphone", title: "آف لائن PWA", desc: "نیٹ کے بغیر حاضری اور مارکس — دوبارہ کنکشن پر آٹو سنک۔" },
        { iconName: "TrendingUp", title: "ریئل ٹائم لائیو ڈیش بورڈ", desc: "Supabase Realtime — ادائیگی/داخلہ ٹرگرز۔" },
        { iconName: "Sparkles", title: "AI ڈراپ آؤٹ رسک", desc: "حاضری + مارکس + فیس → رسک اسکور + AI تجویز۔" },
        { iconName: "Globe", title: "۴ زبانوں کی حمایت", desc: "بنگالی، انگریزی، اردو، عربی — RTL + ہجری + اردو ہندسے۔" },
      ]},
    ],
  },
  ar: {
    heroBadge: "المميزات",
    heroTitle: "كل ما تحتاجه،",
    heroAccent: "في مكان واحد",
    heroSubtitle: "من إدارة الطلاب إلى المدفوعات عبر الإنترنت، من تحليلات الذكاء الاصطناعي إلى وحدة المدرسة الدينية — لا حاجة إلى برامج طرف ثالث.",
    ctaTitle: "ابدأ اليوم",
    ctaSubtitle: "تجربة مجانية لمدة 15 يوم · بدون بطاقة ائتمان · وصول كامل",
    ctaPrimary: "ابدأ التجربة المجانية",
    ctaSecondary: "الأسعار",
    groups: [
      { title: "📚 الأكاديمي", items: [
        { iconName: "Users", title: "إدارة الطلاب", desc: "استيراد Excel، ربط ولي الأمر، النقل، الترقية، الصورة الشخصية." },
        { iconName: "Calendar", title: "الحضور بـ QR", desc: "الفصل كاملًا في دقيقتين. يتلقى الوالدان SMS فوريًا." },
        { iconName: "ScrollText", title: "الامتحانات والنتائج", desc: "GPA 5.0، ترتيب، شبكة إدخال درجات صديقة للوحة المفاتيح." },
        { iconName: "FileText", title: "الشهادات", desc: "إنشاء شهادات بناءً على قوالب، جاهزة للطباعة." },
        { iconName: "ClipboardCheck", title: "الواجبات", desc: "المعلمون ينشئون، الطلاب يسلمون، المعلمون يصححون." },
        { iconName: "Video", title: "الحصص عبر الإنترنت", desc: "Zoom, Google Meet, Teams — الانضمام مباشرة من البوابة." },
      ]},
      { title: "💰 المالية", items: [
        { iconName: "Wallet", title: "الدفع عبر الإنترنت", desc: "bKash، Nagad، Rocket، SSLCommerz — تحصيل رسوم مباشر." },
        { iconName: "TrendingUp", title: "تتبع الدخل والنفقات", desc: "24 بنودًا مُعدة مسبقًا + حملات تبرع." },
        { iconName: "Award", title: "إدارة المنح الدراسية", desc: "منح قائمة على الحاجة + الاستحقاق." },
        { iconName: "BarChart3", title: "10+ تقارير", desc: "تحصيل الرسوم، المستحقات، الأرباح والخسائر، الرواتب — PDF/Excel." },
      ]},
      { title: "📱 التواصل", items: [
        { iconName: "Megaphone", title: "SMS + WhatsApp + Push", desc: "إعلان واحد، 4 قنوات — SSL Wireless + Meta Cloud + FCM." },
        { iconName: "MessageCircle", title: "تذاكر الدعم", desc: "الوالدان يسألون، المسؤولون يردون — صندوق وارد مترابط." },
        { iconName: "Sparkles", title: "قوالب SMS بالذكاء الاصطناعي", desc: "تذكيرات الرسوم، الغياب — نسخ من إنشاء الذكاء الاصطناعي." },
      ]},
      { title: "🕌 المدرسة الدينية", items: [
        { iconName: "BookOpen", title: "خريطة حرارية للحفظ", desc: "30 جزءًا × طالب — تقدم الحفظ الكامل." },
        { iconName: "BookOpen", title: "منهج الكتاب", desc: "6 مراحل — الابتدائي إلى التكميل." },
        { iconName: "Calendar", title: "السبق والسبقي والمنزل اليومي", desc: "تتبع كل يوم — شبكة 10 أعمدة." },
        { iconName: "Globe", title: "التواريخ الهجرية + RTL", desc: "التقويم الإسلامي + دعم RTL كامل." },
      ]},
      { title: "🏢 التشغيلي", items: [
        { iconName: "BookOpen", title: "المكتبة", desc: "كتالوج الكتب، الإصدار/الإرجاع، تتبع المتأخرات." },
        { iconName: "Users", title: "النقل", desc: "مسارات، مركبات، تعيين الطلاب، جاهز لـ GPS." },
        { iconName: "Users", title: "السكن", desc: "المباني، الغرف، تخصيص الأسرة، إدارة المشرفين." },
        { iconName: "ClipboardCheck", title: "المخزون", desc: "حركة مخزون القرطاسية والأصول، تنبيهات إعادة الطلب." },
      ]},
      { title: "🔒 الأمان والحجم", items: [
        { iconName: "Shield", title: "المصادقة الثنائية (2FA)", desc: "2FA قائم على TOTP — Google Authenticator + رموز الاسترداد." },
        { iconName: "Shield", title: "Row-Level Security", desc: "بيانات كل مدرسة معزولة بواسطة RLS." },
        { iconName: "Smartphone", title: "PWA غير متصل", desc: "الحضور والدرجات بدون إنترنت — مزامنة تلقائية." },
        { iconName: "TrendingUp", title: "لوحة حية في الوقت الفعلي", desc: "Supabase Realtime — تحديث تلقائي." },
        { iconName: "Sparkles", title: "مخاطر التسرب بالذكاء الاصطناعي", desc: "الحضور + الدرجات + الرسوم → درجة المخاطر + اقتراح الذكاء الاصطناعي." },
        { iconName: "Globe", title: "دعم 4 لغات", desc: "البنغالية، الإنجليزية، الأردية، العربية — RTL + هجري + أرقام بنغالية." },
      ]},
    ],
  },
};

// ─── /about ──────────────────────────────────────────────────────────────

export type AboutPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  missionTitle: string;
  missionBody: string;
  valuesTitle: string;
  values: Array<{ title: string; desc: string }>;
  whyTitle: string;
  problemLabel: string;
  problemBody: string;
  solutionLabel: string;
  solutionBody: string;
  stats: Array<{ value: string; label: string }>;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const aboutPage: Record<Locale, AboutPageCopy> = {
  bn: {
    heroBadge: "আমাদের গল্প",
    heroTitle: "বাংলাদেশের জন্য তৈরি,",
    heroAccent: "বাংলাদেশের মানুষদের দ্বারা",
    heroSubtitle: "Muhius Sunnah-এর যাত্রা শুরু একটি সহজ প্রশ্ন দিয়ে — কেন আমাদের প্রতিষ্ঠানগুলোর জন্য বিদেশি software-ই একমাত্র বিকল্প?",
    missionTitle: "আমাদের মিশন",
    missionBody: "বাংলাদেশের প্রত্যেক মাদ্রাসা ও স্কুলে আধুনিক প্রযুক্তি পৌঁছে দেয়া — সাশ্রয়ী মূল্যে, বাংলা ভাষায়, স্থানীয় context-এ।",
    valuesTitle: "আমাদের মূল্যবোধ",
    values: [
      { title: "সাশ্রয়ী মূল্য", desc: "ছোট প্রতিষ্ঠানও যেন ব্যবহার করতে পারে — তাই Lifetime ৫,০০০ টাকার প্ল্যান।" },
      { title: "স্থানীয় সহযোগিতা", desc: "আমাদের team পুরোপুরি বাংলাদেশে। বাংলা সাপোর্ট, বাংলাদেশি context।" },
      { title: "গতি ও উদ্ভাবন", desc: "নতুন feature দ্রুত — আপনার প্রয়োজন ২ সপ্তাহে বাস্তবায়ন।" },
    ],
    whyTitle: "কেন Muhius Sunnah?",
    problemLabel: "❌ সমস্যা",
    problemBody: "বাংলাদেশের বেশিরভাগ মাদ্রাসা ও স্কুল এখনো কাগজে-কলমে চলে। পুরাতন সফটওয়্যারগুলোতে অনলাইন পেমেন্ট নেই, মাদ্রাসা-specific feature নেই, সাপোর্ট ধীর।",
    solutionLabel: "✅ আমাদের সমাধান",
    solutionBody: "আধুনিক tech stack (Next.js 16, Supabase, AI) — কিন্তু UI বাংলায়, workflow বাংলাদেশি, pricing সাশ্রয়ী। হিফজ/কিতাব/সবক module, bKash/Nagad, অফলাইন mode।",
    stats: [
      { value: "২০২৬", label: "প্রতিষ্ঠিত" },
      { value: "১২০+", label: "প্রতিষ্ঠান" },
      { value: "৫০,০০০+", label: "শিক্ষার্থী" },
      { value: "৪", label: "ভাষা" },
    ],
    ctaTitle: "আমাদের journey-এ যোগ দিন",
    ctaSubtitle: "আপনার প্রতিষ্ঠানকে আধুনিকীকরণে আমরা সাথে আছি।",
    ctaPrimary: "ফ্রি ট্রায়াল শুরু করুন",
    ctaSecondary: "আমাদের সাথে যোগাযোগ",
  },
  en: {
    heroBadge: "Our Story",
    heroTitle: "Built for Bangladesh,",
    heroAccent: "by the people of Bangladesh",
    heroSubtitle: "Muhius Sunnah's journey started with a simple question — why must foreign software be our only option?",
    missionTitle: "Our Mission",
    missionBody: "Bring modern technology to every madrasa and school in Bangladesh — affordably, in Bangla, in local context.",
    valuesTitle: "Our Values",
    values: [
      { title: "Affordable", desc: "Small institutions can use it too — hence the ৳5,000 Lifetime plan." },
      { title: "Local First", desc: "Our team is entirely in Bangladesh. Bangla support, Bangladeshi context." },
      { title: "Speed & Innovation", desc: "New features fast — your need built in 2 weeks." },
    ],
    whyTitle: "Why Muhius Sunnah?",
    problemLabel: "❌ Problem",
    problemBody: "Most madrasas and schools in Bangladesh still run on paper. Old software lacks online payments, has no madrasa-specific features, and offers slow support.",
    solutionLabel: "✅ Our Solution",
    solutionBody: "Modern tech stack (Next.js 16, Supabase, AI) — but UI in Bangla, workflow Bangladeshi, pricing affordable. Hifz/Kitab/Sabaq modules, bKash/Nagad, offline mode.",
    stats: [
      { value: "2026", label: "Founded" },
      { value: "120+", label: "Institutions" },
      { value: "50,000+", label: "Students" },
      { value: "4", label: "Languages" },
    ],
    ctaTitle: "Join our journey",
    ctaSubtitle: "We're here to modernize your institution.",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Contact Us",
  },
  ur: {
    heroBadge: "ہماری کہانی",
    heroTitle: "بنگلہ دیش کے لیے بنایا،",
    heroAccent: "بنگلہ دیش کے لوگوں نے",
    heroSubtitle: "Muhius Sunnah کا سفر ایک سادہ سوال سے شروع ہوا — ہمارے اداروں کے لیے غیر ملکی سافٹ ویئر ہی واحد انتخاب کیوں؟",
    missionTitle: "ہمارا مشن",
    missionBody: "بنگلہ دیش کے ہر مدرسے اور اسکول میں جدید ٹیکنالوجی لے کر آنا — سستی، اردو میں، مقامی تناظر میں۔",
    valuesTitle: "ہماری اقدار",
    values: [
      { title: "سستا", desc: "چھوٹے ادارے بھی استعمال کر سکیں — اس لیے ۵،۰۰۰ روپے کا Lifetime پلان۔" },
      { title: "مقامی پہلے", desc: "ہماری ٹیم مکمل طور پر بنگلہ دیش میں ہے۔" },
      { title: "رفتار اور جدت", desc: "نئی خصوصیات تیزی سے — ۲ ہفتوں میں۔" },
    ],
    whyTitle: "Muhius Sunnah کیوں؟",
    problemLabel: "❌ مسئلہ",
    problemBody: "زیادہ تر مدارس اور اسکول اب بھی کاغذ پر چلتے ہیں۔ پرانے سافٹ ویئر میں آن لائن ادائیگی نہیں، مدرسہ کے خصوصی خصوصیات نہیں، سست سپورٹ۔",
    solutionLabel: "✅ ہمارا حل",
    solutionBody: "جدید ٹیک اسٹیک، لیکن UI اردو میں، سستی قیمت۔ حفظ/کتاب/سبق ماڈیول، bKash/Nagad، آف لائن موڈ۔",
    stats: [
      { value: "۲۰۲۶", label: "قائم" },
      { value: "۱۲۰+", label: "ادارے" },
      { value: "۵۰،۰۰۰+", label: "طلباء" },
      { value: "۴", label: "زبانیں" },
    ],
    ctaTitle: "ہمارے سفر میں شامل ہوں",
    ctaSubtitle: "ہم آپ کے ادارے کو جدید بنانے کے لیے ہیں۔",
    ctaPrimary: "مفت آزمائش شروع کریں",
    ctaSecondary: "ہم سے رابطہ کریں",
  },
  ar: {
    heroBadge: "قصتنا",
    heroTitle: "صُنع لبنغلاديش،",
    heroAccent: "من قبل شعب بنغلاديش",
    heroSubtitle: "بدأت رحلة Muhius Sunnah بسؤال بسيط — لماذا يجب أن تكون البرامج الأجنبية خيارنا الوحيد؟",
    missionTitle: "مهمتنا",
    missionBody: "جلب التكنولوجيا الحديثة إلى كل مدرسة دينية ومدرسة في بنغلاديش — بأسعار معقولة، بلغة البنغالية، في السياق المحلي.",
    valuesTitle: "قيمنا",
    values: [
      { title: "سعر معقول", desc: "المؤسسات الصغيرة يمكنها استخدامه أيضًا — لذا خطة Lifetime بـ 5,000 تاكا." },
      { title: "المحلي أولاً", desc: "فريقنا بالكامل في بنغلاديش. دعم بالبنغالية، سياق بنغالي." },
      { title: "السرعة والابتكار", desc: "ميزات جديدة بسرعة — احتياجك مبني في أسبوعين." },
    ],
    whyTitle: "لماذا Muhius Sunnah؟",
    problemLabel: "❌ المشكلة",
    problemBody: "معظم المدارس الدينية والمدارس في بنغلاديش لا تزال تعمل على الورق. البرامج القديمة تفتقر إلى الدفع عبر الإنترنت.",
    solutionLabel: "✅ حلنا",
    solutionBody: "تقنية حديثة مع واجهة بالبنغالية، سير عمل بنغالي، أسعار معقولة. وحدات الحفظ/الكتاب/السبق، bKash/Nagad، الوضع غير المتصل.",
    stats: [
      { value: "2026", label: "تأسست" },
      { value: "120+", label: "مؤسسات" },
      { value: "50,000+", label: "طلاب" },
      { value: "4", label: "لغات" },
    ],
    ctaTitle: "انضم إلى رحلتنا",
    ctaSubtitle: "نحن هنا لتحديث مؤسستك.",
    ctaPrimary: "ابدأ التجربة المجانية",
    ctaSecondary: "اتصل بنا",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────

export function getFeaturesPageCopy(locale: Locale): FeaturesPageCopy {
  return featuresPage[locale] ?? featuresPage.bn;
}

export function getAboutPageCopy(locale: Locale): AboutPageCopy {
  return aboutPage[locale] ?? aboutPage.bn;
}

// ─── /support ────────────────────────────────────────────────────────────

export type SupportPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  channels: Array<{ icon: "Video" | "Phone" | "MessageCircle" | "BookOpen"; accent: string; title: string; desc: string; cta: string; href: string; badge: string }>;
  demoBadge: string;
  demoTitle: string;
  demoAccent: string;
  demoBody: string;
  demoBookCta: string;
  demoContactCta: string;
  contactMoreTitle: string;
  contactCards: Array<{ icon: "Mail" | "Phone" | "Clock"; label: string; value: string; href: string }>;
  slaTitle: string;
  slaSubtitle: string;
  slaHeaders: string[];
  slaRows: Array<{ plan: string; email: string; whatsapp: string; phone: string; demo: string }>;
};

const supportPage: Record<Locale, SupportPageCopy> = {
  bn: {
    heroBadge: "সাপোর্ট সেন্টার",
    heroTitle: "আমরা আপনার সাথে",
    heroAccent: "সবসময় আছি",
    heroSubtitle: "Video টিউটোরিয়াল, live call, WhatsApp — যে চ্যানেলে সুবিধা, সেখানেই সাপোর্ট পান। বাংলায়, ২৪/৭।",
    channels: [
      { icon: "Video", accent: "from-[#FF0000] to-[#cc0000]", title: "Video Tutorial Library", desc: "১০০+ বাংলা video tutorial — setup থেকে advanced features পর্যন্ত সব।", cta: "Tutorials দেখুন", href: "#", badge: "১০০+ videos" },
      { icon: "Phone", accent: "from-primary to-accent", title: "Live ফোন কল", desc: "সরাসরি আমাদের সাপোর্ট engineer-এর সাথে কথা বলুন। Scale plan-এ ২৪/৭।", cta: "ফোন করুন", href: "tel:+8801767682381", badge: "২৪/৭ (Scale plan)" },
      { icon: "MessageCircle", accent: "from-[#25D366] to-[#128C7E]", title: "WhatsApp চ্যাট", desc: "আপনার প্রশ্ন WhatsApp-এ পাঠান, গড়ে ১৫ মিনিটে reply।", cta: "WhatsApp-এ Chat", href: "https://wa.me/8801767682381", badge: "১৫ মিনিট avg response" },
      { icon: "BookOpen", accent: "from-accent to-secondary", title: "Help Center & Docs", desc: "Self-service documentation — ২০০+ article, FAQ, troubleshooting guides।", cta: "ডকুমেন্টেশন দেখুন", href: "#", badge: "২০০+ articles" },
    ],
    demoBadge: "Featured",
    demoTitle: "একটি",
    demoAccent: "Live Demo",
    demoBody: "আমাদের expert-এর সাথে ৩০ মিনিটের personalized demo। আপনার প্রতিষ্ঠানের exact চাহিদা অনুযায়ী সফটওয়্যার walk-through। ফ্রি, কোন obligation নেই।",
    demoBookCta: "ফ্রি Demo Book",
    demoContactCta: "Contact Form",
    contactMoreTitle: "আরও যোগাযোগের উপায়",
    contactCards: [
      { icon: "Mail", label: "Email সাপোর্ট", value: "itsinjamul@gmail.com", href: "mailto:itsinjamul@gmail.com" },
      { icon: "Phone", label: "Hotline", value: "+880 1767-682381", href: "tel:+8801767682381" },
      { icon: "Clock", label: "সাপোর্ট সময়", value: "সকাল ৯টা - রাত ৯টা", href: "#" },
    ],
    slaTitle: "Response Time (SLA)",
    slaSubtitle: "আপনার plan অনুযায়ী সাপোর্ট response",
    slaHeaders: ["Plan", "Email", "WhatsApp", "Phone", "Live Demo"],
    slaRows: [
      { plan: "Lifetime Basic", email: "৪৮ ঘণ্টা", whatsapp: "—", phone: "—", demo: "একবার" },
      { plan: "Starter", email: "২৪ ঘণ্টা", whatsapp: "—", phone: "—", demo: "✓" },
      { plan: "Growth", email: "৮ ঘণ্টা", whatsapp: "১৫ মিনিট", phone: "Office hours", demo: "✓" },
      { plan: "Scale", email: "৪ ঘণ্টা", whatsapp: "ইনস্ট্যান্ট", phone: "২৪/৭", demo: "unlimited" },
    ],
  },
  en: {
    heroBadge: "Support Center",
    heroTitle: "We're with you",
    heroAccent: "every step of the way",
    heroSubtitle: "Video tutorials, live calls, WhatsApp — support on whatever channel suits you. In Bangla, 24/7.",
    channels: [
      { icon: "Video", accent: "from-[#FF0000] to-[#cc0000]", title: "Video Tutorial Library", desc: "100+ Bangla video tutorials — from setup to advanced features.", cta: "Watch Tutorials", href: "#", badge: "100+ videos" },
      { icon: "Phone", accent: "from-primary to-accent", title: "Live Phone Call", desc: "Talk directly to our support engineer. 24/7 on the Scale plan.", cta: "Call Us", href: "tel:+8801767682381", badge: "24/7 (Scale plan)" },
      { icon: "MessageCircle", accent: "from-[#25D366] to-[#128C7E]", title: "WhatsApp Chat", desc: "Send your question on WhatsApp, average reply in 15 minutes.", cta: "Chat on WhatsApp", href: "https://wa.me/8801767682381", badge: "15 min avg response" },
      { icon: "BookOpen", accent: "from-accent to-secondary", title: "Help Center & Docs", desc: "Self-service documentation — 200+ articles, FAQ, troubleshooting guides.", cta: "View Documentation", href: "#", badge: "200+ articles" },
    ],
    demoBadge: "Featured",
    demoTitle: "Book a",
    demoAccent: "Live Demo",
    demoBody: "30-minute personalized demo with our expert. Walkthrough tailored to your institution's exact needs. Free, no obligation.",
    demoBookCta: "Book Free Demo",
    demoContactCta: "Contact Form",
    contactMoreTitle: "Other ways to reach us",
    contactCards: [
      { icon: "Mail", label: "Email Support", value: "itsinjamul@gmail.com", href: "mailto:itsinjamul@gmail.com" },
      { icon: "Phone", label: "Hotline", value: "+880 1767-682381", href: "tel:+8801767682381" },
      { icon: "Clock", label: "Support Hours", value: "9 AM - 9 PM", href: "#" },
    ],
    slaTitle: "Response Time (SLA)",
    slaSubtitle: "Support response based on your plan",
    slaHeaders: ["Plan", "Email", "WhatsApp", "Phone", "Live Demo"],
    slaRows: [
      { plan: "Lifetime Basic", email: "48 hours", whatsapp: "—", phone: "—", demo: "Once" },
      { plan: "Starter", email: "24 hours", whatsapp: "—", phone: "—", demo: "✓" },
      { plan: "Growth", email: "8 hours", whatsapp: "15 min", phone: "Office hours", demo: "✓" },
      { plan: "Scale", email: "4 hours", whatsapp: "Instant", phone: "24/7", demo: "unlimited" },
    ],
  },
  ur: {
    heroBadge: "سپورٹ سینٹر",
    heroTitle: "ہم آپ کے ساتھ ہیں",
    heroAccent: "ہر قدم پر",
    heroSubtitle: "ویڈیو ٹیوٹوریل، لائیو کال، WhatsApp — جس چینل پر آسانی ہو۔ اردو میں، ۲۴/۷۔",
    channels: [
      { icon: "Video", accent: "from-[#FF0000] to-[#cc0000]", title: "ویڈیو ٹیوٹوریل لائبریری", desc: "۱۰۰+ ویڈیو — سیٹ اپ سے ایڈوانس خصوصیات تک۔", cta: "ٹیوٹوریل دیکھیں", href: "#", badge: "۱۰۰+ ویڈیوز" },
      { icon: "Phone", accent: "from-primary to-accent", title: "لائیو فون کال", desc: "ہمارے سپورٹ انجینئر سے براہ راست بات کریں۔", cta: "فون کریں", href: "tel:+8801767682381", badge: "۲۴/۷ (Scale)" },
      { icon: "MessageCircle", accent: "from-[#25D366] to-[#128C7E]", title: "WhatsApp چیٹ", desc: "WhatsApp پر سوال بھیجیں، اوسطاً ۱۵ منٹ میں جواب۔", cta: "WhatsApp پر چیٹ", href: "https://wa.me/8801767682381", badge: "۱۵ منٹ اوسط" },
      { icon: "BookOpen", accent: "from-accent to-secondary", title: "ہیلپ سینٹر اور ڈاکس", desc: "سیلف سروس دستاویزات — ۲۰۰+ مضامین۔", cta: "دستاویزات دیکھیں", href: "#", badge: "۲۰۰+ مضامین" },
    ],
    demoBadge: "Featured",
    demoTitle: "ایک",
    demoAccent: "Live Demo",
    demoBody: "ہمارے ماہر کے ساتھ ۳۰ منٹ کا ذاتی ڈیمو۔ مفت، کوئی ذمہ داری نہیں۔",
    demoBookCta: "مفت ڈیمو بک کریں",
    demoContactCta: "رابطہ فارم",
    contactMoreTitle: "رابطے کے مزید طریقے",
    contactCards: [
      { icon: "Mail", label: "ای میل سپورٹ", value: "itsinjamul@gmail.com", href: "mailto:itsinjamul@gmail.com" },
      { icon: "Phone", label: "ہاٹ لائن", value: "+880 1767-682381", href: "tel:+8801767682381" },
      { icon: "Clock", label: "سپورٹ اوقات", value: "صبح ۹ تا رات ۹", href: "#" },
    ],
    slaTitle: "Response Time (SLA)",
    slaSubtitle: "آپ کے پلان کے مطابق سپورٹ جواب",
    slaHeaders: ["Plan", "Email", "WhatsApp", "Phone", "Live Demo"],
    slaRows: [
      { plan: "Lifetime Basic", email: "۴۸ گھنٹے", whatsapp: "—", phone: "—", demo: "ایک بار" },
      { plan: "Starter", email: "۲۴ گھنٹے", whatsapp: "—", phone: "—", demo: "✓" },
      { plan: "Growth", email: "۸ گھنٹے", whatsapp: "۱۵ منٹ", phone: "دفتری اوقات", demo: "✓" },
      { plan: "Scale", email: "۴ گھنٹے", whatsapp: "فوری", phone: "۲۴/۷", demo: "لامحدود" },
    ],
  },
  ar: {
    heroBadge: "مركز الدعم",
    heroTitle: "نحن معك",
    heroAccent: "في كل خطوة",
    heroSubtitle: "دروس فيديو، مكالمات حية، WhatsApp — الدعم في أي قناة تناسبك. على مدار الساعة.",
    channels: [
      { icon: "Video", accent: "from-[#FF0000] to-[#cc0000]", title: "مكتبة الفيديو التعليمية", desc: "100+ فيديو تعليمي — من الإعداد إلى الميزات المتقدمة.", cta: "شاهد الدروس", href: "#", badge: "100+ فيديو" },
      { icon: "Phone", accent: "from-primary to-accent", title: "مكالمة هاتفية مباشرة", desc: "تحدث مباشرة إلى مهندس الدعم لدينا. 24/7 في خطة Scale.", cta: "اتصل بنا", href: "tel:+8801767682381", badge: "24/7 (Scale)" },
      { icon: "MessageCircle", accent: "from-[#25D366] to-[#128C7E]", title: "دردشة WhatsApp", desc: "أرسل سؤالك على WhatsApp، متوسط الرد 15 دقيقة.", cta: "الدردشة على WhatsApp", href: "https://wa.me/8801767682381", badge: "15 دقيقة متوسط" },
      { icon: "BookOpen", accent: "from-accent to-secondary", title: "مركز المساعدة والمستندات", desc: "وثائق الخدمة الذاتية — 200+ مقالة، أسئلة شائعة، دلائل.", cta: "عرض الوثائق", href: "#", badge: "200+ مقالة" },
    ],
    demoBadge: "مميز",
    demoTitle: "احجز",
    demoAccent: "عرضًا توضيحيًا مباشرًا",
    demoBody: "عرض توضيحي شخصي لمدة 30 دقيقة مع خبيرنا. مجاني، دون التزام.",
    demoBookCta: "احجز عرضًا مجانيًا",
    demoContactCta: "نموذج الاتصال",
    contactMoreTitle: "طرق أخرى للتواصل",
    contactCards: [
      { icon: "Mail", label: "دعم البريد الإلكتروني", value: "itsinjamul@gmail.com", href: "mailto:itsinjamul@gmail.com" },
      { icon: "Phone", label: "الخط الساخن", value: "+880 1767-682381", href: "tel:+8801767682381" },
      { icon: "Clock", label: "ساعات الدعم", value: "9 صباحًا - 9 مساءً", href: "#" },
    ],
    slaTitle: "Response Time (SLA)",
    slaSubtitle: "استجابة الدعم حسب خطتك",
    slaHeaders: ["Plan", "Email", "WhatsApp", "Phone", "Live Demo"],
    slaRows: [
      { plan: "Lifetime Basic", email: "48 ساعة", whatsapp: "—", phone: "—", demo: "مرة" },
      { plan: "Starter", email: "24 ساعة", whatsapp: "—", phone: "—", demo: "✓" },
      { plan: "Growth", email: "8 ساعات", whatsapp: "15 دقيقة", phone: "ساعات العمل", demo: "✓" },
      { plan: "Scale", email: "4 ساعات", whatsapp: "فوري", phone: "24/7", demo: "غير محدود" },
    ],
  },
};

export function getSupportPageCopy(locale: Locale): SupportPageCopy {
  return supportPage[locale] ?? supportPage.bn;
}

// ─── /refund-policy ──────────────────────────────────────────────────────

export type RefundPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  guaranteedLabel: string;
  satisfactionLabel: string;
  guaranteeTitle: string;
  guaranteeTitleAccent: string;
  guaranteeBody: string;
  guaranteeBodyBold: string;
  stepsTitle: string;
  stepsSubtitle: string;
  steps: Array<{ step: string; title: string; desc: string }>;
  coveredTitle: string;
  coveredItems: string[];
  conditionsTitle: string;
  conditionsItems: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const refundPage: Record<Locale, RefundPageCopy> = {
  bn: {
    heroBadge: "Refund Policy",
    heroTitle: "৩০ দিনের",
    heroAccent: "Full Money-Back Guarantee",
    heroSubtitle: "No Questions Asked. আপনি যদি কোনো কারণে সন্তুষ্ট না হন, ৩০ দিনের মধ্যে ১০০% টাকা ফেরত পাবেন।",
    guaranteedLabel: "GUARANTEED",
    satisfactionLabel: "100% Satisfaction",
    guaranteeTitle: "কোন সন্তুষ্টি নেই?",
    guaranteeTitleAccent: "টাকা ফেরত।",
    guaranteeBody: "আমরা আমাদের সফটওয়্যারের মানের উপর সম্পূর্ণ আত্মবিশ্বাসী। যদি কোনো কারণে আপনি সন্তুষ্ট না হন, কেনাকাটার ৩০ দিনের মধ্যে ইমেইল/WhatsApp করুন — আমরা",
    guaranteeBodyBold: "পূর্ণ টাকা ফেরত দেব। কোনো প্রশ্ন করা হবে না।",
    stepsTitle: "Refund কিভাবে পাবেন?",
    stepsSubtitle: "মাত্র ৩ ধাপে",
    steps: [
      { step: "১", title: "যোগাযোগ করুন", desc: "itsinjamul@gmail.com-এ ইমেইল পাঠান অথবা WhatsApp-এ message দিন। আপনার purchase invoice number mention করুন।" },
      { step: "২", title: "২৪ ঘণ্টায় reply", desc: "আমাদের support team ২৪ ঘণ্টার মধ্যে আপনাকে যোগাযোগ করে refund process শুরু করবে।" },
      { step: "৩", title: "৩-৭ দিনে টাকা ফেরত", desc: "আপনার পেমেন্ট method-এ (bKash/Nagad/bank) ৩-৭ কর্মদিবসে টাকা জমা হবে।" },
    ],
    coveredTitle: "যা Cover করা হয়",
    coveredItems: [
      "৩০ দিনের মধ্যে যে কোনো সাবস্ক্রিপশন plan",
      "Lifetime Basic plan (৩০ দিন পর্যন্ত)",
      "Technical issue, software bug — instant refund",
      "যদি আপনার প্রত্যাশা পূরণ না হয়",
      "কোনো কারণ ছাড়াই — No Questions Asked",
    ],
    conditionsTitle: "শর্ত",
    conditionsItems: [
      "কেনাকাটার তারিখ থেকে ৩০ দিন সময়সীমা",
      "Purchase invoice / transaction ID লাগবে",
      "SMS credit-এ টাকা খরচ হলে সেটা বাদ পড়বে",
      "Custom development / migration fee non-refundable",
      "Refund শুধু original পেমেন্ট method-এ যাবে",
    ],
    ctaTitle: "ঝুঁকি ছাড়া Try করুন",
    ctaSubtitle: "১৫ দিন ফ্রি ট্রায়াল + ৩০ দিন refund গ্যারান্টি = মোট ৪৫ দিন সম্পূর্ণ নিরাপদ",
    ctaPrimary: "ফ্রি ট্রায়াল শুরু",
    ctaSecondary: "সাপোর্ট টিমের সাথে কথা",
  },
  en: {
    heroBadge: "Refund Policy",
    heroTitle: "30-day",
    heroAccent: "Full Money-Back Guarantee",
    heroSubtitle: "No Questions Asked. If you're not satisfied for any reason, get 100% back within 30 days.",
    guaranteedLabel: "GUARANTEED",
    satisfactionLabel: "100% Satisfaction",
    guaranteeTitle: "Not satisfied?",
    guaranteeTitleAccent: "Money back.",
    guaranteeBody: "We're fully confident in the quality of our software. If for any reason you're not satisfied, email/WhatsApp us within 30 days of purchase — we'll",
    guaranteeBodyBold: "return your full payment. No questions asked.",
    stepsTitle: "How to get a refund?",
    stepsSubtitle: "Just 3 steps",
    steps: [
      { step: "1", title: "Contact Us", desc: "Email itsinjamul@gmail.com or send a WhatsApp message. Include your purchase invoice number." },
      { step: "2", title: "Reply in 24 hours", desc: "Our support team will contact you within 24 hours and start the refund process." },
      { step: "3", title: "3-7 days to refund", desc: "Amount deposited to your payment method (bKash/Nagad/bank) within 3-7 business days." },
    ],
    coveredTitle: "What's Covered",
    coveredItems: [
      "Any subscription plan within 30 days",
      "Lifetime Basic plan (up to 30 days)",
      "Technical issue, software bug — instant refund",
      "If your expectations aren't met",
      "No reason needed — No Questions Asked",
    ],
    conditionsTitle: "Conditions",
    conditionsItems: [
      "30-day window from purchase date",
      "Purchase invoice / transaction ID required",
      "SMS credits spent will be deducted",
      "Custom development / migration fees non-refundable",
      "Refunds only to original payment method",
    ],
    ctaTitle: "Try Without Risk",
    ctaSubtitle: "15-day free trial + 30-day refund guarantee = 45 days fully safe",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Talk to Support",
  },
  ur: {
    heroBadge: "Refund Policy",
    heroTitle: "۳۰ دن کی",
    heroAccent: "مکمل رقم واپسی کی ضمانت",
    heroSubtitle: "No Questions Asked. اگر آپ کسی بھی وجہ سے مطمئن نہیں ہیں، ۳۰ دن میں ۱۰۰٪ واپس حاصل کریں۔",
    guaranteedLabel: "GUARANTEED",
    satisfactionLabel: "100% اطمینان",
    guaranteeTitle: "مطمئن نہیں؟",
    guaranteeTitleAccent: "رقم واپس۔",
    guaranteeBody: "ہم اپنے سافٹ ویئر کے معیار پر مکمل پر اعتماد ہیں۔ خریداری کے ۳۰ دن کے اندر ای میل/WhatsApp کریں — ہم",
    guaranteeBodyBold: "مکمل رقم واپس کریں گے۔ کوئی سوال نہیں۔",
    stepsTitle: "Refund کیسے ملے گا؟",
    stepsSubtitle: "صرف ۳ مراحل میں",
    steps: [
      { step: "۱", title: "رابطہ کریں", desc: "itsinjamul@gmail.com پر ای میل یا WhatsApp پر پیغام۔ انوائس نمبر شامل کریں۔" },
      { step: "۲", title: "۲۴ گھنٹوں میں جواب", desc: "ہماری سپورٹ ٹیم ۲۴ گھنٹوں میں رابطہ کرے گی۔" },
      { step: "۳", title: "۳-۷ دن میں رقم واپس", desc: "آپ کے پے منٹ طریقہ پر ۳-۷ کاروباری دنوں میں رقم جمع۔" },
    ],
    coveredTitle: "کیا کور کیا جاتا ہے",
    coveredItems: [
      "۳۰ دن کے اندر کوئی بھی سبسکرپشن پلان",
      "Lifetime Basic (۳۰ دن تک)",
      "تکنیکی مسئلہ، سافٹ ویئر bug — فوری refund",
      "اگر آپ کی توقعات پوری نہ ہوں",
      "بغیر کسی وجہ — No Questions Asked",
    ],
    conditionsTitle: "شرائط",
    conditionsItems: [
      "خریداری کی تاریخ سے ۳۰ دن",
      "انوائس / لین دین ID درکار",
      "خرچ شدہ SMS کریڈٹ کٹوتی ہوگی",
      "کسٹم ڈویلپمنٹ / مائیگریشن فیس ناقابل واپسی",
      "Refund صرف اصل ادائیگی طریقہ پر",
    ],
    ctaTitle: "بغیر خطرے کے آزمائیں",
    ctaSubtitle: "۱۵ دن مفت + ۳۰ دن refund ضمانت = ۴۵ دن مکمل محفوظ",
    ctaPrimary: "مفت آزمائش شروع",
    ctaSecondary: "سپورٹ سے بات کریں",
  },
  ar: {
    heroBadge: "Refund Policy",
    heroTitle: "30 يومًا",
    heroAccent: "ضمان استرداد كامل",
    heroSubtitle: "بدون أسئلة. إذا لم تكن راضيًا لأي سبب، استرد 100٪ خلال 30 يومًا.",
    guaranteedLabel: "GUARANTEED",
    satisfactionLabel: "رضا 100٪",
    guaranteeTitle: "غير راضٍ؟",
    guaranteeTitleAccent: "استرد المال.",
    guaranteeBody: "نحن واثقون تمامًا من جودة برنامجنا. إذا لم تكن راضيًا، راسلنا عبر البريد/WhatsApp خلال 30 يومًا —",
    guaranteeBodyBold: "سنعيد كامل المبلغ. بدون أسئلة.",
    stepsTitle: "كيف تسترد المال؟",
    stepsSubtitle: "3 خطوات فقط",
    steps: [
      { step: "1", title: "اتصل بنا", desc: "أرسل بريدًا إلى itsinjamul@gmail.com أو WhatsApp. أضف رقم الفاتورة." },
      { step: "2", title: "رد خلال 24 ساعة", desc: "فريق الدعم لدينا سيتواصل معك خلال 24 ساعة." },
      { step: "3", title: "3-7 أيام للاسترداد", desc: "المبلغ يودع في طريقة الدفع خلال 3-7 أيام عمل." },
    ],
    coveredTitle: "ما هو مغطى",
    coveredItems: [
      "أي خطة اشتراك خلال 30 يومًا",
      "خطة Lifetime Basic (حتى 30 يومًا)",
      "مشكلة تقنية، خطأ برمجي — استرداد فوري",
      "إذا لم تتحقق توقعاتك",
      "بدون سبب — بدون أسئلة",
    ],
    conditionsTitle: "الشروط",
    conditionsItems: [
      "30 يومًا من تاريخ الشراء",
      "يلزم رقم الفاتورة / معاملة",
      "أرصدة SMS المستخدمة ستُخصم",
      "رسوم التطوير المخصص / الترحيل غير قابلة للاسترداد",
      "الاسترداد فقط إلى طريقة الدفع الأصلية",
    ],
    ctaTitle: "جرب بدون مخاطر",
    ctaSubtitle: "15 يومًا مجانية + 30 يومًا ضمان استرداد = 45 يومًا آمنة",
    ctaPrimary: "ابدأ التجربة المجانية",
    ctaSecondary: "تحدث مع الدعم",
  },
};

export function getRefundPageCopy(locale: Locale): RefundPageCopy {
  return refundPage[locale] ?? refundPage.bn;
}

// ─── /pricing/[slug] — shared chrome ─────────────────────────────────────

export type PackageDetailChromeCopy = {
  backToAll: string;
  packageSuffix: string; // appended after the plan name in the h1 (e.g. "প্যাকেজ" / "Plan")
  whoFor: string;
  bestValue: string;
  lifetimeBadge: string;
  payOnce: string; // after the price when priceUnit === "once"
  perMonth: string; // after the price when priceUnit === "month"
  buyCta: string;
  whatsappCta: string;
  hugeSaving: string;
  savingsCompareHeading: string; // "অন্য প্যাকেজের তুলনায় সাশ্রয়"
  savings: string; // "সাশ্রয়" suffix on % chip
  perYear: string;
  perYearSuffix: string; // "/year" on the comparison row
  notIncludedTitle: string; // plain text portion of the "not in this plan" heading
  notIncludedTitleEm: string; // emphasized word within the heading (rendered inside <em>)
  notIncludedFooterBefore: string; // "উপরের feature গুলো পেতে "
  notIncludedFooterLink: string;  // "উচ্চতর package"
  notIncludedFooterAfter: string; // " বেছে নিন।"
  ctaStart: string; // e.g. "{name} দিয়ে আজই শুরু" — the full sentence minus the name token. We'll build via `${name} ${ctaStart}`.
  ctaSubtitle: string; // "১৫ দিন ফ্রি ট্রায়াল + ৩০ দিন refund গ্যারান্টি"
  ctaPrimary: string; // "ফ্রি ট্রায়াল শুরু"
  ctaSecondary: string; // "অন্য প্যাকেজ তুলনা করুন"
};

const packageDetailChrome: Record<Locale, PackageDetailChromeCopy> = {
  bn: {
    backToAll: "সকল প্যাকেজ দেখুন",
    packageSuffix: "প্যাকেজ",
    whoFor: "কাদের জন্য?",
    bestValue: "সেরা মূল্য",
    lifetimeBadge: "✨ LIFETIME",
    payOnce: "একবার পরিশোধ",
    perMonth: "/মাস",
    buyCta: "এই প্যাকেজ কিনুন",
    whatsappCta: "WhatsApp-এ জিজ্ঞাসা",
    hugeSaving: "💰 HUGE SAVING",
    savingsCompareHeading: "অন্য প্যাকেজের তুলনায় সাশ্রয়",
    savings: "সাশ্রয়",
    perYear: "per year",
    perYearSuffix: "/year",
    notIncludedTitle: "এই প্যাকেজে যা",
    notIncludedTitleEm: "নেই",
    notIncludedFooterBefore: "উপরের feature গুলো পেতে ",
    notIncludedFooterLink: "উচ্চতর package",
    notIncludedFooterAfter: " বেছে নিন।",
    ctaStart: "দিয়ে আজই শুরু",
    ctaSubtitle: "১৫ দিন ফ্রি ট্রায়াল + ৩০ দিন refund গ্যারান্টি",
    ctaPrimary: "ফ্রি ট্রায়াল শুরু",
    ctaSecondary: "অন্য প্যাকেজ তুলনা করুন",
  },
  en: {
    backToAll: "View all plans",
    packageSuffix: "Plan",
    whoFor: "Who is it for?",
    bestValue: "Best value",
    lifetimeBadge: "✨ LIFETIME",
    payOnce: "one-time payment",
    perMonth: "/month",
    buyCta: "Buy this plan",
    whatsappCta: "Ask on WhatsApp",
    hugeSaving: "💰 HUGE SAVINGS",
    savingsCompareHeading: "Savings vs. other plans",
    savings: "saved",
    perYear: "per year",
    perYearSuffix: "/year",
    notIncludedTitle: "What this plan",
    notIncludedTitleEm: "doesn't include",
    notIncludedFooterBefore: "To unlock the features above, choose a ",
    notIncludedFooterLink: "higher plan",
    notIncludedFooterAfter: ".",
    ctaStart: "— start today",
    ctaSubtitle: "15-day free trial + 30-day refund guarantee",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Compare other plans",
  },
  ur: {
    backToAll: "تمام پیکجز دیکھیں",
    packageSuffix: "پیکج",
    whoFor: "کن کے لیے؟",
    bestValue: "بہترین قیمت",
    lifetimeBadge: "✨ LIFETIME",
    payOnce: "ایک بار ادائیگی",
    perMonth: "/ماہ",
    buyCta: "یہ پیکج خریدیں",
    whatsappCta: "WhatsApp پر پوچھیں",
    hugeSaving: "💰 بڑی بچت",
    savingsCompareHeading: "دیگر پیکجز کے مقابلے میں بچت",
    savings: "بچت",
    perYear: "سالانہ",
    perYearSuffix: "/سال",
    notIncludedTitle: "اس پیکج میں جو",
    notIncludedTitleEm: "شامل نہیں",
    notIncludedFooterBefore: "اوپر والی خصوصیات کے لیے ",
    notIncludedFooterLink: "اعلیٰ پیکج",
    notIncludedFooterAfter: " منتخب کریں۔",
    ctaStart: "کے ساتھ آج ہی شروع کریں",
    ctaSubtitle: "۱۵ دن مفت آزمائش + ۳۰ دن رقم واپسی کی ضمانت",
    ctaPrimary: "مفت آزمائش شروع کریں",
    ctaSecondary: "دیگر پیکجز کا موازنہ",
  },
  ar: {
    backToAll: "عرض جميع الباقات",
    packageSuffix: "باقة",
    whoFor: "لمن هذه الباقة؟",
    bestValue: "أفضل قيمة",
    lifetimeBadge: "✨ LIFETIME",
    payOnce: "دفعة واحدة",
    perMonth: "/شهر",
    buyCta: "اشترِ هذه الباقة",
    whatsappCta: "اسأل عبر WhatsApp",
    hugeSaving: "💰 توفير كبير",
    savingsCompareHeading: "التوفير مقارنة بالباقات الأخرى",
    savings: "توفير",
    perYear: "سنويًا",
    perYearSuffix: "/سنة",
    notIncludedTitle: "ما",
    notIncludedTitleEm: "لا تتضمنه هذه الباقة",
    notIncludedFooterBefore: "للحصول على الميزات أعلاه اختر ",
    notIncludedFooterLink: "باقة أعلى",
    notIncludedFooterAfter: ".",
    ctaStart: "— ابدأ اليوم",
    ctaSubtitle: "تجربة مجانية 15 يومًا + ضمان استرداد 30 يومًا",
    ctaPrimary: "ابدأ التجربة المجانية",
    ctaSecondary: "قارن الباقات الأخرى",
  },
};

export function getPackageDetailChrome(locale: Locale): PackageDetailChromeCopy {
  return packageDetailChrome[locale] ?? packageDetailChrome.bn;
}

// ─── /pricing/[slug] — per-package localized content ─────────────────────

export type PackageSlug = "lifetime" | "starter" | "growth" | "scale";

export type LocalizedPackageDetail = {
  name: string;
  tagline: string;
  badge?: string;
  summary: string;
  whoFor: string[];
  bestValue?: string;
  sections: Array<{
    title: string;
    icon: string;
    items: Array<{ label: string; desc?: string; included: boolean }>;
  }>;
  notIncluded: string[];
  savingsTable?: {
    title: string;
    subtitle: string;
    yourYearly: { label: string; amount: number };
    compareAgainst: Array<{ name: string; yearly: number; savingsPercent: number }>;
    footer?: string;
  };
};

const packageDetails: Record<PackageSlug, Record<Locale, LocalizedPackageDetail>> = {
  lifetime: {
    bn: {
      name: "Lifetime Basic",
      tagline: "ছোট প্রতিষ্ঠান · একবার পেমেন্ট · সারাজীবন ব্যবহার",
      badge: "LIFETIME DEAL",
      summary: "বাংলাদেশের ছোট মাদ্রাসা ও স্কুলের জন্য তৈরি — একবার ২০,০০০ টাকা দিলে সারাজীবন Muhius Sunnah ব্যবহার করতে পারবেন। এরপর প্রতি বছর শুধু ৳৫,০০০ (domain + hosting)। অন্য প্যাকেজের তুলনায় ৬০-৯০% সাশ্রয়।",
      whoFor: [
        "২০০ জন পর্যন্ত শিক্ষার্থীর ছোট মাদ্রাসা/স্কুল",
        "যারা SMS/AI ছাড়াই চালাতে চান",
        "নতুন প্রতিষ্ঠান যারা খরচ কমাতে চান",
        "One-time পেমেন্ট প্রেফার করেন",
      ],
      bestValue: "প্রথম বছর ৳২০,০০০ + ৳৫,০০০ = ৳২৫,০০০। পরের প্রতি বছর শুধু ৳৫,০০০। Scale প্যাকেজ-এর তুলনায় ৯০% সাশ্রয় — Growth-এর তুলনায় ৭৯%, Starter-এর তুলনায় ৫৮%। ১০ বছরে মাসে মাত্র ৳১৬৭!",
      savingsTable: {
        title: "একবার কিনুন, সারাজীবন সাশ্রয় করুন",
        subtitle: "Lifetime কেনার পর প্রতি বছর শুধু ৳৫,০০০ (Domain ৳২,০০০ + Hosting ৳৩,০০০)। অন্য subscription প্যাকেজগুলোর বার্ষিক খরচের তুলনায় কতটা সাশ্রয় হয় দেখুন:",
        yourYearly: { label: "Lifetime বার্ষিক খরচ", amount: 5000 },
        compareAgainst: [
          { name: "Starter · ৳১,০০০/মাস", yearly: 12000, savingsPercent: 58 },
          { name: "Growth · ৳২,০০০/মাস", yearly: 24000, savingsPercent: 79 },
          { name: "Scale · ৳৪,০০০/মাস", yearly: 48000, savingsPercent: 90 },
        ],
        footer: "শর্ত প্রযোজ্য: Lifetime মূল্য একবার ৳২০,০০০। এরপর প্রতি বছর domain (৳২,০০০) + hosting (৳৩,০০০) renew করতে হবে। SMS/WhatsApp credits আলাদা। AI feature এই প্যাকেজে নেই। ১০ বছর ধরে ব্যবহার করলে মাসে মাত্র ৳১৬৭!",
      },
      sections: [
        { title: "একাডেমিক ব্যবস্থাপনা", icon: "📚", items: [
          { label: "শিক্ষার্থী ম্যানেজমেন্ট", desc: "২০০ জন পর্যন্ত — নাম, ছবি, অভিভাবক, roll, transfer, promotion — সব।", included: true },
          { label: "শিক্ষক ও স্টাফ management", desc: "সীমাহীন শিক্ষক — জয়েনিং তারিখ, বেতন scale, contact।", included: true },
          { label: "শ্রেণি, সেকশন, বিষয়", desc: "যত ইচ্ছা class/section/subject — limit নেই।", included: true },
          { label: "উপস্থিতি (ম্যানুয়াল)", desc: "প্রতিদিন ক্লাস-ভিত্তিক hazira nithe parben admin panel থেকে।", included: true },
          { label: "একাডেমিক বছর", desc: "বছর প্রতি সব ডেটা রাখা, archive সুবিধা।", included: true },
          { label: "Bulk import (Excel)", desc: "Excel sheet থেকে ১০০+ ছাত্র একসাথে upload।", included: true },
        ]},
        { title: "পরীক্ষা ও রেজাল্ট", icon: "📝", items: [
          { label: "পরীক্ষা তৈরি ও রুটিন", desc: "যে কোনো exam — মিডটার্ম, ফাইনাল — ও রুটিন management।", included: true },
          { label: "মার্কস এন্ট্রি", desc: "Keyboard-friendly grid, auto-grade, locked-approve workflow।", included: true },
          { label: "GPA 5.0 মার্কশীট", desc: "Bangla Unicode print-ready মার্কশীট।", included: true },
          { label: "পজিশন/র‍্যাংকিং", desc: "Class-wise position auto-calculated।", included: true },
          { label: "Admit card", desc: "প্রতিটি ছাত্রের জন্য printable admit card।", included: true },
        ]},
        { title: "ফি ও সার্টিফিকেট", icon: "💰", items: [
          { label: "ফি রেকর্ড (ম্যানুয়াল)", desc: "Cash/check/bank transfer — manually record করে হিসাব রাখুন।", included: true },
          { label: "Invoice তৈরি", desc: "প্রতি ছাত্রের জন্য invoice generate + print।", included: true },
          { label: "Student ledger", desc: "প্রতি ছাত্রের আর্থিক ইতিহাস (due/paid/balance)।", included: true },
          { label: "সার্টিফিকেট প্রিন্ট", desc: "Transfer, character, study — টেমপ্লেট-based certificate।", included: true },
        ]},
        { title: "অভিভাবক পোর্টাল", icon: "👨‍👩‍👧", items: [
          { label: "অভিভাবক লগইন", desc: "প্রত্যেক অভিভাবক নিজের সন্তানের ডেটা দেখতে পারবেন।", included: true },
          { label: "রেজাল্ট ভিউ", desc: "পোর্টাল থেকে মার্কশীট/grade দেখা।", included: true },
          { label: "উপস্থিতি ভিউ", desc: "কোন দিন present/absent সব দেখা।", included: true },
          { label: "ফি status ভিউ", desc: "কত পরিশোধ করেছেন, কত বাকি — সব clear।", included: true },
        ]},
        { title: "রিপোর্ট ও অপারেশন", icon: "📊", items: [
          { label: "Excel রিপোর্ট", desc: "সকল ডেটা Excel-এ export।", included: true },
          { label: "প্রিন্ট রিপোর্ট", desc: "Attendance sheet, class-wise student list, fee register — সব print-ready।", included: true },
          { label: "Community সাপোর্ট", desc: "Email + public help center (১০০+ video, ২০০+ article)।", included: true },
        ]},
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
    },
    en: {
      name: "Lifetime Basic",
      tagline: "Small institutions · one-time payment · lifetime access",
      badge: "LIFETIME DEAL",
      summary: "Built for small madrasas and schools in Bangladesh — pay ৳20,000 once and use Muhius Sunnah for life. After that, just ৳5,000/year (domain + hosting). 60-90% savings vs. other plans.",
      whoFor: [
        "Small madrasa/school with up to 200 students",
        "Institutions that don't need SMS/AI",
        "New institutions looking to minimize cost",
        "Prefer one-time payment over subscription",
      ],
      bestValue: "First year ৳20,000 + ৳5,000 = ৳25,000. Every subsequent year is just ৳5,000. That's 90% less than Scale, 79% less than Growth, 58% less than Starter. Over 10 years, just ৳167/month!",
      savingsTable: {
        title: "Buy once, save for life",
        subtitle: "After buying Lifetime you pay only ৳5,000/year (Domain ৳2,000 + Hosting ৳3,000). Here's how much you save vs. the yearly cost of other subscription plans:",
        yourYearly: { label: "Lifetime yearly cost", amount: 5000 },
        compareAgainst: [
          { name: "Starter · ৳1,000/month", yearly: 12000, savingsPercent: 58 },
          { name: "Growth · ৳2,000/month", yearly: 24000, savingsPercent: 79 },
          { name: "Scale · ৳4,000/month", yearly: 48000, savingsPercent: 90 },
        ],
        footer: "Terms: Lifetime price is ৳20,000 one-time. Domain (৳2,000) + hosting (৳3,000) renew yearly. SMS/WhatsApp credits are separate. AI features are not included. Over 10 years, that's just ৳167/month!",
      },
      sections: [
        { title: "Academic management", icon: "📚", items: [
          { label: "Student management", desc: "Up to 200 — name, photo, guardian, roll, transfer, promotion — all included.", included: true },
          { label: "Teacher & staff management", desc: "Unlimited teachers — joining date, salary scale, contact.", included: true },
          { label: "Classes, sections, subjects", desc: "Unlimited classes/sections/subjects.", included: true },
          { label: "Attendance (manual)", desc: "Daily class-wise attendance from the admin panel.", included: true },
          { label: "Academic years", desc: "Year-by-year data retention with archive support.", included: true },
          { label: "Bulk import (Excel)", desc: "Upload 100+ students at once from Excel.", included: true },
        ]},
        { title: "Exams & results", icon: "📝", items: [
          { label: "Exam creation & routines", desc: "Any exam — midterm, final — plus routine management.", included: true },
          { label: "Marks entry", desc: "Keyboard-friendly grid, auto-grade, locked-approve workflow.", included: true },
          { label: "GPA 5.0 mark sheet", desc: "Bangla Unicode print-ready mark sheet.", included: true },
          { label: "Position / ranking", desc: "Class-wise position auto-calculated.", included: true },
          { label: "Admit card", desc: "Printable admit card for every student.", included: true },
        ]},
        { title: "Fees & certificates", icon: "💰", items: [
          { label: "Fee records (manual)", desc: "Cash/cheque/bank transfer — record and reconcile manually.", included: true },
          { label: "Invoice generation", desc: "Generate and print invoices per student.", included: true },
          { label: "Student ledger", desc: "Full financial history per student (due/paid/balance).", included: true },
          { label: "Certificate printing", desc: "Transfer, character, study — template-based certificates.", included: true },
        ]},
        { title: "Guardian portal", icon: "👨‍👩‍👧", items: [
          { label: "Guardian login", desc: "Each guardian can view their child's data.", included: true },
          { label: "Result view", desc: "See mark sheets and grades from the portal.", included: true },
          { label: "Attendance view", desc: "See present/absent history by day.", included: true },
          { label: "Fee status view", desc: "Paid vs. due — crystal clear.", included: true },
        ]},
        { title: "Reports & operations", icon: "📊", items: [
          { label: "Excel reports", desc: "Export every dataset to Excel.", included: true },
          { label: "Print reports", desc: "Attendance sheet, class list, fee register — all print-ready.", included: true },
          { label: "Community support", desc: "Email + public help center (100+ videos, 200+ articles).", included: true },
        ]},
      ],
      notIncluded: [
        "SMS notifications (no SMS credit in Lifetime Basic)",
        "Online payment gateway (bKash/Nagad/Rocket)",
        "WhatsApp auto-messaging",
        "AI dropout-risk analysis",
        "AI report comments",
        "Priority phone support",
        "Multi-branch",
        "Custom domain",
      ],
    },
    ur: {
      name: "Lifetime Basic",
      tagline: "چھوٹے ادارے · ایک بار ادائیگی · عمر بھر کا استعمال",
      badge: "LIFETIME DEAL",
      summary: "بنگلہ دیش کے چھوٹے مدارس اور اسکولوں کے لیے — ایک بار ۲۰،۰۰۰ ٹاکا ادا کریں اور Muhius Sunnah عمر بھر استعمال کریں۔ اس کے بعد صرف ۵،۰۰۰ ٹاکا سالانہ (ڈومین + ہوسٹنگ)۔ دیگر پیکجز کے مقابلے میں ۶۰-۹۰٪ بچت۔",
      whoFor: [
        "۲۰۰ طلباء تک کا چھوٹا مدرسہ/اسکول",
        "جو SMS/AI کے بغیر کام چلانا چاہتے ہیں",
        "نئے ادارے جو لاگت کم رکھنا چاہتے ہیں",
        "جو ایک بار کی ادائیگی کو ترجیح دیتے ہیں",
      ],
      bestValue: "پہلے سال ۲۰،۰۰۰ + ۵،۰۰۰ = ۲۵،۰۰۰ ٹاکا۔ بعد کے ہر سال صرف ۵،۰۰۰ ٹاکا۔ Scale کے مقابلے میں ۹۰٪، Growth کے مقابلے میں ۷۹٪، Starter کے مقابلے میں ۵۸٪ بچت۔ ۱۰ سال میں صرف ۱۶۷ ٹاکا ماہانہ!",
      savingsTable: {
        title: "ایک بار خریدیں، عمر بھر بچائیں",
        subtitle: "Lifetime خریدنے کے بعد صرف ۵،۰۰۰ ٹاکا سالانہ (ڈومین ۲،۰۰۰ + ہوسٹنگ ۳،۰۰۰)۔ دیگر سبسکرپشن پیکجز کے سالانہ خرچ کے مقابلے میں بچت دیکھیں:",
        yourYearly: { label: "Lifetime سالانہ خرچ", amount: 5000 },
        compareAgainst: [
          { name: "Starter · ۱،۰۰۰/ماہ", yearly: 12000, savingsPercent: 58 },
          { name: "Growth · ۲،۰۰۰/ماہ", yearly: 24000, savingsPercent: 79 },
          { name: "Scale · ۴،۰۰۰/ماہ", yearly: 48000, savingsPercent: 90 },
        ],
        footer: "شرائط: Lifetime قیمت ۲۰،۰۰۰ ٹاکا ایک بار۔ اس کے بعد سالانہ ڈومین (۲،۰۰۰) + ہوسٹنگ (۳،۰۰۰) renew کرنی ہوگی۔ SMS/WhatsApp کریڈٹ الگ۔ AI خصوصیات شامل نہیں۔ ۱۰ سال میں صرف ۱۶۷ ٹاکا ماہانہ!",
      },
      sections: [
        { title: "تعلیمی انتظام", icon: "📚", items: [
          { label: "طالب علم کا انتظام", desc: "۲۰۰ تک — نام، تصویر، سرپرست، رول، ٹرانسفر، پروموشن — سب کچھ۔", included: true },
          { label: "اساتذہ اور عملہ انتظام", desc: "لامحدود اساتذہ — جوائننگ کی تاریخ، تنخواہ سکیل، رابطہ۔", included: true },
          { label: "کلاس، سیکشن، مضامین", desc: "جتنے چاہیں کلاس/سیکشن/مضمون — کوئی حد نہیں۔", included: true },
          { label: "حاضری (دستی)", desc: "ایڈمن پینل سے روزانہ کلاس وار حاضری۔", included: true },
          { label: "تعلیمی سال", desc: "سال بہ سال ڈیٹا، آرکائیو کی سہولت۔", included: true },
          { label: "Bulk import (Excel)", desc: "Excel سے ۱۰۰+ طلباء ایک ساتھ اپ لوڈ۔", included: true },
        ]},
        { title: "امتحانات اور نتائج", icon: "📝", items: [
          { label: "امتحان اور روٹین", desc: "کوئی بھی امتحان — مڈٹرم، فائنل — اور روٹین انتظام۔", included: true },
          { label: "مارکس انٹری", desc: "کی بورڈ دوستانہ گرڈ، آٹو گریڈ، لاکڈ اپروو۔", included: true },
          { label: "GPA 5.0 مارک شیٹ", desc: "پرنٹ کے لیے تیار مارک شیٹ۔", included: true },
          { label: "پوزیشن/رینکنگ", desc: "کلاس وار پوزیشن خودکار۔", included: true },
          { label: "داخلہ کارڈ", desc: "ہر طالب علم کے لیے پرنٹ ایبل داخلہ کارڈ۔", included: true },
        ]},
        { title: "فیس اور اسناد", icon: "💰", items: [
          { label: "فیس ریکارڈ (دستی)", desc: "نقد/چیک/بینک ٹرانسفر — دستی طور پر ریکارڈ۔", included: true },
          { label: "انوائس", desc: "ہر طالب علم کے لیے انوائس جنریٹ + پرنٹ۔", included: true },
          { label: "طالب علم لیجر", desc: "ہر طالب علم کی مالی تاریخ (واجب/ادا/بیلنس)۔", included: true },
          { label: "اسناد پرنٹ", desc: "ٹرانسفر، کردار، مطالعہ — ٹیمپلیٹ پر مبنی۔", included: true },
        ]},
        { title: "سرپرست پورٹل", icon: "👨‍👩‍👧", items: [
          { label: "سرپرست لاگ ان", desc: "ہر سرپرست اپنے بچے کا ڈیٹا دیکھ سکتا ہے۔", included: true },
          { label: "نتائج", desc: "پورٹل سے مارک شیٹ/گریڈ دیکھیں۔", included: true },
          { label: "حاضری", desc: "کس دن حاضر/غیر حاضر — سب کچھ۔", included: true },
          { label: "فیس اسٹیٹس", desc: "کتنا ادا کیا، کتنا واجب — سب واضح۔", included: true },
        ]},
        { title: "رپورٹس اور آپریشن", icon: "📊", items: [
          { label: "Excel رپورٹس", desc: "سارا ڈیٹا Excel میں ایکسپورٹ۔", included: true },
          { label: "پرنٹ رپورٹس", desc: "حاضری شیٹ، کلاس وار فہرست، فیس رجسٹر — سب تیار۔", included: true },
          { label: "کمیونٹی سپورٹ", desc: "ای میل + عوامی ہیلپ سینٹر (۱۰۰+ ویڈیوز، ۲۰۰+ مضامین)۔", included: true },
        ]},
      ],
      notIncluded: [
        "SMS نوٹیفکیشن (Lifetime Basic میں SMS کریڈٹ نہیں)",
        "آن لائن پے منٹ گیٹ وے (bKash/Nagad/Rocket)",
        "WhatsApp آٹو پیغام رسانی",
        "AI ڈراپ آؤٹ رسک تجزیہ",
        "AI رپورٹ تبصرے",
        "ترجیحی فون سپورٹ",
        "ملٹی برانچ",
        "کسٹم ڈومین",
      ],
    },
    ar: {
      name: "Lifetime Basic",
      tagline: "مؤسسات صغيرة · دفعة واحدة · استخدام مدى الحياة",
      badge: "LIFETIME DEAL",
      summary: "مصممة للمدارس والمدارس الدينية الصغيرة في بنغلاديش — ادفع 20,000 تاكا مرة واحدة واستخدم Muhius Sunnah مدى الحياة. بعد ذلك فقط 5,000 تاكا/سنة (دومين + استضافة). توفير 60-90٪ مقارنة بالباقات الأخرى.",
      whoFor: [
        "مدرسة/مدرسة دينية صغيرة حتى 200 طالب",
        "من لا يحتاجون SMS/AI",
        "المؤسسات الجديدة التي تريد تقليل التكلفة",
        "من يفضّل الدفع مرة واحدة",
      ],
      bestValue: "السنة الأولى 20,000 + 5,000 = 25,000 تاكا. كل سنة لاحقة فقط 5,000 تاكا. أقل بـ 90٪ من Scale و 79٪ من Growth و 58٪ من Starter. على مدى 10 سنوات: 167 تاكا شهريًا فقط!",
      savingsTable: {
        title: "اشترِ مرة واحدة ووفّر مدى الحياة",
        subtitle: "بعد شراء Lifetime تدفع فقط 5,000 تاكا/سنة (دومين 2,000 + استضافة 3,000). شاهد مقدار التوفير مقابل التكلفة السنوية للباقات الأخرى:",
        yourYearly: { label: "التكلفة السنوية لـ Lifetime", amount: 5000 },
        compareAgainst: [
          { name: "Starter · 1,000/شهر", yearly: 12000, savingsPercent: 58 },
          { name: "Growth · 2,000/شهر", yearly: 24000, savingsPercent: 79 },
          { name: "Scale · 4,000/شهر", yearly: 48000, savingsPercent: 90 },
        ],
        footer: "الشروط: سعر Lifetime 20,000 تاكا لمرة واحدة. تجديد الدومين (2,000) + الاستضافة (3,000) سنويًا. أرصدة SMS/WhatsApp منفصلة. ميزات AI غير مشمولة. على مدى 10 سنوات: 167 تاكا شهريًا فقط!",
      },
      sections: [
        { title: "الإدارة الأكاديمية", icon: "📚", items: [
          { label: "إدارة الطلاب", desc: "حتى 200 — الاسم، الصورة، ولي الأمر، الرقم، النقل، الترقية.", included: true },
          { label: "إدارة المعلمين والموظفين", desc: "معلمون بلا حد — تاريخ الانضمام، سلم الرواتب، الاتصال.", included: true },
          { label: "الفصول والأقسام والمواد", desc: "فصول/أقسام/مواد بلا حد.", included: true },
          { label: "الحضور (يدوي)", desc: "حضور يومي حسب الفصل من لوحة الإدارة.", included: true },
          { label: "السنوات الأكاديمية", desc: "حفظ البيانات سنة بسنة مع الأرشفة.", included: true },
          { label: "استيراد جماعي (Excel)", desc: "رفع 100+ طالب دفعة واحدة من Excel.", included: true },
        ]},
        { title: "الامتحانات والنتائج", icon: "📝", items: [
          { label: "إنشاء الامتحانات والجدول", desc: "أي امتحان — نصف الفصل، النهائي — مع إدارة الجدول.", included: true },
          { label: "إدخال الدرجات", desc: "شبكة صديقة للوحة المفاتيح، ترصيد تلقائي، اعتماد مقفل.", included: true },
          { label: "ورقة درجات GPA 5.0", desc: "ورقة درجات جاهزة للطباعة.", included: true },
          { label: "الترتيب/المركز", desc: "ترتيب حسب الفصل تلقائيًا.", included: true },
          { label: "بطاقة الدخول", desc: "بطاقة دخول قابلة للطباعة لكل طالب.", included: true },
        ]},
        { title: "الرسوم والشهادات", icon: "💰", items: [
          { label: "سجلات الرسوم (يدوي)", desc: "نقدًا/شيك/تحويل بنكي — تسجيل يدوي.", included: true },
          { label: "إصدار الفواتير", desc: "توليد وطباعة فاتورة لكل طالب.", included: true },
          { label: "دفتر الطالب", desc: "التاريخ المالي لكل طالب (مستحق/مدفوع/رصيد).", included: true },
          { label: "طباعة الشهادات", desc: "نقل، سلوك، دراسة — شهادات بناءً على قوالب.", included: true },
        ]},
        { title: "بوابة ولي الأمر", icon: "👨‍👩‍👧", items: [
          { label: "تسجيل دخول ولي الأمر", desc: "كل ولي أمر يرى بيانات طفله.", included: true },
          { label: "عرض النتائج", desc: "ورقة الدرجات والدرجات من البوابة.", included: true },
          { label: "عرض الحضور", desc: "حاضر/غائب حسب اليوم.", included: true },
          { label: "عرض حالة الرسوم", desc: "المدفوع مقابل المستحق — بوضوح.", included: true },
        ]},
        { title: "التقارير والعمليات", icon: "📊", items: [
          { label: "تقارير Excel", desc: "تصدير جميع البيانات إلى Excel.", included: true },
          { label: "تقارير الطباعة", desc: "ورقة الحضور، قائمة الفصل، سجل الرسوم — جاهزة للطباعة.", included: true },
          { label: "دعم المجتمع", desc: "بريد إلكتروني + مركز مساعدة عام (100+ فيديو، 200+ مقالة).", included: true },
        ]},
      ],
      notIncluded: [
        "إشعارات SMS (لا رصيد SMS في Lifetime Basic)",
        "بوابة دفع عبر الإنترنت (bKash/Nagad/Rocket)",
        "مراسلة WhatsApp التلقائية",
        "تحليل مخاطر التسرب بالذكاء الاصطناعي",
        "تعليقات تقارير AI",
        "دعم هاتفي ذو أولوية",
        "فروع متعددة",
        "نطاق مخصص",
      ],
    },
  },
  starter: {
    bn: {
      name: "Starter",
      tagline: "বৃদ্ধিমান প্রতিষ্ঠান · মাসিক বিল · সহজ cancel",
      summary: "আপনার প্রতিষ্ঠান বাড়ছে — Starter প্যাকেজ তার জন্য perfect। Lifetime Basic-এর সব ফিচার + SMS নোটিফিকেশন (মাসে ১,০০০ SMS), অফলাইন PWA mode, এবং ১০+ advanced report। অভিভাবকরা instant SMS পাবেন ফি due, অনুপস্থিতি, পরীক্ষার রুটিনে।",
      whoFor: [
        "৫০০ জন পর্যন্ত শিক্ষার্থীর মাঝারি স্কুল/মাদ্রাসা",
        "যারা SMS নোটিফিকেশন চালু করতে চান",
        "যাদের internet connection weak — অফলাইন mode দরকার",
        "Monthly billing পছন্দ করেন",
      ],
      bestValue: "মাসে ৳১,০০০ = প্রতি ছাত্রের জন্য মাত্র ৳২। SMS credit বাদে বাকি সব free।",
      sections: [
        { title: "Lifetime Basic-এর সব কিছু +", icon: "✨", items: [
          { label: "২০০ → ৫০০ শিক্ষার্থী", desc: "আড়াই গুণ বেশি ক্যাপাসিটি।", included: true },
          { label: "SMS নোটিফিকেশন", desc: "মাসে ১,০০০ SMS অন্তর্ভুক্ত। ছাত্র, অভিভাবক, শিক্ষক — সবার কাছে instant।", included: true },
          { label: "অফলাইন PWA mode", desc: "নেট না থাকলেও হাজিরা ও মার্কস — অনলাইনে আসলে auto-sync।", included: true },
          { label: "১০+ advanced রিপোর্ট", desc: "ফি কালেকশন, বকেয়া aging, উপস্থিতি summary, আয়-ব্যয় — PDF/Excel।", included: true },
          { label: "Bulk SMS টেমপ্লেট", desc: "প্রি-configured templates — ফি রিমাইন্ডার, ছুটি, পরীক্ষা।", included: true },
          { label: "নোটিশ composer", desc: "এক ক্লিকে সকল অভিভাবকের কাছে notice।", included: true },
          { label: "Email সাপোর্ট (২৪ ঘণ্টা reply)", desc: "Community থেকে upgraded support।", included: true },
          { label: "Install prompt (মোবাইল)", desc: "অভিভাবকরা phone home screen-এ install করতে পারবেন।", included: true },
        ]},
        { title: "ফি ও ইনভয়েস", icon: "💳", items: [
          { label: "মাসিক ইনভয়েস auto-generate", desc: "প্রতি মাসের ১ তারিখে সকল ছাত্রের invoice তৈরি।", included: true },
          { label: "SMS-এ ফি রিমাইন্ডার", desc: "Due date-এর আগে auto-reminder পাঠান।", included: true },
          { label: "৩০+ ফি হেড", desc: "Tuition, exam, library, transport — pre-configured।", included: true },
        ]},
        { title: "রিয়েলটাইম + মোবাইল", icon: "📱", items: [
          { label: "Live dashboard", desc: "Payment/admission হলেই dashboard auto-refresh।", included: true },
          { label: "Push notification", desc: "মোবাইল app-এ push alerts (অপশনাল)।", included: true },
          { label: "Multi-device access", desc: "যত ইচ্ছা device থেকে login।", included: true },
        ]},
      ],
      notIncluded: [
        "অনলাইন পেমেন্ট gateway (bKash/Nagad/Rocket) — Growth প্যাকেজে পাবেন",
        "WhatsApp auto-messaging — Growth প্যাকেজে পাবেন",
        "AI ড্রপআউট ঝুঁকি + AI রিপোর্ট কমেন্ট — Growth প্যাকেজে",
        "Priority phone সাপোর্ট",
        "মাল্টি-ব্রাঞ্চ + কাস্টম ডোমেইন — Scale প্যাকেজে",
        "SMS credit ১,০০০-এর বেশি লাগলে extra কিনতে হবে (৳২০/১০০ SMS)",
      ],
    },
    en: {
      name: "Starter",
      tagline: "Growing institutions · monthly billing · easy cancel",
      summary: "Your institution is growing — Starter is built for it. Everything in Lifetime Basic + SMS notifications (1,000/month), offline PWA mode, and 10+ advanced reports. Parents get instant SMS on fee dues, absences, and exam routines.",
      whoFor: [
        "Medium school/madrasa with up to 500 students",
        "Want to enable SMS notifications",
        "Weak internet — need offline mode",
        "Prefer monthly billing",
      ],
      bestValue: "৳1,000/month = just ৳2 per student. Everything is free except SMS credit.",
      sections: [
        { title: "Everything in Lifetime Basic +", icon: "✨", items: [
          { label: "200 → 500 students", desc: "2.5× more capacity.", included: true },
          { label: "SMS notifications", desc: "1,000 SMS/month included. Instant delivery to students, guardians, teachers.", included: true },
          { label: "Offline PWA mode", desc: "Attendance and marks without internet — auto-sync on reconnect.", included: true },
          { label: "10+ advanced reports", desc: "Fee collection, dues aging, attendance summary, P&L — PDF/Excel.", included: true },
          { label: "Bulk SMS templates", desc: "Pre-configured — fee reminders, holidays, exams.", included: true },
          { label: "Notice composer", desc: "One click to reach every guardian.", included: true },
          { label: "Email support (24h reply)", desc: "Upgraded from community support.", included: true },
          { label: "Install prompt (mobile)", desc: "Guardians can install to the home screen.", included: true },
        ]},
        { title: "Fees & invoicing", icon: "💳", items: [
          { label: "Auto-generated monthly invoices", desc: "Invoices created for every student on the 1st of each month.", included: true },
          { label: "SMS fee reminders", desc: "Auto-reminders before the due date.", included: true },
          { label: "30+ fee heads", desc: "Tuition, exam, library, transport — pre-configured.", included: true },
        ]},
        { title: "Realtime + mobile", icon: "📱", items: [
          { label: "Live dashboard", desc: "Auto-refresh on every payment/admission.", included: true },
          { label: "Push notifications", desc: "Mobile app push alerts (optional).", included: true },
          { label: "Multi-device access", desc: "Log in from any number of devices.", included: true },
        ]},
      ],
      notIncluded: [
        "Online payment gateway (bKash/Nagad/Rocket) — available in Growth",
        "WhatsApp auto-messaging — available in Growth",
        "AI dropout risk + AI report comments — in Growth",
        "Priority phone support",
        "Multi-branch + custom domain — in Scale",
        "Extra SMS beyond 1,000 must be purchased (৳20 per 100 SMS)",
      ],
    },
    ur: {
      name: "Starter",
      tagline: "بڑھتے ہوئے ادارے · ماہانہ بلنگ · آسان منسوخی",
      summary: "آپ کا ادارہ بڑھ رہا ہے — Starter اس کے لیے مثالی ہے۔ Lifetime Basic کی تمام خصوصیات + SMS نوٹیفکیشن (۱،۰۰۰ ماہانہ)، آف لائن PWA موڈ، اور ۱۰+ ایڈوانس رپورٹس۔ سرپرستوں کو فیس واجب، غیر حاضری اور امتحان کی روٹین پر فوری SMS۔",
      whoFor: [
        "۵۰۰ طلباء تک کا درمیانی اسکول/مدرسہ",
        "جو SMS نوٹیفکیشن فعال کرنا چاہتے ہیں",
        "جن کا انٹرنیٹ کمزور ہے — آف لائن موڈ کی ضرورت",
        "ماہانہ بلنگ پسند کرتے ہیں",
      ],
      bestValue: "۱،۰۰۰ ٹاکا ماہانہ = فی طالب علم صرف ۲ ٹاکا۔ SMS کریڈٹ کے علاوہ سب کچھ مفت۔",
      sections: [
        { title: "Lifetime Basic کی ہر چیز +", icon: "✨", items: [
          { label: "۲۰۰ → ۵۰۰ طلباء", desc: "ڈھائی گنا زیادہ گنجائش۔", included: true },
          { label: "SMS نوٹیفکیشن", desc: "ماہانہ ۱،۰۰۰ SMS شامل۔ طلباء، سرپرست، اساتذہ — سب کو فوری۔", included: true },
          { label: "آف لائن PWA موڈ", desc: "نیٹ کے بغیر حاضری اور مارکس — دوبارہ کنکشن پر آٹو سنک۔", included: true },
          { label: "۱۰+ ایڈوانس رپورٹس", desc: "فیس وصولی، واجبات، حاضری، آمدنی-اخراجات — PDF/Excel۔", included: true },
          { label: "Bulk SMS ٹیمپلیٹس", desc: "پہلے سے تیار — فیس یاد دہانی، چھٹی، امتحان۔", included: true },
          { label: "نوٹس کمپوزر", desc: "ایک کلک میں ہر سرپرست کو نوٹس۔", included: true },
          { label: "ای میل سپورٹ (۲۴ گھنٹے جواب)", desc: "کمیونٹی سے بہتر سپورٹ۔", included: true },
          { label: "Install prompt (موبائل)", desc: "سرپرست فون ہوم اسکرین پر انسٹال کر سکتے ہیں۔", included: true },
        ]},
        { title: "فیس اور انوائس", icon: "💳", items: [
          { label: "ماہانہ انوائس آٹو جنریٹ", desc: "ہر مہینے کی ۱ تاریخ کو سب طلباء کے انوائس۔", included: true },
          { label: "SMS پر فیس یاد دہانی", desc: "واجب تاریخ سے پہلے آٹو ری مائنڈر۔", included: true },
          { label: "۳۰+ فیس ہیڈز", desc: "ٹیوشن، امتحان، لائبریری، ٹرانسپورٹ — پہلے سے تیار۔", included: true },
        ]},
        { title: "ریئل ٹائم + موبائل", icon: "📱", items: [
          { label: "لائیو ڈیش بورڈ", desc: "ادائیگی/داخلہ پر آٹو ریفریش۔", included: true },
          { label: "Push نوٹیفکیشن", desc: "موبائل ایپ الرٹس (اختیاری)۔", included: true },
          { label: "ملٹی ڈیوائس رسائی", desc: "جتنے چاہیں ڈیوائس سے لاگ ان۔", included: true },
        ]},
      ],
      notIncluded: [
        "آن لائن پے منٹ گیٹ وے — Growth پیکج میں",
        "WhatsApp آٹو پیغام رسانی — Growth پیکج میں",
        "AI ڈراپ آؤٹ رسک + AI رپورٹ تبصرے — Growth میں",
        "ترجیحی فون سپورٹ",
        "ملٹی برانچ + کسٹم ڈومین — Scale میں",
        "۱،۰۰۰ سے زیادہ SMS کریڈٹ چاہیے تو اضافی (۲۰ ٹاکا فی ۱۰۰ SMS)",
      ],
    },
    ar: {
      name: "Starter",
      tagline: "مؤسسات متنامية · فوترة شهرية · إلغاء سهل",
      summary: "مؤسستك تنمو — Starter مناسبة لها. كل ميزات Lifetime Basic + إشعارات SMS (1,000 شهريًا)، وضع PWA دون اتصال، و10+ تقارير متقدمة. يتلقى الأولياء SMS فوريًا عن الرسوم المستحقة والغياب وجداول الامتحانات.",
      whoFor: [
        "مدرسة/مدرسة دينية متوسطة حتى 500 طالب",
        "من يريد تفعيل إشعارات SMS",
        "اتصال إنترنت ضعيف — يحتاج الوضع دون اتصال",
        "يفضّل الفوترة الشهرية",
      ],
      bestValue: "1,000 تاكا/شهر = فقط 2 تاكا لكل طالب. كل شيء مجاني عدا رصيد SMS.",
      sections: [
        { title: "كل شيء في Lifetime Basic +", icon: "✨", items: [
          { label: "200 → 500 طالب", desc: "سعة أكبر بـ 2.5 مرة.", included: true },
          { label: "إشعارات SMS", desc: "1,000 SMS شهريًا. تسليم فوري للطلاب والأولياء والمعلمين.", included: true },
          { label: "وضع PWA دون اتصال", desc: "الحضور والدرجات بدون إنترنت — مزامنة تلقائية.", included: true },
          { label: "10+ تقارير متقدمة", desc: "تحصيل الرسوم، المستحقات، ملخص الحضور، الأرباح والخسائر — PDF/Excel.", included: true },
          { label: "قوالب SMS جماعية", desc: "جاهزة — تذكيرات الرسوم، العطلات، الامتحانات.", included: true },
          { label: "منشئ الإعلانات", desc: "بنقرة واحدة إلى كل ولي أمر.", included: true },
          { label: "دعم بريدي (رد خلال 24 ساعة)", desc: "ترقية من دعم المجتمع.", included: true },
          { label: "طلب التثبيت (موبايل)", desc: "يمكن للأولياء التثبيت على الشاشة الرئيسية.", included: true },
        ]},
        { title: "الرسوم والفواتير", icon: "💳", items: [
          { label: "فواتير شهرية تلقائية", desc: "فواتير في اليوم الأول من كل شهر.", included: true },
          { label: "تذكيرات الرسوم بـ SMS", desc: "تذكير تلقائي قبل الاستحقاق.", included: true },
          { label: "30+ بند رسوم", desc: "دراسة، امتحان، مكتبة، نقل — جاهزة.", included: true },
        ]},
        { title: "فوري + موبايل", icon: "📱", items: [
          { label: "لوحة حية", desc: "تحديث تلقائي عند كل دفع/قبول.", included: true },
          { label: "إشعارات Push", desc: "تنبيهات موبايل (اختيارية).", included: true },
          { label: "وصول متعدد الأجهزة", desc: "سجّل الدخول من أي عدد من الأجهزة.", included: true },
        ]},
      ],
      notIncluded: [
        "بوابة دفع عبر الإنترنت — في Growth",
        "مراسلة WhatsApp التلقائية — في Growth",
        "مخاطر التسرب + تعليقات تقارير AI — في Growth",
        "دعم هاتفي ذو أولوية",
        "فروع متعددة + نطاق مخصص — في Scale",
        "SMS إضافي فوق 1,000 يُشترى (20 تاكا لكل 100 SMS)",
      ],
    },
  },
  growth: {
    bn: {
      name: "Growth",
      tagline: "মাঝারি থেকে বড় প্রতিষ্ঠান · সবচেয়ে জনপ্রিয়",
      badge: "MOST POPULAR",
      summary: "আমাদের সবচেয়ে জনপ্রিয় প্যাকেজ — বাংলাদেশের ৮০%+ প্রতিষ্ঠান এটিই বেছে নেন। সীমাহীন শিক্ষার্থী, bKash/Nagad/SSLCommerz অনলাইন পেমেন্ট, WhatsApp + Push notifications, AI ড্রপআউট ঝুঁকি বিশ্লেষণ, AI রিপোর্ট কমেন্ট — সব একসাথে।",
      whoFor: [
        "সীমাহীন শিক্ষার্থী — যে কোনো আকারের প্রতিষ্ঠান",
        "অভিভাবকদের কাছ থেকে অনলাইনে ফি নিতে চান",
        "WhatsApp-এ auto-notify করতে চান",
        "AI দিয়ে স্মার্ট ডিসিশন নিতে চান",
      ],
      bestValue: "মাসে ৳২,০০০ = বাজারে এই feature-এর জন্য সর্বনিম্ন দাম। অন্যান্য সফটওয়্যার এই set-এর জন্য ৳৫,০০০+ নেয়।",
      sections: [
        { title: "Starter-এর সব কিছু +", icon: "🚀", items: [
          { label: "সীমাহীন শিক্ষার্থী", desc: "৫,০০০ বা ৫০,০০০ — কোন limit নেই।", included: true },
          { label: "অনলাইন পেমেন্ট gateway", desc: "bKash, Nagad, Rocket, SSLCommerz — অভিভাবক সরাসরি পোর্টাল থেকে ফি দেবেন।", included: true },
          { label: "WhatsApp auto-messaging", desc: "Meta Cloud API দিয়ে ছাত্রদের পিতামাতাদের কাছে।", included: true },
          { label: "Push notification (Firebase)", desc: "Instant mobile push — মোবাইল app-এ।", included: true },
          { label: "Email notification (Resend)", desc: "Professional email with branding।", included: true },
          { label: "SMS credit: ৫,০০০/মাস", desc: "Starter-এর ৫ গুণ।", included: true },
          { label: "Priority email সাপোর্ট", desc: "৮ ঘণ্টায় reply।", included: true },
        ]},
        { title: "AI ফিচার", icon: "🤖", items: [
          { label: "AI ড্রপআউট ঝুঁকি বিশ্লেষণ", desc: "উপস্থিতি + মার্কস + ফি বকেয়া → প্রতি ছাত্রের risk score (low/medium/high/critical) + AI suggestion।", included: true },
          { label: "AI রিপোর্ট কমেন্ট", desc: "প্রত্যেক ছাত্রের রেজাল্টে Claude AI-তৈরি বাংলা comment।", included: true },
          { label: "Smart SMS টেমপ্লেট", desc: "AI দিয়ে personalized SMS তৈরি — ফি রিমাইন্ডার, অনুপস্থিতি।", included: true },
          { label: "সাপ্তাহিক risk recompute", desc: "Automated weekly cron — প্রতি সপ্তাহে risk update।", included: true },
        ]},
        { title: "মাদ্রাসা বিশেষ ফিচার", icon: "🕌", items: [
          { label: "হিফজ heatmap", desc: "৩০ পারা × ছাত্র গ্রিড — কে কতদূর পৌঁছেছে এক নজরে।", included: true },
          { label: "কিতাব curriculum", desc: "৬ স্তর — প্রাথমিক থেকে তাকমিল।", included: true },
          { label: "দৈনিক সবক-সবকী-মানজিল", desc: "১০-কলামের grid, daily tracking।", included: true },
          { label: "Hijri তারিখ + Arabic RTL", desc: "পুরো সিস্টেমে Islamic calendar + Arabic সাপোর্ট।", included: true },
        ]},
        { title: "LMS + Assignments", icon: "📖", items: [
          { label: "অ্যাসাইনমেন্ট ব্যবস্থাপনা", desc: "শিক্ষক create, ছাত্র submit, শিক্ষক grade।", included: true },
          { label: "অনলাইন ক্লাস", desc: "Zoom/Meet/Teams integration — সরাসরি পোর্টাল থেকে join।", included: true },
          { label: "ক্লাস রেকর্ডিং", desc: "Past class recording link।", included: true },
        ]},
        { title: "সুরক্ষা", icon: "🔒", items: [
          { label: "২-স্তর প্রমাণীকরণ (2FA)", desc: "TOTP — Google Authenticator / Authy / 1Password।", included: true },
          { label: "Granular permissions", desc: "প্রতিটি স্টাফের জন্য exact অনুমতি নির্ধারণ।", included: true },
          { label: "অডিট লগ", desc: "কে কী করেছে — সম্পূর্ণ trail।", included: true },
        ]},
      ],
      notIncluded: [
        "মাল্টি-ব্রাঞ্চ (২+ campus) — Scale প্যাকেজে",
        "কাস্টম ডোমেইন — Scale প্যাকেজে",
        "পাবলিক স্কুল ওয়েবসাইট — Scale প্যাকেজে",
        "২৪/৭ ফোন সাপোর্ট — Scale প্যাকেজে",
        "Dedicated success manager — Scale প্যাকেজে",
      ],
    },
    en: {
      name: "Growth",
      tagline: "Medium to large institutions · most popular",
      badge: "MOST POPULAR",
      summary: "Our most popular plan — picked by 80%+ of institutions in Bangladesh. Unlimited students, bKash/Nagad/SSLCommerz online payments, WhatsApp + push notifications, AI dropout-risk analysis, AI report comments — all together.",
      whoFor: [
        "Unlimited students — any institution size",
        "Collect fees online from guardians",
        "Auto-notify via WhatsApp",
        "Make smarter decisions with AI",
      ],
      bestValue: "৳2,000/month — the lowest price for this feature set on the market. Competitors charge ৳5,000+ for the same stack.",
      sections: [
        { title: "Everything in Starter +", icon: "🚀", items: [
          { label: "Unlimited students", desc: "5,000 or 50,000 — no limit.", included: true },
          { label: "Online payment gateway", desc: "bKash, Nagad, Rocket, SSLCommerz — guardians pay directly from the portal.", included: true },
          { label: "WhatsApp auto-messaging", desc: "Meta Cloud API messaging to parents.", included: true },
          { label: "Push notifications (Firebase)", desc: "Instant mobile push in the app.", included: true },
          { label: "Email notifications (Resend)", desc: "Professional email with branding.", included: true },
          { label: "SMS credit: 5,000/month", desc: "5× Starter.", included: true },
          { label: "Priority email support", desc: "8-hour reply.", included: true },
        ]},
        { title: "AI features", icon: "🤖", items: [
          { label: "AI dropout-risk analysis", desc: "Attendance + marks + fee dues → per-student risk score (low/medium/high/critical) + AI suggestion.", included: true },
          { label: "AI report comments", desc: "Claude-AI-generated Bangla comment on every result.", included: true },
          { label: "Smart SMS templates", desc: "AI-generated personalized SMS — fee reminders, absences.", included: true },
          { label: "Weekly risk recompute", desc: "Automated weekly cron keeps risk scores current.", included: true },
        ]},
        { title: "Madrasa-specific features", icon: "🕌", items: [
          { label: "Hifz heatmap", desc: "30-para × student grid — see everyone's progress at a glance.", included: true },
          { label: "Kitab curriculum", desc: "6 stages — primary to Takmeel.", included: true },
          { label: "Daily Sabaq-Sabqi-Manzil", desc: "10-column grid, daily tracking.", included: true },
          { label: "Hijri dates + Arabic RTL", desc: "System-wide Islamic calendar + Arabic support.", included: true },
        ]},
        { title: "LMS + assignments", icon: "📖", items: [
          { label: "Assignment management", desc: "Teachers create, students submit, teachers grade.", included: true },
          { label: "Online classes", desc: "Zoom/Meet/Teams integration — join from the portal.", included: true },
          { label: "Class recordings", desc: "Links to past class recordings.", included: true },
        ]},
        { title: "Security", icon: "🔒", items: [
          { label: "Two-factor auth (2FA)", desc: "TOTP — Google Authenticator / Authy / 1Password.", included: true },
          { label: "Granular permissions", desc: "Exact permission per staff member.", included: true },
          { label: "Audit logs", desc: "Who did what — full trail.", included: true },
        ]},
      ],
      notIncluded: [
        "Multi-branch (2+ campuses) — in Scale",
        "Custom domain — in Scale",
        "Public school website — in Scale",
        "24/7 phone support — in Scale",
        "Dedicated success manager — in Scale",
      ],
    },
    ur: {
      name: "Growth",
      tagline: "درمیانے سے بڑے ادارے · سب سے مقبول",
      badge: "MOST POPULAR",
      summary: "ہمارا سب سے مقبول پیکج — بنگلہ دیش کے ۸۰٪+ ادارے یہی منتخب کرتے ہیں۔ لامحدود طلباء، bKash/Nagad/SSLCommerz آن لائن ادائیگی، WhatsApp + Push نوٹیفکیشن، AI ڈراپ آؤٹ رسک، AI رپورٹ تبصرے — سب ایک ساتھ۔",
      whoFor: [
        "لامحدود طلباء — کسی بھی سائز کا ادارہ",
        "سرپرستوں سے آن لائن فیس وصول کرنا چاہتے ہیں",
        "WhatsApp پر خودکار اطلاع",
        "AI کے ذریعے بہتر فیصلے",
      ],
      bestValue: "۲،۰۰۰ ٹاکا ماہانہ = مارکیٹ میں اس فیچر سیٹ کی کم ترین قیمت۔ دیگر سافٹ ویئر اسی کے لیے ۵،۰۰۰+ لیتے ہیں۔",
      sections: [
        { title: "Starter کی ہر چیز +", icon: "🚀", items: [
          { label: "لامحدود طلباء", desc: "۵،۰۰۰ ہو یا ۵۰،۰۰۰ — کوئی حد نہیں۔", included: true },
          { label: "آن لائن پے منٹ گیٹ وے", desc: "bKash، Nagad، Rocket، SSLCommerz — سرپرست پورٹل سے براہ راست ادائیگی کریں۔", included: true },
          { label: "WhatsApp آٹو پیغام", desc: "Meta Cloud API کے ذریعے والدین کو۔", included: true },
          { label: "Push نوٹیفکیشن (Firebase)", desc: "فوری موبائل ایپ الرٹس۔", included: true },
          { label: "ای میل نوٹیفکیشن (Resend)", desc: "برانڈڈ پیشہ ورانہ ای میل۔", included: true },
          { label: "SMS کریڈٹ: ۵،۰۰۰/ماہ", desc: "Starter کا ۵ گنا۔", included: true },
          { label: "ترجیحی ای میل سپورٹ", desc: "۸ گھنٹوں میں جواب۔", included: true },
        ]},
        { title: "AI خصوصیات", icon: "🤖", items: [
          { label: "AI ڈراپ آؤٹ رسک تجزیہ", desc: "حاضری + مارکس + واجبات → فی طالب علم رسک اسکور + AI تجویز۔", included: true },
          { label: "AI رپورٹ تبصرے", desc: "ہر طالب علم کے نتیجے پر Claude AI کا اردو تبصرہ۔", included: true },
          { label: "سمارٹ SMS ٹیمپلیٹس", desc: "AI سے تیار ذاتی SMS۔", included: true },
          { label: "ہفتہ وار رسک اپڈیٹ", desc: "خودکار ہفتہ وار cron۔", included: true },
        ]},
        { title: "مدرسہ کی خصوصی خصوصیات", icon: "🕌", items: [
          { label: "حفظ ہیٹ میپ", desc: "۳۰ پارہ × طالب علم گرڈ۔", included: true },
          { label: "کتاب نصاب", desc: "۶ مراحل — ابتدائی سے تکمیل تک۔", included: true },
          { label: "روزانہ سبق-سبقی-منزل", desc: "۱۰ کالم گرڈ، روزانہ ٹریکنگ۔", included: true },
          { label: "ہجری تاریخیں + عربی RTL", desc: "مکمل اسلامی کیلنڈر + عربی سپورٹ۔", included: true },
        ]},
        { title: "LMS + اسائنمنٹس", icon: "📖", items: [
          { label: "اسائنمنٹ انتظام", desc: "استاد بناتا ہے، طالب علم جمع کرتا ہے، استاد گریڈ دیتا ہے۔", included: true },
          { label: "آن لائن کلاسز", desc: "Zoom/Meet/Teams انضمام۔", included: true },
          { label: "کلاس ریکارڈنگ", desc: "ماضی کی کلاسوں کا لنک۔", included: true },
        ]},
        { title: "سیکیورٹی", icon: "🔒", items: [
          { label: "دو عوامل تصدیق (2FA)", desc: "TOTP — Google Authenticator۔", included: true },
          { label: "درست اجازتیں", desc: "ہر عملے کے لیے مخصوص اجازتیں۔", included: true },
          { label: "آڈٹ لاگ", desc: "کس نے کیا کیا — مکمل ریکارڈ۔", included: true },
        ]},
      ],
      notIncluded: [
        "ملٹی برانچ (۲+ کیمپس) — Scale میں",
        "کسٹم ڈومین — Scale میں",
        "پبلک اسکول ویب سائٹ — Scale میں",
        "۲۴/۷ فون سپورٹ — Scale میں",
        "Dedicated success manager — Scale میں",
      ],
    },
    ar: {
      name: "Growth",
      tagline: "مؤسسات متوسطة إلى كبيرة · الأكثر شيوعًا",
      badge: "MOST POPULAR",
      summary: "باقتنا الأكثر شيوعًا — تختارها 80٪+ من المؤسسات في بنغلاديش. طلاب بلا حد، دفع bKash/Nagad/SSLCommerz، إشعارات WhatsApp + Push، تحليل مخاطر التسرب بالذكاء الاصطناعي، تعليقات تقارير AI — كلها معًا.",
      whoFor: [
        "طلاب بلا حد — مؤسسة بأي حجم",
        "تحصيل الرسوم من الأولياء عبر الإنترنت",
        "إشعار تلقائي عبر WhatsApp",
        "قرارات أذكى بالذكاء الاصطناعي",
      ],
      bestValue: "2,000 تاكا/شهر — أقل سعر لهذه المجموعة من الميزات في السوق. المنافسون يأخذون 5,000+ لنفس المجموعة.",
      sections: [
        { title: "كل شيء في Starter +", icon: "🚀", items: [
          { label: "طلاب بلا حد", desc: "5,000 أو 50,000 — بلا حد.", included: true },
          { label: "بوابة دفع عبر الإنترنت", desc: "bKash، Nagad، Rocket، SSLCommerz — الأولياء يدفعون مباشرة من البوابة.", included: true },
          { label: "مراسلة WhatsApp تلقائية", desc: "Meta Cloud API للآباء.", included: true },
          { label: "إشعارات Push (Firebase)", desc: "تنبيهات فورية في تطبيق الموبايل.", included: true },
          { label: "إشعارات البريد (Resend)", desc: "بريد احترافي مع العلامة.", included: true },
          { label: "رصيد SMS: 5,000/شهر", desc: "5× باقة Starter.", included: true },
          { label: "دعم بريدي ذو أولوية", desc: "رد خلال 8 ساعات.", included: true },
        ]},
        { title: "ميزات AI", icon: "🤖", items: [
          { label: "تحليل مخاطر التسرب", desc: "الحضور + الدرجات + المستحقات → درجة مخاطر لكل طالب + اقتراح AI.", included: true },
          { label: "تعليقات تقارير AI", desc: "تعليق Claude AI على نتيجة كل طالب.", included: true },
          { label: "قوالب SMS ذكية", desc: "SMS شخصية من إنشاء AI — تذكيرات، غياب.", included: true },
          { label: "إعادة حساب أسبوعي", desc: "cron أسبوعي تلقائي.", included: true },
        ]},
        { title: "ميزات المدرسة الدينية", icon: "🕌", items: [
          { label: "خريطة حرارية للحفظ", desc: "شبكة 30 جزء × طالب.", included: true },
          { label: "منهج الكتاب", desc: "6 مراحل — من الابتدائي إلى التكميل.", included: true },
          { label: "السبق والسبقي والمنزل اليومي", desc: "شبكة 10 أعمدة، تتبع يومي.", included: true },
          { label: "تواريخ هجرية + RTL عربي", desc: "تقويم إسلامي + دعم عربي كامل.", included: true },
        ]},
        { title: "LMS + واجبات", icon: "📖", items: [
          { label: "إدارة الواجبات", desc: "المعلم ينشئ، الطالب يسلم، المعلم يصحح.", included: true },
          { label: "حصص أونلاين", desc: "تكامل Zoom/Meet/Teams.", included: true },
          { label: "تسجيلات الحصص", desc: "روابط حصص سابقة.", included: true },
        ]},
        { title: "الأمان", icon: "🔒", items: [
          { label: "المصادقة الثنائية (2FA)", desc: "TOTP — Google Authenticator.", included: true },
          { label: "صلاحيات دقيقة", desc: "صلاحيات محددة لكل موظف.", included: true },
          { label: "سجلات التدقيق", desc: "من فعل ماذا — سجل كامل.", included: true },
        ]},
      ],
      notIncluded: [
        "فروع متعددة (2+ حرم) — في Scale",
        "نطاق مخصص — في Scale",
        "موقع مدرسة عام — في Scale",
        "دعم هاتفي 24/7 — في Scale",
        "مدير نجاح مخصص — في Scale",
      ],
    },
  },
  scale: {
    bn: {
      name: "Scale",
      tagline: "এন্টারপ্রাইজ · মাল্টি-ব্রাঞ্চ · dedicated সাপোর্ট",
      summary: "বড় প্রতিষ্ঠানের জন্য designed — একাধিক campus/branch, নিজস্ব ডোমেইন (yourschool.edu.bd), পাবলিক ওয়েবসাইট, SMS ক্রেডিট ২০,০০০/মাস, ২৪/৭ ফোন সাপোর্ট, এবং একজন dedicated success manager যিনি আপনার প্রতিষ্ঠানকে জানেন।",
      whoFor: [
        "Multi-campus প্রতিষ্ঠান (২+ branch)",
        "যারা নিজস্ব domain চান (yourschool.edu.bd)",
        "Enterprise-grade সাপোর্ট প্রয়োজন",
        "পাবলিক ওয়েবসাইট দিয়ে ভর্তি আবেদন নিতে চান",
      ],
      bestValue: "একটি multi-campus প্রতিষ্ঠান সাধারণত প্রতি branch-এ আলাদা software ব্যবহার করে ৳৫,০০০-১০,০০০ খরচ করে। Scale-এ unified system মাত্র ৳৪,০০০।",
      sections: [
        { title: "Growth-এর সব কিছু +", icon: "🏢", items: [
          { label: "মাল্টি-ব্রাঞ্চ সাপোর্ট", desc: "সীমাহীন campus/branch একই অ্যাকাউন্টে। প্রতিটি branch-এর আলাদা admin, staff, students।", included: true },
          { label: "Branch switcher", desc: "Navbar থেকে এক ক্লিকে branch switch।", included: true },
          { label: "Cross-branch reports", desc: "সকল branch-এর combined + individual report।", included: true },
          { label: "Super admin ড্যাশবোর্ড", desc: "সকল branch-এর overview, comparison, management।", included: true },
        ]},
        { title: "কাস্টম ব্র্যান্ডিং", icon: "🌐", items: [
          { label: "কাস্টম ডোমেইন", desc: "yourschool.edu.bd → আপনার পোর্টাল। আমাদের hosting, আপনার URL।", included: true },
          { label: "পাবলিক স্কুল ওয়েবসাইট", desc: "/s/your-slug → আপনার প্রতিষ্ঠানের public homepage (নোটিশ, ভর্তি, contact)।", included: true },
          { label: "Logo + color customization", desc: "আপনার ব্র্যান্ড কালার অনুযায়ী theme।", included: true },
          { label: "Branded emails + SMS", desc: "সকল communication-এ আপনার প্রতিষ্ঠানের নাম।", included: true },
        ]},
        { title: "এন্টারপ্রাইজ সাপোর্ট", icon: "🛟", items: [
          { label: "২৪/৭ ফোন সাপোর্ট", desc: "দিন/রাত যে কোনো সময় — urgent issue? এক কল।", included: true },
          { label: "WhatsApp instant response", desc: "১৫ মিনিটের মধ্যে reply, working hours-এ।", included: true },
          { label: "Dedicated success manager", desc: "একজন account manager যিনি আপনার প্রতিষ্ঠানকে জানেন।", included: true },
          { label: "Monthly review call", desc: "প্রতি মাসে ৩০ মিনিটের call — KPI review, feature requests।", included: true },
          { label: "Custom onboarding", desc: "In-person বা remote setup সাপোর্ট।", included: true },
          { label: "Priority feature requests", desc: "আপনার feature request roadmap-এ priority পাবে।", included: true },
        ]},
        { title: "বড় volume", icon: "📦", items: [
          { label: "SMS ক্রেডিট: ২০,০০০/মাস", desc: "Growth-এর ৪ গুণ।", included: true },
          { label: "Storage: ১০০ GB", desc: "ছাত্রদের ডকুমেন্ট, ছবি, সার্টিফিকেট।", included: true },
          { label: "API access", desc: "আপনার অন্য system-এ integration।", included: true },
          { label: "Custom reports", desc: "Your specific report on demand — dev team তৈরি করে দেয়।", included: true },
        ]},
      ],
      notIncluded: [
        "Extra SMS: ২০,০০০-এর বেশি লাগলে extra কিনতে হবে",
        "Hardware (biometric attendance device) — আলাদা কিনতে হবে",
        "Physical on-site training (remote ফ্রি)",
      ],
    },
    en: {
      name: "Scale",
      tagline: "Enterprise · multi-branch · dedicated support",
      summary: "Designed for large institutions — multiple campuses/branches, your own domain (yourschool.edu.bd), a public website, 20,000 SMS/month, 24/7 phone support, and a dedicated success manager who knows your institution.",
      whoFor: [
        "Multi-campus institutions (2+ branches)",
        "Want your own domain (yourschool.edu.bd)",
        "Need enterprise-grade support",
        "Accept admissions via a public website",
      ],
      bestValue: "A multi-campus institution usually spends ৳5,000-10,000 across separate software per branch. Scale gives you a unified system for just ৳4,000.",
      sections: [
        { title: "Everything in Growth +", icon: "🏢", items: [
          { label: "Multi-branch support", desc: "Unlimited campuses/branches on one account. Each branch has its own admins, staff, students.", included: true },
          { label: "Branch switcher", desc: "Switch branch with one click in the navbar.", included: true },
          { label: "Cross-branch reports", desc: "Combined and individual reports across all branches.", included: true },
          { label: "Super admin dashboard", desc: "Overview, comparison, and management for every branch.", included: true },
        ]},
        { title: "Custom branding", icon: "🌐", items: [
          { label: "Custom domain", desc: "yourschool.edu.bd → your portal. Our hosting, your URL.", included: true },
          { label: "Public school website", desc: "/s/your-slug → your institution's public homepage (notices, admissions, contact).", included: true },
          { label: "Logo + color customization", desc: "Theme matched to your brand colors.", included: true },
          { label: "Branded emails + SMS", desc: "Every communication carries your institution's name.", included: true },
        ]},
        { title: "Enterprise support", icon: "🛟", items: [
          { label: "24/7 phone support", desc: "Day or night — urgent issue? One call.", included: true },
          { label: "WhatsApp instant response", desc: "Reply within 15 minutes in working hours.", included: true },
          { label: "Dedicated success manager", desc: "An account manager who knows your institution.", included: true },
          { label: "Monthly review call", desc: "30-minute monthly call — KPI review, feature requests.", included: true },
          { label: "Custom onboarding", desc: "In-person or remote setup support.", included: true },
          { label: "Priority feature requests", desc: "Your requests get priority on the roadmap.", included: true },
        ]},
        { title: "High volume", icon: "📦", items: [
          { label: "SMS credit: 20,000/month", desc: "4× Growth.", included: true },
          { label: "Storage: 100 GB", desc: "Student documents, photos, certificates.", included: true },
          { label: "API access", desc: "Integrate with your other systems.", included: true },
          { label: "Custom reports", desc: "Any specific report on demand — our dev team builds it.", included: true },
        ]},
      ],
      notIncluded: [
        "Extra SMS beyond 20,000 must be purchased",
        "Hardware (biometric attendance device) — purchased separately",
        "Physical on-site training (remote is free)",
      ],
    },
    ur: {
      name: "Scale",
      tagline: "انٹرپرائز · ملٹی برانچ · مخصوص سپورٹ",
      summary: "بڑے اداروں کے لیے — ایک سے زائد کیمپس/برانچز، اپنا ڈومین (yourschool.edu.bd)، عوامی ویب سائٹ، ۲۰،۰۰۰ SMS ماہانہ، ۲۴/۷ فون سپورٹ، اور ایک وقف ڈیڈیکیٹڈ سکسیس مینیجر۔",
      whoFor: [
        "ملٹی کیمپس ادارے (۲+ برانچ)",
        "جو اپنا ڈومین چاہتے ہیں (yourschool.edu.bd)",
        "انٹرپرائز گریڈ سپورٹ چاہیے",
        "عوامی ویب سائٹ سے داخلہ قبول کرنا",
      ],
      bestValue: "ملٹی کیمپس ادارہ عموماً ہر برانچ پر الگ سافٹ ویئر کے لیے ۵،۰۰۰-۱۰،۰۰۰ ٹاکا خرچ کرتا ہے۔ Scale میں یکجا سسٹم صرف ۴،۰۰۰ ٹاکا۔",
      sections: [
        { title: "Growth کی ہر چیز +", icon: "🏢", items: [
          { label: "ملٹی برانچ سپورٹ", desc: "ایک اکاؤنٹ پر لامحدود کیمپس/برانچ۔ ہر برانچ کے الگ ایڈمن، عملہ، طلباء۔", included: true },
          { label: "برانچ سوئچر", desc: "نیو بار سے ایک کلک میں برانچ تبدیل کریں۔", included: true },
          { label: "کراس برانچ رپورٹس", desc: "سب برانچز کی مشترکہ + انفرادی رپورٹ۔", included: true },
          { label: "سپر ایڈمن ڈیش بورڈ", desc: "سب برانچز کا جائزہ، موازنہ، انتظام۔", included: true },
        ]},
        { title: "کسٹم برانڈنگ", icon: "🌐", items: [
          { label: "کسٹم ڈومین", desc: "yourschool.edu.bd → آپ کی پورٹل۔", included: true },
          { label: "عوامی اسکول ویب سائٹ", desc: "/s/your-slug → عوامی ہوم پیج (نوٹس، داخلہ، رابطہ)۔", included: true },
          { label: "لوگو + رنگ حسب ضرورت", desc: "آپ کے برانڈ رنگوں کے مطابق تھیم۔", included: true },
          { label: "برانڈڈ ای میل + SMS", desc: "ہر رابطے میں آپ کے ادارے کا نام۔", included: true },
        ]},
        { title: "انٹرپرائز سپورٹ", icon: "🛟", items: [
          { label: "۲۴/۷ فون سپورٹ", desc: "دن یا رات — ایک کال۔", included: true },
          { label: "WhatsApp فوری جواب", desc: "دفتری اوقات میں ۱۵ منٹ میں۔", included: true },
          { label: "Dedicated success manager", desc: "ایک اکاؤنٹ مینیجر جو آپ کا ادارہ جانتا ہے۔", included: true },
          { label: "ماہانہ جائزہ کال", desc: "ہر ماہ ۳۰ منٹ کی کال۔", included: true },
          { label: "کسٹم آن بورڈنگ", desc: "شخصی یا ریموٹ سیٹ اپ سپورٹ۔", included: true },
          { label: "ترجیحی فیچر درخواستیں", desc: "روڈ میپ پر ترجیح۔", included: true },
        ]},
        { title: "بڑا والیوم", icon: "📦", items: [
          { label: "SMS کریڈٹ: ۲۰،۰۰۰/ماہ", desc: "Growth کا ۴ گنا۔", included: true },
          { label: "اسٹوریج: ۱۰۰ GB", desc: "طلباء کی دستاویزات، تصاویر، اسناد۔", included: true },
          { label: "API رسائی", desc: "آپ کے دیگر سسٹمز کے ساتھ انضمام۔", included: true },
          { label: "کسٹم رپورٹس", desc: "ڈیو ٹیم آپ کی درخواست پر بناتی ہے۔", included: true },
        ]},
      ],
      notIncluded: [
        "۲۰،۰۰۰ سے زائد SMS اضافی خریدنا",
        "ہارڈ ویئر (بایومیٹرک حاضری ڈیوائس) — الگ خریدنا",
        "جسمانی آن سائٹ ٹریننگ (ریموٹ مفت)",
      ],
    },
    ar: {
      name: "Scale",
      tagline: "المؤسسات · فروع متعددة · دعم مخصص",
      summary: "مصممة للمؤسسات الكبيرة — حرم/فروع متعددة، نطاقك الخاص (yourschool.edu.bd)، موقع عام، 20,000 SMS شهريًا، دعم هاتفي 24/7، ومدير نجاح مخصص يعرف مؤسستك.",
      whoFor: [
        "مؤسسات متعددة الحرم (2+ فروع)",
        "ترغب في نطاق خاص (yourschool.edu.bd)",
        "تحتاج دعمًا على مستوى المؤسسات",
        "قبول الطلاب عبر موقع عام",
      ],
      bestValue: "عادةً ما تنفق مؤسسة متعددة الحرم 5,000-10,000 تاكا على برامج منفصلة لكل فرع. Scale يمنحك نظامًا موحدًا بـ 4,000 تاكا فقط.",
      sections: [
        { title: "كل شيء في Growth +", icon: "🏢", items: [
          { label: "دعم متعدد الفروع", desc: "فروع بلا حد في حساب واحد. لكل فرع مشرفوه وموظفوه وطلابه.", included: true },
          { label: "تبديل الفرع", desc: "بدّل الفرع بنقرة من شريط التنقل.", included: true },
          { label: "تقارير عبر الفروع", desc: "تقارير موحدة وفردية لكل الفروع.", included: true },
          { label: "لوحة المشرف العام", desc: "نظرة ومقارنة وإدارة لكل الفروع.", included: true },
        ]},
        { title: "العلامة المخصصة", icon: "🌐", items: [
          { label: "نطاق مخصص", desc: "yourschool.edu.bd → بوابتك. استضافتنا، نطاقك.", included: true },
          { label: "موقع مدرسة عام", desc: "/s/your-slug → الصفحة العامة (إعلانات، قبول، اتصال).", included: true },
          { label: "تخصيص الشعار + الألوان", desc: "موضوع يتطابق مع ألوان علامتك.", included: true },
          { label: "بريد + SMS بعلامتك", desc: "كل رسالة تحمل اسم مؤسستك.", included: true },
        ]},
        { title: "دعم المؤسسات", icon: "🛟", items: [
          { label: "دعم هاتفي 24/7", desc: "نهارًا أو ليلًا — مشكلة عاجلة؟ مكالمة واحدة.", included: true },
          { label: "رد WhatsApp فوري", desc: "خلال 15 دقيقة في أوقات العمل.", included: true },
          { label: "مدير نجاح مخصص", desc: "مدير حساب يعرف مؤسستك.", included: true },
          { label: "مكالمة مراجعة شهرية", desc: "30 دقيقة شهريًا — KPI وطلبات ميزات.", included: true },
          { label: "إعداد مخصص", desc: "دعم إعداد حضوري أو عن بُعد.", included: true },
          { label: "طلبات ميزات ذات أولوية", desc: "طلباتك تحصل على أولوية على خارطة الطريق.", included: true },
        ]},
        { title: "حجم كبير", icon: "📦", items: [
          { label: "رصيد SMS: 20,000/شهر", desc: "4× Growth.", included: true },
          { label: "تخزين: 100 GB", desc: "وثائق الطلاب، الصور، الشهادات.", included: true },
          { label: "وصول API", desc: "التكامل مع أنظمتك الأخرى.", included: true },
          { label: "تقارير مخصصة", desc: "فريق التطوير يبني التقارير المطلوبة.", included: true },
        ]},
      ],
      notIncluded: [
        "SMS إضافي فوق 20,000 يُشترى",
        "الأجهزة (جهاز حضور بيومتري) — تُشترى منفصلة",
        "التدريب الحضوري (الريموت مجاني)",
      ],
    },
  },
};

export function getPackageDetailCopy(slug: PackageSlug, locale: Locale): LocalizedPackageDetail {
  return packageDetails[slug][locale] ?? packageDetails[slug].bn;
}

// ─── /register-school ─────────────────────────────────────────────────────

export type RegisterPageCopy = {
  metaTitle: string;
  heading: string;
  subtitle: string;
  perks: string[];
  // Form
  schoolInfoLegend: string;
  adminInfoLegend: string;
  schoolNameBnLabel: string;
  schoolNameBnPlaceholder: string;
  schoolNameEnLabel: string;
  schoolNameEnPlaceholder: string;
  schoolTypeLabel: string;
  schoolTypeSchool: string;
  schoolTypeMadrasa: string;
  schoolTypeBoth: string;
  eiinLabel: string;
  adminNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  passwordLabel: string;
  submitIdle: string;
  submitPending: string;
  termsNote: string;
  registerSuccessFallback: string;
  haveAccount: string;
  loginLink: string;
};

const registerPage: Record<Locale, RegisterPageCopy> = {
  bn: {
    metaTitle: "স্কুল রেজিস্টার করুন",
    heading: "ফ্রি ট্রায়াল শুরু",
    subtitle: "৫ মিনিটে সেটআপ · কোন কার্ড লাগবে না",
    perks: [
      "১৫ দিনের ফ্রি ট্রায়াল",
      "কোন ক্রেডিট কার্ড লাগবে না",
      "সম্পূর্ণ access — সব ফিচার",
      "৫ মিনিটে সেটআপ",
    ],
    schoolInfoLegend: "স্কুলের তথ্য",
    adminInfoLegend: "অ্যাডমিনের তথ্য",
    schoolNameBnLabel: "স্কুলের নাম (বাংলা)",
    schoolNameBnPlaceholder: "যেমন: দারুল উলুম কওমী মাদ্রাসা",
    schoolNameEnLabel: "School name (English, optional)",
    schoolNameEnPlaceholder: "e.g. Darul Uloom Qawmi Madrasa",
    schoolTypeLabel: "প্রতিষ্ঠানের ধরন",
    schoolTypeSchool: "স্কুল",
    schoolTypeMadrasa: "মাদ্রাসা",
    schoolTypeBoth: "স্কুল + মাদ্রাসা",
    eiinLabel: "EIIN (ঐচ্ছিক)",
    adminNameLabel: "আপনার নাম",
    emailLabel: "ইমেইল",
    phoneLabel: "ফোন (ঐচ্ছিক)",
    passwordLabel: "পাসওয়ার্ড (৮+ অক্ষর)",
    submitIdle: "স্কুল তৈরি করুন",
    submitPending: "তৈরি হচ্ছে...",
    termsNote: "রেজিস্টার করে আপনি আমাদের Terms ও Privacy Policy-তে সম্মত হচ্ছেন।",
    registerSuccessFallback: "রেজিস্ট্রেশন সফল!",
    haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    loginLink: "লগইন করুন →",
  },
  en: {
    metaTitle: "Register your school",
    heading: "Start free trial",
    subtitle: "Setup in 5 minutes · No card required",
    perks: [
      "15-day free trial",
      "No credit card needed",
      "Full access — every feature",
      "Setup in 5 minutes",
    ],
    schoolInfoLegend: "School information",
    adminInfoLegend: "Admin information",
    schoolNameBnLabel: "School name (Bangla)",
    schoolNameBnPlaceholder: "e.g. দারুল উলুম কওমী মাদ্রাসা",
    schoolNameEnLabel: "School name (English, optional)",
    schoolNameEnPlaceholder: "e.g. Darul Uloom Qawmi Madrasa",
    schoolTypeLabel: "Institution type",
    schoolTypeSchool: "School",
    schoolTypeMadrasa: "Madrasa",
    schoolTypeBoth: "School + Madrasa",
    eiinLabel: "EIIN (optional)",
    adminNameLabel: "Your name",
    emailLabel: "Email",
    phoneLabel: "Phone (optional)",
    passwordLabel: "Password (8+ characters)",
    submitIdle: "Create school",
    submitPending: "Creating...",
    termsNote: "By registering you agree to our Terms and Privacy Policy.",
    registerSuccessFallback: "Registration successful!",
    haveAccount: "Already have an account?",
    loginLink: "Log in →",
  },
  ur: {
    metaTitle: "اپنے اسکول کا اندراج کریں",
    heading: "مفت ٹرائل شروع کریں",
    subtitle: "5 منٹ میں سیٹ اپ · کارڈ کی ضرورت نہیں",
    perks: [
      "15 دن کا مفت ٹرائل",
      "کریڈٹ کارڈ کی ضرورت نہیں",
      "مکمل رسائی — ہر فیچر",
      "5 منٹ میں سیٹ اپ",
    ],
    schoolInfoLegend: "اسکول کی معلومات",
    adminInfoLegend: "ایڈمن کی معلومات",
    schoolNameBnLabel: "اسکول کا نام (بنگلہ)",
    schoolNameBnPlaceholder: "مثال: دارالعلوم قومی مدرسہ",
    schoolNameEnLabel: "اسکول کا نام (انگریزی، اختیاری)",
    schoolNameEnPlaceholder: "e.g. Darul Uloom Qawmi Madrasa",
    schoolTypeLabel: "ادارے کی قسم",
    schoolTypeSchool: "اسکول",
    schoolTypeMadrasa: "مدرسہ",
    schoolTypeBoth: "اسکول + مدرسہ",
    eiinLabel: "EIIN (اختیاری)",
    adminNameLabel: "آپ کا نام",
    emailLabel: "ای میل",
    phoneLabel: "فون (اختیاری)",
    passwordLabel: "پاس ورڈ (8+ حروف)",
    submitIdle: "اسکول بنائیں",
    submitPending: "بنایا جا رہا ہے...",
    termsNote: "اندراج کرنے سے آپ ہماری شرائط اور پرائیویسی پالیسی سے متفق ہیں۔",
    registerSuccessFallback: "اندراج کامیاب!",
    haveAccount: "پہلے سے اکاؤنٹ ہے؟",
    loginLink: "لاگ ان کریں →",
  },
  ar: {
    metaTitle: "سجّل مدرستك",
    heading: "ابدأ النسخة التجريبية المجانية",
    subtitle: "الإعداد خلال 5 دقائق · بدون بطاقة",
    perks: [
      "تجربة مجانية 15 يومًا",
      "بدون بطاقة ائتمان",
      "وصول كامل — جميع الميزات",
      "الإعداد خلال 5 دقائق",
    ],
    schoolInfoLegend: "معلومات المدرسة",
    adminInfoLegend: "معلومات المسؤول",
    schoolNameBnLabel: "اسم المدرسة (بنغالي)",
    schoolNameBnPlaceholder: "مثال: دار العلوم القومي المدرسة",
    schoolNameEnLabel: "اسم المدرسة (إنجليزي، اختياري)",
    schoolNameEnPlaceholder: "e.g. Darul Uloom Qawmi Madrasa",
    schoolTypeLabel: "نوع المؤسسة",
    schoolTypeSchool: "مدرسة عامة",
    schoolTypeMadrasa: "مدرسة دينية",
    schoolTypeBoth: "مدرسة عامة + دينية",
    eiinLabel: "EIIN (اختياري)",
    adminNameLabel: "اسمك",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف (اختياري)",
    passwordLabel: "كلمة المرور (8+ أحرف)",
    submitIdle: "إنشاء المدرسة",
    submitPending: "جاري الإنشاء...",
    termsNote: "بالتسجيل فإنك توافق على شروط الخدمة وسياسة الخصوصية.",
    registerSuccessFallback: "تم التسجيل بنجاح!",
    haveAccount: "هل لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول ←",
  },
};

export function getRegisterPageCopy(locale: Locale): RegisterPageCopy {
  return registerPage[locale] ?? registerPage.bn;
}
