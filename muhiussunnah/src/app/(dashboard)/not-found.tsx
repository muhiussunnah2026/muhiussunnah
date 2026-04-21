import Link from "next/link";
import { Home, LifeBuoy, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Dashboard-scoped 404.
 *
 * Lives inside the (dashboard) route group so Next.js renders it inside
 * the admin shell (sidebar + header) instead of bouncing to the root
 * not-found.tsx which is a full marketing-style page with nav + footer —
 * wrong context once the user is logged in.
 */
export default function DashboardNotFound() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-3xl flex-col items-center justify-center py-12 text-center">
      {/* Twin accent orbs for depth */}
      <div
        className="pointer-events-none absolute -top-8 start-1/4 size-56 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-12 end-1/4 size-56 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        {/* Big 4-0-4 with gradient text */}
        <h1 className="select-none text-[9rem] md:text-[11rem] font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
          404
        </h1>

        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">
          পেজটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
          এই URL টি আর নেই, সরানো হয়েছে, অথবা হয়তো টাইপিং-এ সমস্যা হয়েছে।
          নিচের কোনো একটি অপশন থেকে ফিরে যান।
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin"
            className={buttonVariants({ size: "lg", className: "bg-gradient-primary text-white shadow-lg shadow-primary/30" })}
          >
            <Home className="size-4" />
            ড্যাশবোর্ডে ফিরুন
          </Link>
          <Link
            href="/students"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <Search className="size-4" />
            শিক্ষার্থীদের দেখুন
          </Link>
          <Link
            href="/tickets"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <LifeBuoy className="size-4" />
            সাপোর্ট
          </Link>
        </div>

      </div>
    </div>
  );
}
