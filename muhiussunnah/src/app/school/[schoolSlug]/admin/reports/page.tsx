import Link from "next/link";
import {
  BarChart3,
  BookOpenText,
  Building2,
  CalendarCheck,
  DollarSign,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users2,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function ReportsIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const reports = [
    {
      group: "আর্থিক",
      items: [
        { href: `/school/${schoolSlug}/admin/reports/fee-collection`, title: "ফি কালেকশন", desc: "মাসিক/বার্ষিক collection summary, class-wise breakdown", icon: <Receipt className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/reports/dues-aging`, title: "বকেয়া Aging", desc: "০-৩০ / ৩১-৬০ / ৬১-৯০ / ৯০+ দিনের বকেয়া bucket", icon: <TrendingDown className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/reports/income-expense`, title: "আয়-ব্যয় বিবরণী", desc: "মাসিক ফি আয় + চাঁদা বনাম মোট খরচ — বার্ষিক P&L ভিউ", icon: <DollarSign className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/reports/expense-category`, title: "খরচ ক্যাটাগরি", desc: "হেড ও ক্যাটাগরি অনুযায়ী বার্ষিক খরচের ভাঙন", icon: <Wallet className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/reports/payroll-summary`, title: "বেতন সারসংক্ষেপ", desc: "মাসিক সকল কর্মীর বেতন তালিকা ও পরিশোধ অবস্থা", icon: <TrendingUp className="size-5" /> },
      ],
    },
    {
      group: "একাডেমিক",
      items: [
        { href: `/school/${schoolSlug}/admin/reports/student-enrollment`, title: "শিক্ষার্থী ভর্তি", desc: "শ্রেণি অনুযায়ী ছাত্র সংখ্যা — ছেলে/মেয়ে breakdown", icon: <Users2 className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/reports/attendance-summary`, title: "উপস্থিতি সারসংক্ষেপ", desc: "শ্রেণি ও সেকশন অনুযায়ী মাসিক উপস্থিতি হার", icon: <CalendarCheck className="size-5" /> },
      ],
    },
    {
      group: "অপারেশনাল",
      items: [
        { href: `/school/${schoolSlug}/admin/library`, title: "লাইব্রেরি", desc: "বইয়ের ক্যাটালগ, overdue ইস্যু — লাইব্রেরি মডিউলে যান", icon: <BookOpenText className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/transport`, title: "পরিবহন", desc: "রুট ও গাড়ির সারাংশ — পরিবহন মডিউলে যান", icon: <Building2 className="size-5" /> },
        { href: `/school/${schoolSlug}/admin/inventory`, title: "ইনভেন্টরি", desc: "কম স্টক আইটেম ও মোট সম্পদ মূল্য", icon: <BarChart3 className="size-5" /> },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title="রিপোর্ট"
        subtitle="আর্থিক, একাডেমিক ও অপারেশনাল রিপোর্ট — তথ্যভিত্তিক সিদ্ধান্ত গ্রহণের জন্য।"
        impact={[{ label: <><BarChart3 className="me-1 inline size-3.5" /> Phase 6 · ১০+ রিপোর্ট টাইপ</>, tone: "accent" }]}
      />
      <div className="space-y-6">
        {reports.map((group) => (
          <section key={group.group}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group.group}</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((r) => (
                <Link key={r.href} href={r.href} className="group">
                  <Card className="transition hover:shadow-hover h-full">
                    <CardContent className="flex items-start gap-3 p-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {r.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
