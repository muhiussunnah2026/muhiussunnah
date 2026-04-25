import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Sparkles,
  Handshake,
  TrendingUp,
  Users,
  CheckCircle2,
  Crown,
  Rocket,
  Heart,
  Trophy,
  Target,
  Wallet,
  Building2,
  PhoneCall,
  Mail,
  School,
  GraduationCap,
  BookOpenText,
  Library,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { EarningsCalculator } from "./earnings-calculator";

export const metadata: Metadata = {
  title: "Be a Partner — Earn 50% lifetime",
  description:
    "Join Muhius Sunnah's affiliate partner program. 50/50 revenue share for life on every school you onboard. Bangladesh's #1 madrasa & school management software.",
  alternates: { canonical: "/be-a-partner" },
  openGraph: {
    type: "website",
    siteName: "Muhius Sunnah",
    title: "Be a Partner · Earn 50% Lifetime · Muhius Sunnah",
    description:
      "50/50 lifetime revenue share. Onboard 500 schools, earn ৳15+ lakh/year recurring. Bangladesh's #1 madrasa & school management software.",
    url: "/be-a-partner",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Be a Partner · Muhius Sunnah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Be a Partner · Earn 50% Lifetime · Muhius Sunnah",
    description:
      "50/50 lifetime revenue share. Onboard 500 schools, earn ৳15+ lakh/year recurring.",
    images: ["/opengraph-image"],
  },
};

type Strings = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trust1: string;
    trust2: string;
    trust3: string;
  };
  stats: { label: string; value: string }[];
  why: {
    title: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  math: {
    title: string;
    subtitle: string;
  };
  steps: {
    title: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  perks: {
    title: string;
    items: string[];
  };
  cta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    contactNote: string;
  };
};

