"use client";

import { useEffect, useState } from "react";
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

/**
 * Password-reset / first-time password setup form.
 *
 * Lands here from a Supabase recovery email. The URL has either:
 *   #access_token=…&refresh_token=…&type=recovery
 * or, for some clients, the same params on the query string.
 *
 * Order of events:
 *   1. createBrowserClient (with detectSessionInUrl=true by default)
 *      consumes the hash and sets the session cookie.
 *   2. We listen for the PASSWORD_RECOVERY auth-state event AND poll
 *      getSession() up to 6 seconds — whichever fires first flips
 *      the form into the "ready" state.
 *   3. User types a new password; we call supabase.auth.updateUser.
 *   4. On success we send them through a server-side route handler
 *      (/post-auth) which knows their role and redirects to /admin,
 *      /teacher, /portal, or /super-admin accordingly.
 */
export function ResetPasswordForm() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    let cancelled = false;
    let pollTimer: number | null = null;

    // Helper — we're "ready" the moment we have a session OR we
    // can see a recovery token in the URL.
    const checkReady = async () => {
      if (cancelled) return false;
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const search = typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(
        hash.startsWith("#") ? hash.slice(1) : search.startsWith("?") ? search.slice(1) : "",
      );
      const hasToken = params.has("access_token") || params.has("refresh_token");
      if (hasToken) return true;

      const { data } = await supabase.auth.getSession();
      return Boolean(data.session);
    };

    // First pass — synchronous check + getSession.
    (async () => {
      if (await checkReady()) {
        if (!cancelled) setState({ status: "ready" });
      }
    })();

    // Listen for auth-state changes — this fires once Supabase has
    // finished consuming the URL hash on its own internal clock.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {
        setState((prev) => (prev.status === "loading" ? { status: "ready" } : prev));
      }
    });

    // Belt-and-suspenders poll. detectSessionInUrl is async and
    // sometimes lands AFTER our first checkReady. Re-check every
    // 250ms for up to 6 seconds before declaring the link bad.
    let attempts = 0;
    pollTimer = window.setInterval(async () => {
      attempts++;
      if (cancelled) return;
      if (await checkReady()) {
        setState((prev) => (prev.status === "loading" ? { status: "ready" } : prev));
        if (pollTimer) window.clearInterval(pollTimer);
      } else if (attempts >= 24) {
        // 24 × 250ms = 6 seconds
        if (pollTimer) window.clearInterval(pollTimer);
        setState((prev) =>
          prev.status === "loading"
            ? {
                status: "error",
                message:
                  "লিংকটি মেয়াদোত্তীর্ণ বা বৈধ নয়। নতুন রিসেট লিংক চান নিচের বাটন থেকে।",
              }
            : prev,
        );
      }
    }, 250);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (pollTimer) window.clearInterval(pollTimer);
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

    // Hard navigate (full page load) to /post-auth so the server-side
    // route handler reads the just-set cookie and redirects to the
    // role-specific dashboard. router.replace would do a soft client
    // nav and the cookie may not flush before the next request.
    window.setTimeout(() => {
      window.location.href = "/post-auth";
    }, 600);
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
