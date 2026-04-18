import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "invoices" | "structures" | "heads" | "payments";

const tabs: { key: Tab; label: string; href: (s: string) => string }[] = [
  { key: "invoices",   label: "ইনভয়েস",        href: (s) => `/school/${s}/admin/fees/invoices` },
  { key: "structures", label: "ফি কাঠামো",       href: (s) => `/school/${s}/admin/fees/structures` },
  { key: "heads",      label: "ফি হেড",          href: (s) => `/school/${s}/admin/fees/heads` },
  { key: "payments",   label: "পেমেন্ট লগ",      href: (s) => `/school/${s}/admin/fees/payments` },
];

export function FeesSubNav({ schoolSlug, active }: { schoolSlug: string; active: Tab }) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href(schoolSlug)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            t.key === active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