const COPY: Record<Locale, Strings> = {
  bn: {
    hero: {
      eyebrow: "অ্যাফিলিয়েট পার্টনার প্রোগ্রাম",
      title: "মেহনত করুন,",
      titleAccent: "আজীবন আয় করুন",
      subtitle:
        "বাংলাদেশে ২ লাখেরও বেশি শিক্ষাপ্রতিষ্ঠান — প্রাইমারি স্কুল, মাদ্রাসা, কলেজ, কোচিং সেন্টার। আজ থেকে কাজ শুরু হোক যেন এই ২ লাখের মধ্যে অন্তত ৫০০ প্রতিষ্ঠানের কাছে Muhius Sunnah পৌঁছে দিতে পারি — কেল্লা ফতে, প্রতি মাসে ১.২৫ লাখ টাকা রিকারিং। আরো manage করতে পারলে আরো বেশি earn।",
      primaryCta: "এখনই পার্টনার হোন",
      secondaryCta: "হিসাব করে দেখুন",
      trust1: "৫০/৫০ লাইফটাইম শেয়ার",
      trust2: "কোন এন্ট্রি ফি নেই",
      trust3: "মাসিক পেমেন্ট",
    },
    stats: [
      { label: "অ্যাফিলিয়েট কমিশন", value: "৫০%" },
      { label: "বার্ষিক সম্ভাব্য আয়", value: "১৫ লাখ+ টাকা" },
      { label: "মাসিক আয়", value: "১.২৫ লাখ টাকা" },
      { label: "প্রতি ছাত্র খরচ", value: "মাত্র ২ টাকা" },
    ],
    why: {
      title: "কেন এটাই সেরা সুযোগ",
      subtitle: "অন্য সব affiliate program একবার commission দেয়, আমরা আজীবন",
      items: [
        {
          title: "আজীবন রিকারিং রেভিনিউ",
          body: "আপনার আনা স্কুল যত মাস সাবস্ক্রিপশন রাখবে — তত মাস আপনি ৫০% পাবেন। একটিবার রেফার করলেই আজীবন আয়।",
        },
        {
          title: "সহজ পণ্য, সহজ বিক্রি",
          body: "একবার ব্যবহার করলেই বার বার ব্যবহার করবে। ৫০০ ছাত্রের মাদ্রাসায় প্রতি ছাত্রের জন্য মাত্র ২ টাকা — কেউ বের হবে না।",
        },
        {
          title: "সঠিক টাইমিং, সঠিক বাজার",
          body: "বাংলাদেশের প্রতিটি অলিতে গলিতে স্কুল-মাদ্রাসা। যারা এখনও ম্যানুয়াল কাজ করছেন। প্রথম ৫০০ পার্টনার সবচেয়ে বেশি লাভ পাবেন।",
        },
        {
          title: "পূর্ণ সাপোর্ট আমাদের",
          body: "আপনি শুধু পরিচয় করিয়ে দিন। ডেমো, সেটআপ, ট্রেনিং, সাপোর্ট — সব আমাদের টিম সামলাবে। আপনি কমিশন উপভোগ করবেন।",
        },
      ],
    },
    math: {
      title: "একটু হিসাব করি, ইনশাআল্লাহ চোখ খুলবে",
      subtitle:
        "৫০০ মাদ্রাসা টার্গেট করুন। সবচেয়ে কম দামি Starter প্ল্যান (৳১,০০০/মাস)। মাত্র ৬ মাসে আপনি যা পাবেন:",
    },
    steps: {
      title: "শুরু করা ৩ ধাপে",
      subtitle: "আজকেই apply করুন, কালকে থেকে আয় শুরু",
      items: [
        {
          title: "আবেদন করুন",
          body: "নিচের ফর্ম পূরণ করুন বা সরাসরি কল করুন। ১-২ দিনের মধ্যে আমাদের টিম আপনার সাথে যোগাযোগ করবে।",
        },
        {
          title: "পার্টনার ID + লিংক পান",
          body: "অনুমোদনের পর আপনি পাবেন ইউনিক রেফারেল লিংক, প্রমোশনাল ম্যাটেরিয়াল, ডেমো ভিডিও — সবকিছু।",
        },
        {
          title: "মাসিক পেমেন্ট",
          body: "প্রতি মাসের ৭ তারিখে আগের মাসের কমিশন আপনার বিকাশ/ব্যাংক একাউন্টে। কোন delay নেই, কোন ছাড় নেই।",
        },
      ],
    },
    perks: {
      title: "পার্টনার সুবিধা",
      items: [
        "৫০% লাইফটাইম রিকারিং কমিশন",
        "সাপ্তাহিক সেলস ট্রেনিং",
        "প্রিমিয়াম প্রমোশনাল ম্যাটেরিয়াল",
        "ডেডিকেটেড পার্টনার ম্যানেজার",
        "প্রতি মাসে real-time dashboard",
        "টপ পার্টনারদের জন্য বিশেষ বোনাস",
        "ফ্রি WhatsApp + Phone সাপোর্ট",
        "Quarterly performance review + growth plan",
      ],
    },
    cta: {
      title: "এই সুযোগ দ্বিতীয়বার আসবে না",
      subtitle:
        "প্রথম ১০০ পার্টনার পাবে অতিরিক্ত ৫% বোনাস (মোট ৫৫%) প্রথম ১ বছর পর্যন্ত। আজই শুরু করুন।",
      primary: "এখনই শুরু করুন",
      secondary: "ফোনে কথা বলুন",
      contactNote: "অথবা সরাসরি কল করুন",
    },
  },
  en: {
    hero: {
      eyebrow: "AFFILIATE PARTNER PROGRAM",
      title: "Work hard once,",
      titleAccent: "earn for life",
      subtitle:
        "Bangladesh has 2 lakh+ educational institutions — primary schools, madrasas, colleges, coaching centers. Start today and reach just 500 of them with Muhius Sunnah — that's ৳1.25 lakh/month recurring. Onboard more, earn more. The ceiling is yours.",
      primaryCta: "Become a partner",
      secondaryCta: "See the math",
      trust1: "50/50 lifetime split",
      trust2: "No entry fee",
      trust3: "Monthly payouts",
    },
    stats: [
      { label: "Affiliate commission", value: "50%" },
      { label: "Yearly potential earning", value: "৳15 lakh+" },
      { label: "Monthly income", value: "৳1.25 lakh" },
      { label: "Per-student cost", value: "৳2 only" },
    ],
    why: {
      title: "Why this is the deal of a lifetime",
      subtitle: "Every other affiliate program pays once. We pay forever.",
      items: [
        {
          title: "Lifetime recurring revenue",
          body: "As long as the school you referred keeps their subscription, you keep getting 50%. Refer once. Earn forever.",
        },
        {
          title: "Easy product, easy sale",
          body: "Once they use it, they stay. ৳1,000/month for a 500-student madrasa is just ৳2 per student. Impossible to leave.",
        },
        {
          title: "Right timing, right market",
          body: "Every neighborhood has institutions still doing things by hand. The first 500 partners will earn the most.",
        },
        {
          title: "We handle everything",
          body: "Just make the introduction. Demo, setup, training, support — our team takes it from there. You enjoy the commission.",
        },
      ],
    },
    math: {
      title: "A little math will open your eyes, inshaa Allah",
      subtitle:
        "Target 500 madrasas on the cheapest Starter plan (৳1,000/month). Here's your earning in just 6 months:",
    },
    steps: {
      title: "Get started in 3 steps",
      subtitle: "Apply today, start earning tomorrow",
      items: [
        {
          title: "Apply",
          body: "Fill out the form below or call us directly. Our team will respond within 1–2 business days.",
        },
        {
          title: "Get your partner ID + link",
          body: "Once approved, you receive a unique referral link, promotional materials, demo videos — everything you need.",
        },
        {
          title: "Get paid monthly",
          body: "Every month on the 7th, your previous month's commission lands in your bKash / bank account. Zero delay.",
        },
      ],
    },
    perks: {
      title: "Partner perks",
      items: [
        "50% lifetime recurring commission",
        "Weekly sales training calls",
        "Premium promotional kit",
        "Dedicated partner manager",
        "Real-time monthly dashboard",
        "Bonuses for top performers",
        "Free WhatsApp + phone support",
        "Quarterly performance + growth review",
      ],
    },
    cta: {
      title: "This window won't be open twice",
      subtitle:
        "The first 100 partners get a 5% bonus (total 55%) for their first year. Start today.",
      primary: "Start now",
      secondary: "Talk to us",
      contactNote: "Or call us directly",
    },
  },
};

