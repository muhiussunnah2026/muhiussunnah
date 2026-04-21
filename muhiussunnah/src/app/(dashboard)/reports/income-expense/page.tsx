import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function IncomeExpensePage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const year = Number(search.year ?? new Date().getFullYear());

  const supabase = await supabaseServer();

  const [{ data: invoices }, { data: expenses }, { data: donations }, { data: investments }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("fee_invoices").select("month, paid_amount").eq("school_id", membership.school_id).eq("year", year),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("expenses").select("date, amount").eq("school_id", membership.school_id).gte("date", `${year}-01-01`).lte("date", `${year}-12-31`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("donations").select("date, amount").eq("school_id", membership.school_id).gte("date", `${year}-01-01`).lte("date", `${year}-12-31`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("investment_returns").select("date, amount").eq("school_id", membership.school_id).gte("date", `${year}-01-01`).lte("date", `${year}-12-31`),
  ]);

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const feeIncome = ((invoices ?? []) as { month: number; paid_amount: number }[]).filter((r) => r.month === m).reduce((s, r) => s + Number(r.paid_amount), 0);
    const donationIncome = ((donations ?? []) as { date: string; amount: number }[]).filter((r) => new Date(r.date).getMonth() + 1 === m).reduce((s, r) => s + Number(r.amount), 0);
    const investIncome = ((investments ?? []) as { date: string; amount: number }[]).filter((r) => new Date(r.date).getMonth() + 1 === m).reduce((s, r) => s + Number(r.amount), 0);
    const exp = ((expenses ?? []) as { date: string; amount: number }[]).filter((r) => new Date(r.date).getMonth() + 1 === m).reduce((s, r) => s + Number(r.amount), 0);
    const income = feeIncome + donationIncome + investIncome;
    return { m, income, exp, balance: income - exp };
  });

  const totalIncome = monthly.reduce((s, r) => s + r.income, 0);
  const totalExp = monthly.reduce((s, r) => s + r.exp, 0);
  const netBalance = totalIncome - totalExp;

  const t = await getTranslations("reports");

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("index_title")}
          </Link>
        }
        title={<>{t("ie_title")} <BanglaDigit value={year} /></>}
        subtitle={t("ie_subtitle_actual")}
        impact={[
          { label: <>{t("ie_impact_income_label")} · ৳ <BanglaDigit value={totalIncome.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>{t("ie_impact_expense_label")} · ৳ <BanglaDigit value={totalExp.toLocaleString("en-IN")} /></>, tone: "warning" },
          { label: <>{t("ie_impact_surplus")} · ৳ <BanglaDigit value={Math.abs(netBalance).toLocaleString("en-IN")} /></>, tone: netBalance >= 0 ? "success" : "default" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ie_col_month")}</TableHead>
                <TableHead className="text-right">{t("ie_col_income")}</TableHead>
                <TableHead className="text-right">{t("ie_col_expense_amt")}</TableHead>
                <TableHead className="text-right">{t("ie_col_surplus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthly.map((r) => (
                <TableRow key={r.m}>
                  <TableCell>{t(`month_short_${r.m}`)}</TableCell>
                  <TableCell className="text-right text-success"><BanglaDigit value={r.income.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className="text-right text-warning-foreground dark:text-warning"><BanglaDigit value={r.exp.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className={`text-right font-medium ${r.balance < 0 ? "text-destructive" : ""}`}>
                    {r.balance < 0 ? "−" : ""}৳ <BanglaDigit value={Math.abs(r.balance).toLocaleString("en-IN")} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>{t("ie_row_total")}</TableCell>
                <TableCell className="text-right text-success">৳ <BanglaDigit value={totalIncome.toLocaleString("en-IN")} /></TableCell>
                <TableCell className="text-right">৳ <BanglaDigit value={totalExp.toLocaleString("en-IN")} /></TableCell>
                <TableCell className={`text-right ${netBalance < 0 ? "text-destructive" : ""}`}>
                  {netBalance < 0 ? "−" : ""}৳ <BanglaDigit value={Math.abs(netBalance).toLocaleString("en-IN")} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
