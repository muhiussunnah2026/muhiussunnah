"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseBrowser } from "@/lib/supabase/client";

type State =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string }
  | { status: "submitting" }
  | { status: "success" };

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);

  // Supabase puts the recovery token in the URL hash on landing.
  // The supabase-js client picks it up automatically when it sees
  // `?type=recovery` or `#type=recovery`, but only if we explicitly
  // give it a kick by reading getSession() (or auth state change).
  // We listen for the PASSWORD_RECOVERY event so we know the token
  // landed before we let the user submit.
  useEffect(() => {
    const supabase = supabaseBrowser();

    // 1. Some clients deliver the token via query string instead of hash;
    //    detectSessionInUrl on createBrowserClient handles both.
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setState({ status: "ready" });
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setState({ status: "ready" });
      }
    });

    // Fallback timeout — if no event fires within 4s, the link is
    // probably stale or someone landed here directly.
    const timer = window.setTimeout(() => {
      setState((prev) => {
        if (prev.status === "loading") {
          return {
            status: "error",
            message:
              "লিংকটি মেয়াদোত্তীর্ণ বা বৈধ নয়। আবার পাসওয়ার্ড রিসেট লিংক চান?",
          };
        }
        return prev;
      });
    }, 4000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।");
      return;
    }
    if (pwd !== pwd2) {
      toast.error("দুটি পাসওয়ার্ড মেলেনি।");
      return;
    }

    setState({ status: "submitting" });
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) {
      setState({ status: "ready" });
      toast.error(error.message);
      return;
    }

    setState({ status: "success" });
    toast.success("পাসওয়ার্ড সেট হয়েছে। ড্যাশবোর্ডে নিয়ে যাচ্ছি…");

    // Brief delay so the toast is visible, then route to dashboard.
    // The session cookie is already set, so the dashboard layout will
    // resolve the user and redirect to /admin / /teacher / /portal.
    window.setTimeout(() => {
      router.replace("/admin");
      router.refresh();
    }, 800);
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">লিংক যাচাই করা হচ্ছে…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-destructive">{state.message}</p>
        <a
          href="/forgot-password"
          className="rounded-xl bg-gradient-primary px-5 py-2 text-sm font-medium text-white"
        >
          নতুন রিসেট লিংক পান
        </a>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <p className="text-sm text-muted-foreground">
          সফল! আপনাকে ড্যাশবোর্ডে পাঠানো হচ্ছে…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="password"
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="h-11 ps-11 pe-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password2">পাসওয়ার্ড নিশ্চিত করুন</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="password2"
            type={show ? "text" : "password"}
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="h-11 ps-11"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={state.status === "submitting"}
        className="mt-2 h-11 bg-gradient-primary animate-gradient text-white shadow-lg shadow-primary/30"
      >
        {state.status === "submitting" ? "সংরক্ষণ হচ্ছে…" : "পাসওয়ার্ড সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
