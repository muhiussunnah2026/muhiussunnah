import Link from "next/link";
import { cookies } from "next/headers";
import { Home, ArrowRight, Search, LifeBuoy, Compass } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Reveal } from "@/components/marketing/reveal";
import { TiltCard } from "@/components/marketing/tilt-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  homeLabel: string;
  featuresLabel: string;
  supportLabel: string;
  helpfulTitle: string;
  helpfulLinks: Array<{ title: string; desc: string; href: string }>;
};

const copyByLocale: Record<Locale, Copy> = {
  bn: {
    eyebrow: "৪০৪ — পেজ পাওয়া যায়নি",
    title: "হারিয়ে গেছেন?",
    subtitle: "এই পেজটি আর নেই",
    description:
      "আপনি যে পেজটি খুঁজছেন সেটি সরানো, নাম পরিবর্তন করা অথবা কখনোই ছিল না। চিন্তা নেই — নিচের লিংকগুলো থেকে যেখানে যেতে চান সেখানে যেতে পারবেন।",
    homeLabel: "হোমে ফিরে যান",
    featuresLabel: "ফিচার দেখুন",
    supportLabel: "সাপোর্ট নিন",
    helpfulTitle: "জনপ্রিয় লিংক",
    helpfulLinks: [
      { title: "ফিচার", desc: "সব ফিচার এক জায়গায়", href: "/features" },
      { title: "প্রাইসিং", desc: "প্যাকেজ ও প্রাইস", href: "/pricing" },
      { title: "আমাদের সম্পর্কে", desc: "আমাদের মিশন", href: "/about" },
      { title: "যোগাযোগ", desc: "সরাসরি কথা বলুন", href: "/contact" },
    ],
  },
  en: {
    eyebrow: "404 — Page not found",
    title: "Lost your way?",
    subtitle: "This page does not exist",
    description:
      "The page you are looking for may have been moved, renamed, or never existed. No worries — the links below will get you where you need to go.",
    homeLabel: "Back to home",
    featuresLabel: "View features",
    supportLabel: "Get support",
    helpfulTitle: "Popular pages",
    helpfulLinks: [
      { title: "Features", desc: "Everything in one place", href: "/features" },
      { title: "Pricing", desc: "Packages and prices", href: "/pricing" },
      { title: "About us", desc: "Our mission", href: "/about" },
      { title: "Contact", desc: "Talk to us directly", href: "/contact" },
    ],
  },
  ur: {
    eyebrow: "404 — صفحہ نہیں ملا",
    title: "راستہ کھو گیا؟",
    subtitle: "یہ صفحہ موجود نہیں ہے",
    description:
      "جو صفحہ آپ تلاش کر رہے ہیں وہ منتقل یا تبدیل کیا جا چکا ہے، یا کبھی موجود ہی نہیں تھا۔ پریشان نہ ہوں — نیچے دیے گئے لنکس سے اپنی منزل تک پہنچ جائیں۔",
    homeLabel: "ہوم پر واپس",
    featuresLabel: "فیچرز دیکھیں",
    supportLabel: "مدد حاصل کریں",
    helpfulTitle: "مقبول صفحات",
    helpfulLinks: [
      { title: "فیچرز", desc: "سب کچھ ایک جگہ", href: "/features" },
      { title: "قیمتیں", desc: "پیکجز اور قیمتیں", href: "/pricing" },
      { title: "ہمارے بارے میں", desc: "ہمارا مشن", href: "/about" },
      { title: "رابطہ", desc: "براہ راست بات کریں", href: "/contact" },
    ],
  },
  ar: {
    eyebrow: "404 — الصفحة غير موجودة",
    title: "هل تهت؟",
    subtitle: "هذه الصفحة غير موجودة",
    description:
      "الصفحة التي تبحث عنها ربما تم نقلها أو إعادة تسميتها أو لم تكن موجودة من الأصل. لا تقلق — الروابط أدناه ستأخذك إلى المكان الذي تريده.",
    homeLabel: "العودة للرئيسية",
    featuresLabel: "عرض الميزات",
    supportLabel: "احصل على الدعم",
    helpfulTitle: "الصفحات الشائعة",
    helpfulLinks: [
      { title: "الميزات", desc: "كل شيء في مكان واحد", href: "/features" },
      { title: "الأسعار", desc: "الباقات والأسعار", href: "/pricing" },
      { title: "من نحن", desc: "مهمتنا", href: "/about" },
      { title: "اتصل بنا", desc: "تحدث معنا مباشرة", href: "/contact" },
    ],
  },
};

const linkIcons = [Compass, Search, LifeBuoy, Home];

export default async function NotFound() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const c = copyByLocale[locale];

  return (
    <div>
      <ScrollProgress />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg-1 pt-28 pb-16 md:pt-32 md:pb-20 min-h-[calc(100vh-200px)] flex items-center">
          <div className="aurora-beam opacity-40" aria-hidden />
          <div className="relative mx-auto w-full max-w-5xl px-4 md:px-8 text-center">
            <Reveal variant="blur-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-lg shadow-primary/10">
                {c.eyebrow}
              </span>
            </Reveal>

            {/* Giant 404 glyph */}
            <Reveal variant="scale-in" delay={150}>
              <div className="relative mt-8 mb-4 select-none">
                <div className="pointer-events-none absolute inset-x-0 inset-y-0 blur-3xl opacity-30 text-gradient-primary animate-gradient text-[10rem] md:text-[16rem] font-black" aria-hidden>
                  404
                </div>
                <h1 className="relative text-[8rem] md:text-[14rem] font-black leading-none tracking-tighter text-gradient-primary animate-gradient">
                  404
                </h1>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {c.title}
              </h2>
              <p className="mt-3 text-xl md:text-2xl text-muted-foreground">
                {c.subtitle}
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={450}>
              <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {c.description}
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={600}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Magnetic>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-md bg-gradient-primary animate-gradient px-8 py-3.5 font-semibold text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all"
                  >
                    <Home className="size-4" />
                    {c.homeLabel}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Magnetic>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-md border-2 border-border/60 bg-card/50 backdrop-blur-sm px-8 py-3.5 font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                >
                  {c.featuresLabel}
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 rounded-md border-2 border-border/60 bg-card/50 backdrop-blur-sm px-8 py-3.5 font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <LifeBuoy className="size-4" />
                  {c.supportLabel}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Helpful links */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
          <Reveal variant="fade-up">
            <h3 className="text-center text-2xl md:text-3xl font-bold mb-10">
              {c.helpfulTitle}
            </h3>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.helpfulLinks.map((link, i) => {
              const Icon = linkIcons[i] ?? Compass;
              return (
                <Reveal key={link.href} variant="fade-up" delay={i * 100}>
                  <TiltCard>
                    <Link
                      href={link.href}
                      className="group relative block h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all hover:border-primary/40"
                    >
                      <div className="absolute -end-8 -top-8 size-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                      <div className="relative">
                        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Icon className="size-5" />
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{link.title}</h4>
                        <p className="text-sm text-muted-foreground">{link.desc}</p>
                        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>→</span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
