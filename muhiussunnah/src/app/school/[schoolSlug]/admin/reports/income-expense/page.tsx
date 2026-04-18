import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<{ year?: string }>;
};

const monthLabels = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];

export default async function IncomeExpensePage({ params, searchParams }: PageProps) {
  const { schoolSlug } = await params;
  const search = await searchParams;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

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

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title={<>আয়-ব্যয় বিবরণী — <BanglaDigit value={year} /></>}
        subtitle="মাসিক ফি আয়, চাঁদা, বিনিয়োগ রিটার্ন বনাম মোট খরচ।"
        impact={[
          { label: <>মোট আয় · ৳ <BanglaDigit value={totalIncome.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>মোট খরচ · ৳ <BanglaDigit value={totalExp.toLocaleString("en-IN")} /></>, tone: "warning" },
          { label: <>উদ্বৃত্ত · ৳ <BanglaDigit value={Math.abs(netBalance).toLocaleString("en-IN")} /></>, tone: netBalance >= 0 ? "success" : "default" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস</TableHead>
                <TableHead className="text-right">আয় (৳)</TableHead>
                <TableHead className="text-right">ব্যয় (৳)</TableHead>
                <TableHead className="text-right">উদ্বৃত্ত (৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthly.map((r) => (
                <TableRow key={r.m}>
                  <TableCell>{monthLabels[r.m - 1]}</TableCell>
                  <TableCell className="text-right text-success"><BanglaDigit value={r.income.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className="text-right text-warning-foreground dark:text-warning"><BanglaDigit value={r.exp.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className={`text-right font-medium ${r.balance < 0 ? "text-destructive" : ""}`}>
                    {r.balance < 0 ? "−" : ""}৳ <BanglaDigit value={Math.abs(r.balance).toLocaleString("en-IN")} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>মোট</TableCell>
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