export default async function BeAPartnerPage() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = COPY[locale];

  const whyIcons = [Heart, Sparkles, Target, Handshake];
  const stepIcons = [Rocket, Crown, Trophy];

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        {/* ═══════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden mesh-bg-1 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="aurora-beam" aria-hidden />
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -top-20 start-[10%] size-96 rounded-full bg-primary/30 blur-[120px]" />
            <div className="absolute top-[20%] end-[5%] size-[28rem] rounded-full bg-accent/25 blur-[140px]" />
            <div className="absolute bottom-0 start-[40%] size-80 rounded-full bg-secondary/20 blur-[110px]" />
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 text-center md:px-8">
            <Reveal variant="blur-in">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 px-4 py-1.5 text-primary">
                <Handshake className="me-1.5 size-3.5" />
                {t.hero.eyebrow}
              </Badge>
            </Reveal>

            <Reveal variant="fade-up" delay={150}>
              <h1 className="mt-5 text-4xl font-bold tracking-tight leading-[1.05] md:text-6xl lg:text-7xl">
                {t.hero.title}{" "}
                <span className="text-gradient-primary animate-gradient">{t.hero.titleAccent}</span>
              </h1>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground md:text-lg leading-relaxed">
                {t.hero.subtitle}
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={450}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/contact"
                  className={
                    buttonVariants({ size: "lg" }) +
                    " group bg-gradient-primary animate-gradient text-white text-base px-8 shadow-2xl shadow-primary/40 hover:shadow-primary/60"
                  }
                >
                  {t.hero.primaryCta}
                  <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#calculator"
                  className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-8"}
                >
                  {t.hero.secondaryCta}
                </a>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={600}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {t.hero.trust1}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {t.hero.trust2}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  {t.hero.trust3}
                </span>
              </div>
            </Reveal>

            {/* Stats row */}
            <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {t.stats.map((s, i) => (
                <Reveal key={i} variant="scale-in" delay={i * 100}>
                  <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 backdrop-blur-sm md:p-5">
                    <div className="text-2xl font-bold text-gradient-primary md:text-3xl">{s.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            50/50 SPLIT VISUAL
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 border-y border-border/40 bg-muted/10">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Partner side */}
              <Reveal variant="slide-right">
                <div className="relative h-full overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-8 shadow-2xl shadow-primary/15">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-lg">
                      <Wallet className="size-6" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                        {locale === "en" ? "You" : "আপনি"}
                      </div>
                      <div className="text-xl font-bold">
                        {locale === "en" ? "Partner" : "পার্টনার"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-7xl font-bold text-gradient-primary md:text-8xl">50%</div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {locale === "en"
                      ? "Lifetime recurring revenue share. Every month, every year, for as long as the school stays subscribed."
                      : "আজীবন রিকারিং রাজস্বের ভাগ। প্রতি মাস, প্রতি বছর — যতদিন স্কুল সাবস্ক্রিপশন রাখবে ততদিন।"}
                  </p>
                </div>
              </Reveal>

              {/* Platform side */}
              <Reveal variant="slide-left">
                <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Building2 className="size-6" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {locale === "en" ? "Us" : "আমরা"}
                      </div>
                      <div className="text-xl font-bold">
                        {locale === "en" ? "Platform" : "প্ল্যাটফর্ম"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-7xl font-bold text-foreground/80 md:text-8xl">50%</div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {locale === "en"
                      ? "Covers product development, hosting, support, payment processing, AI features, and SMS gateway."
                      : "প্রোডাক্ট ডেভেলপমেন্ট, হোস্টিং, সাপোর্ট, পেমেন্ট গেটওয়ে, AI ফিচার, SMS গেটওয়ে — সব কভার করে।"}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal variant="fade-up" delay={300}>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {locale === "en"
                  ? "It's a true partnership — we win when you win."
                  : "এটাই সত্যিকারের পার্টনারশিপ — আপনি জিতলে আমরাও জিতি।"}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            MARKET SIZE — "2 lakh+ institutions, target only 500"
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute top-10 start-[5%] size-80 rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-10 end-[5%] size-80 rounded-full bg-accent/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8">
            <Reveal variant="fade-up" className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-4 py-1.5 text-xs font-semibold text-success">
                <MapPin className="size-3.5" />
                {locale === "en" ? "MARKET OPPORTUNITY" : "বাজারের সুযোগ"}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl leading-tight">
                {locale === "en" ? (
                  <>
                    ২ <span className="text-gradient-primary">lakh+</span> institutions waiting.
                    <br />
                    Target just <span className="text-gradient-primary">500</span> to start.
                  </>
                ) : (
                  <>
                    ২ <span className="text-gradient-primary">লাখেরও বেশি</span> প্রতিষ্ঠান অপেক্ষায়।
                    <br />
                    শুধু <span className="text-gradient-primary">৫০০</span> দিয়েই শুরু।
                  </>
                )}
              </h2>
              <p className="mt-5 text-base text-muted-foreground md:text-lg leading-relaxed">
                {locale === "en"
                  ? "Bangladesh has more than 2 lakh educational institutions. Onboarding just 500 of them — 0.25% of the total — gives you ৳15+ lakh/year. Ceiling is yours: more onboarded → more earned."
                  : "বাংলাদেশে ২ লাখের বেশি শিক্ষাপ্রতিষ্ঠান আছে। মাত্র ০.২৫% বা ৫০০ প্রতিষ্ঠান আনলেই আপনার বার্ষিক আয় ১৫+ লাখ। সীমা আপনার হাতে — যত বেশি manage করবেন, তত বেশি earn।"}
              </p>
            </Reveal>

            {/* Institution breakdown grid */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: School,
                  count: locale === "bn" ? "১,১৮,৬০৭" : "1,18,607",
                  label: locale === "en" ? "Primary Schools" : "প্রাইমারি স্কুল",
                  color: "from-sky-500 to-blue-500",
                },
                {
                  icon: GraduationCap,
                  count: locale === "bn" ? "২১,০৮৬" : "21,086",
                  label: locale === "en" ? "Secondary Schools" : "মাধ্যমিক স্কুল",
                  color: "from-emerald-500 to-green-500",
                },
                {
                  icon: BookOpenText,
                  count: locale === "bn" ? "৪,৫০০-৫,০০০" : "4,500–5,000",
                  label: locale === "en" ? "Colleges (HSC+)" : "কলেজ (HSC+)",
                  color: "from-amber-500 to-orange-500",
                },
                {
                  icon: Library,
                  count: locale === "bn" ? "১৯৪" : "194",
                  label: locale === "en" ? "Universities" : "বিশ্ববিদ্যালয়",
                  color: "from-rose-500 to-pink-500",
                },
                {
                  icon: BookOpenText,
                  count: locale === "bn" ? "২৪,০০০+" : "24,000+",
                  label: locale === "en" ? "Madrasas (Alia + Qawmi)" : "মাদ্রাসা (আলিয়া + কওমী)",
                  color: "from-violet-500 to-purple-500",
                },
                {
                  icon: Users,
                  count: locale === "bn" ? "৩০,০০০-৫০,০০০" : "30,000–50,000",
                  label: locale === "en" ? "Coaching Centers" : "কোচিং সেন্টার",
                  color: "from-cyan-500 to-teal-500",
                },
              ].map((stat, i) => (
                <Reveal key={i} variant="fade-up" delay={i * 80}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                    <span className="absolute -top-4 -end-4 size-24 rounded-full bg-gradient-to-br opacity-10 transition-opacity duration-300 group-hover:opacity-20" />
                    <div className="relative">
                      <span
                        className={`inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                      >
                        <stat.icon className="size-6" />
                      </span>
                      <div className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{stat.count}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Grand total banner */}
            <Reveal variant="scale-in" delay={300}>
              <div className="mt-8 relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-card to-accent/15 p-8 text-center shadow-2xl shadow-primary/15">
                <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                  {locale === "en" ? "Approximate grand total" : "আনুমানিক মোট"}
                </div>
                <div className="mt-2 text-5xl font-bold text-gradient-primary md:text-7xl">
                  {locale === "en" ? "2,00,000+" : "২,০০,০০০+"}
                </div>
                <div className="mt-3 text-sm text-muted-foreground md:text-base max-w-2xl mx-auto">
                  {locale === "en"
                    ? "Educational institutions across Bangladesh. Your share of just 500 of them = ৳1.25 lakh/month recurring."
                    : "বাংলাদেশজুড়ে শিক্ষাপ্রতিষ্ঠান। মাত্র ৫০০ এর মধ্যে আপনার ভাগ = প্রতি মাসে ১.২৫ লাখ টাকা রিকারিং।"}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            WHY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 md:py-28">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <Reveal variant="fade-up" className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.why.title}</h2>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">{t.why.subtitle}</p>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {t.why.items.map((item, i) => {
                const Icon = whyIcons[i % whyIcons.length];
                return (
                  <Reveal key={i} variant="fade-up" delay={i * 100}>
                    <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-6" />
                      </span>
                      <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CALCULATOR + MATH
        ═══════════════════════════════════════════════════════════════ */}
        <section
          id="calculator"
          className="relative py-20 md:py-28 border-y border-border/40 bg-gradient-to-b from-muted/10 via-background to-muted/10"
        >
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <Reveal variant="fade-up" className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.math.title}</h2>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">{t.math.subtitle}</p>
            </Reveal>

            <Reveal variant="scale-in" delay={200} className="mt-12">
              <EarningsCalculator locale={locale} />
            </Reveal>

            {/* Worked example */}
            <Reveal variant="fade-up" delay={400}>
              <div className="mt-10 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm md:p-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  {locale === "en"
                    ? "Worked example: 500 madrasas on Starter plan"
                    : "উদাহরণ: ৫০০ মাদ্রাসা Starter প্ল্যানে"}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                    <span>
                      {locale === "en"
                        ? "500 schools × ৳1,000/month = ৳5,00,000/month total revenue"
                        : "৫০০ স্কুল × ৳১,০০০/মাস = ৳৫,০০,০০০/মাস মোট রাজস্ব"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                    <span>
                      {locale === "en"
                        ? "Yearly: ৳60,00,000 (sixty lakh)"
                        : "বার্ষিক: ৳৬০,০০,০০০ (ষাট লাখ)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                    <span className="font-semibold text-foreground">
                      {locale === "en"
                        ? "Your 50% share: ৳30,00,000/year = ৳2,50,000/month"
                        : "আপনার ৫০% ভাগ: ৳৩০,০০,০০০/বছর = ৳২,৫০,০০০/মাস"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-success shrink-0" />
                    <span>
                      {locale === "en"
                        ? "Per student cost in 500-student madrasa: only ৳2 — they will never leave."
                        : "৫০০ ছাত্রের মাদ্রাসায় প্রতি ছাত্র খরচ: মাত্র ২ টাকা — কেউ ছাড়বে না।"}
                    </span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            STEPS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 md:py-28">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <Reveal variant="fade-up" className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.steps.title}</h2>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">{t.steps.subtitle}</p>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {t.steps.items.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <Reveal key={i} variant="fade-up" delay={i * 150}>
                    <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
                      <div className="absolute -top-4 -end-4 flex size-12 items-center justify-center rounded-full bg-gradient-primary text-white text-xl font-bold shadow-lg shadow-primary/30">
                        {locale === "bn" ? "০১২৩"[i + 1] : i + 1}
                      </div>
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PERKS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-20 border-y border-border/40 bg-muted/10">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
            <Reveal variant="fade-up" className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.perks.title}</h2>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {t.perks.items.map((perk, i) => (
                <Reveal key={i} variant="fade-up" delay={i * 60}>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur-sm">
                    <CheckCircle2 className="size-5 text-success shrink-0" />
                    <span className="text-sm font-medium">{perk}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
            <div className="absolute -top-20 start-[20%] size-96 rounded-full bg-primary/30 blur-[120px]" />
            <div className="absolute bottom-0 end-[20%] size-96 rounded-full bg-accent/30 blur-[120px]" />
          </div>

          <div className="relative mx-auto w-full max-w-4xl px-4 text-center md:px-8">
            <Reveal variant="blur-in">
              <Crown className="mx-auto size-12 text-primary mb-4" />
            </Reveal>
            <Reveal variant="fade-up" delay={150}>
              <h2 className="text-4xl font-bold tracking-tight md:text-6xl leading-tight">
                {t.cta.title}
              </h2>
            </Reveal>
            <Reveal variant="fade-up" delay={300}>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                {t.cta.subtitle}
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={450}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className={
                    buttonVariants({ size: "lg" }) +
                    " group bg-gradient-primary animate-gradient text-white text-base px-10 shadow-2xl shadow-primary/40 hover:shadow-primary/60"
                  }
                >
                  {t.cta.primary}
                  <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="tel:+8801767682381"
                  className={buttonVariants({ size: "lg", variant: "outline" }) + " text-base px-10"}
                >
                  <PhoneCall className="me-2 size-4" />
                  {t.cta.secondary}
                </a>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={600}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="text-xs">{t.cta.contactNote}:</span>
                <a href="tel:+8801767682381" className="inline-flex items-center gap-1.5 hover:text-primary transition" dir="ltr">
                  <PhoneCall className="size-3.5" />
                  +880 1767-682381
                </a>
                <a href="mailto:muhiussunnah2026@gmail.com" className="inline-flex items-center gap-1.5 hover:text-primary transition">
                  <Mail className="size-3.5" />
                  muhiussunnah2026@gmail.com
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
