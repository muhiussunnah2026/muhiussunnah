"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Tab = "invoices" | "structures" | "heads" | "payments";

const tabs: { key: Tab; tKey: string; href: (s: string) => string }[] = [
  { key: "invoices",   tKey: "nav_invoices",   href: () => `/fees/invoices` },
  { key: "structures", tKey: "nav_structures", href: () => `/fees/structures` },
  { key: "heads",      tKey: "nav_heads",      href: () => `/fees/heads` },
  { key: "payments",   tKey: "nav_payments",   href: () => `/fees/payments` },
];

export function FeesSubNav({ schoolSlug, active }: { schoolSlug: string; active: Tab }) {
  const t = useTranslations("fees");
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(schoolSlug)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            tab.key === active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(tab.tKey)}
        </Link>
      ))}
    </nav>
  );
}
