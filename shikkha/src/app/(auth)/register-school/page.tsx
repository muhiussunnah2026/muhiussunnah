import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Check } from "lucide-react";
import { RegisterSchoolForm } from "./register-form";

export const metadata: Metadata = {
  title: "স্কুল রেজিস্টার করুন",
};

const perks = [
  "১৫ দিনের ফ্রি ট্রায়াল",
  "কোন ক্রেডিট কার্ড লাগবে না",
  "সম্পূর্ণ access — সব ফিচার",
  "৫ মিনিটে সেটআপ",
];

export default function RegisterSchoolPage() {
  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-40 blur-xl" aria-hidden />
      <div className="relative rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-primary animate-gradient" />
        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/30">
              <Rocket className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ফ্রি ট্রায়াল শুরু</h1>
              <p className="text-sm text-muted-foreground">৫ মিনিটে সেটআপ · কোন কার্ড লাগবে না</p>
            </div>
          </div>

          {/* Perks */}
          <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-1.5 rounded-lg bg-success/5 border border-success/20 px-2.5 py-1.5">
                <Check className="size-3 text-success shrink-0" />
                <span className="text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>

          <RegisterSchoolForm />

          <div className="mt-6 border-t border-border/40 pt-5 text-center text-sm text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              লগইন করুন →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
