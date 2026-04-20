import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

/**
 * Lazy-loaded UI chrome — these aren't needed for first paint or LCP.
 * Deferring them cuts ~40KB of JS out of the initial critical bundle
 * and removes their scroll/resize listeners from the hydration
 * critical path, cutting Total Blocking Time on mobile PageSpeed.
 *
 * (We can't use `ssr: false` because this is a Server Component; the
 * code still ships from a separate chunk though, which is what matters
 * for Core Web Vitals — the main bundle isn't blocked on them.)
 */
const ScrollProgress = dynamic(
  () => import("@/components/marketing/scroll-progress").then((m) => m.ScrollProgress),
);
const FloatingActions = dynamic(
  () => import("@/components/marketing/floating-actions").then((m) => m.FloatingActions),
);

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
