import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";

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
