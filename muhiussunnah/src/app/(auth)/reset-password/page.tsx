import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড সেট করুন · Muhius Sunnah",
  description: "Set your password to access your Muhius Sunnah account.",
};

/**
 * Landing page for the password-set link emailed to a freshly invited
 * staff member or to a user who clicked "Forgot password".
 *
 * Supabase's recovery flow redirects here with an access_token in the
 * URL hash (`#access_token=…&type=recovery`). The token never hits the
 * server — Supabase sets it as a session cookie via the supabase-js
 * client on the page itself. So this whole route is a thin shell that
 * mounts the client form; the form does the cookie handshake +
 * password update + final redirect.
 */
export default function ResetPasswordPage() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-px rounded-3xl bg-gradient-primary opacity-40 blur-xl"
        aria-hidden
      />
      <div className="relative rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-primary animate-gradient" />
        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/30">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                পাসওয়ার্ড সেট করুন
              </h1>
              <p className="text-sm text-muted-foreground">
                একটি নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্টে ঢুকে যান
              </p>
            </div>
          </div>

          <ResetPasswordForm />

          <div className="mt-6 flex flex-col gap-2 border-t border-border/40 pt-5 text-center text-sm">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              লগইন পেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
