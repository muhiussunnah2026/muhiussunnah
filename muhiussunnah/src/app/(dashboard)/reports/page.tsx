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
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export default async function ReportsIndexPage() {
  await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const t = await getTranslations("reports");

  const reports = [
    {
      group: t("group_financial"),
      items: [
        { href: `/reports/fee-collection`, title: t("card_fee_collection_title"), desc: t("card_fee_collection_desc"), icon: <Receipt className="size-5" /> },
        { href: `/reports/dues-aging`, title: t("card_dues_aging_title"), desc: t("card_dues_aging_desc"), icon: <TrendingDown className="size-5" /> },
        { href: `/reports/income-expense`, title: t("card_income_expense_title"), desc: t("card_income_expense_desc"), icon: <DollarSign className="size-5" /> },
        { href: `/reports/expense-category`, title: t("card_expense_category_title"), desc: t("card_expense_category_desc"), icon: <Wallet className="size-5" /> },
        { href: `/reports/payroll-summary`, title: t("card_payroll_summary_title"), desc: t("card_payroll_summary_desc"), icon: <TrendingUp className="size-5" /> },
      ],
    },
    {
      group: t("group_academic"),
      items: [
        { href: `/reports/student-enrollment`, title: t("card_student_enrollment_title"), desc: t("card_student_enrollment_desc"), icon: <Users2 className="size-5" /> },
        { href: `/reports/attendance-summary`, title: t("card_attendance_summary_title"), desc: t("card_attendance_summary_desc"), icon: <CalendarCheck className="size-5" /> },
      ],
    },
    {
      group: t("group_operational"),
      items: [
        { href: `/library`, title: t("card_library_title"), desc: t("card_library_desc"), icon: <BookOpenText className="size-5" /> },
        { href: `/transport`, title: t("card_transport_title"), desc: t("card_transport_desc"), icon: <Building2 className="size-5" /> },
        { href: `/inventory`, title: t("card_inventory_title"), desc: t("card_inventory_desc"), icon: <BarChart3 className="size-5" /> },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title={t("index_title")}
        subtitle={t("index_subtitle")}
        impact={[{ label: <><BarChart3 className="me-1 inline size-3.5" /> {t("index_impact")}</>, tone: "accent" }]}
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
