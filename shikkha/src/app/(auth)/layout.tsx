import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { CustomCursor } from "@/components/marketing/custom-cursor";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <CustomCursor />

      {/* Background — two halves: left brand pane + right form pane */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 -start-40 size-[500px] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute -bottom-40 -end-40 size-[500px] rounded-full bg-accent/15 blur-[120px] animate-float" />
        <div className="absolute top-1/2 start-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[100px] animate-glow-pulse" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        aria-hidden
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative flex items-center justify-between px-4 py-4 md:px-8 md:py-5">
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-md transition hover:border-primary/40 hover:bg-primary/5"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          হোমে ফিরে যান
        </Link>
      </header>

      <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left — brand/value pane (hidden on small screens) */}
          <div className="hidden lg:flex flex-col gap-8 p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3" />
                বাংলাদেশের #১ স্কুল সফটওয়্যার
              </div>
              <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
                স্কুল ও মাদ্রাসা{" "}
                <span className="text-gradient-primary animate-gradient">ম্যানেজ করুন</span>{" "}
                একদম সহজে
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                ভর্তি থেকে সার্টিফিকেট, ফি থেকে অভিভাবক যোগাযোগ — সব কিছু এক জায়গায়।
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Shield, title: "ব্যাংক-level সুরক্ষা", desc: "Row-Level Security + 2FA + encrypted backup" },
                { icon: Zap, title: "২ মিনিটে setup", desc: "Excel import + guided onboarding" },
                { icon: Sparkles, title: "AI-powered insights", desc: "Dropout risk + smart SMS templates" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/40 p-4 backdrop-blur-sm transition hover:border-primary/30">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-lg shadow-primary/20">
                    <f.icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["bg-primary", "bg-accent", "bg-secondary", "bg-warning"].map((c, i) => (
                  <div key={i} className={`size-8 rounded-full ${c} border-2 border-background`} />
                ))}
              </div>
              <div>
                <div className="font-semibold text-foreground">১২০+ প্রতিষ্ঠানের</div>
                <div>বিশ্বস্ত পছন্দ</div>
              </div>
            </div>
          </div>

          {/* Right — form pane */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ms-auto">
            {children}
          </div>
        </div>
      </main>

      <footer className="relative px-4 pb-6 md:px-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <span>© ২০২৬ Muhius Sunnah</span>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Shield className="size-3 text-success" /> SSL encrypted
          </span>
        </div>
      </footer>
    </div>
  );
}
