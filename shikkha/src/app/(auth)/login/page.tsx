import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "লগইন",
  description: "আপনার স্কুল ড্যাশবোর্ডে প্রবেশ করুন।",
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next = "/" } = await searchParams;

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-40 blur-xl" aria-hidden />
      <div className="relative rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-primary animate-gradient" />
        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/30">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">আবার স্বাগতম</h1>
              <p className="text-sm text-muted-foreground">আপনার ড্যাশবোর্ডে প্রবেশ করুন</p>
            </div>
          </div>

          <LoginForm next={next} />

          <div className="mt-6 flex flex-col gap-2 border-t border-border/40 pt-5 text-center text-sm">
            <span className="text-muted-foreground">
              নতুন প্রতিষ্ঠান?{" "}
              <Link
                href="/register-school"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                ফ্রি ট্রায়াল শুরু করুন →
              </Link>
            </span>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
