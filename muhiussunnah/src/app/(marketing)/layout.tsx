import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { CustomCursor } from "@/components/marketing/custom-cursor";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { FloatingActions } from "@/components/marketing/floating-actions";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div data-custom-cursor="on" className="flex min-h-screen flex-col">
      <ScrollProgress />
      <CustomCursor />
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <FloatingActions />
    </div>
  );
}
