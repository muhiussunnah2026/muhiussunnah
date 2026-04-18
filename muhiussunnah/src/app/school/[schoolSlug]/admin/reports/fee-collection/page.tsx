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

const monthLabels = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default async function FeeCollectionReportPage({ params, searchParams }: PageProps) {
  const { schoolSlug } = await params;
  const search = await searchParams;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const year = Number(search.year ?? new Date().getFullYear());

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase as any)
    .from("fee_invoices")
    .select("month, total_amount, paid_amount")
    .eq("school_id", membership.school_id)
    .eq("year", year);

  const list = (invoices ?? []) as { month: number; total_amount: number; paid_amount: number }[];

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const rows = list.filter((inv) => inv.month === m);
    const billed = rows.reduce((s, r) => s + Number(r.total_amount), 0);
    const collected = rows.reduce((s, r) => s + Number(r.paid_amount), 0);
    const due = billed - collected;
    const pct = billed > 0 ? Math.round((collected / billed) * 100) : 0;
    return { month: m, billed, collected, due, pct, invoices: rows.length };
  });

  const totalBilled = monthlyStats.reduce((s, m) => s + m.billed, 0);
  const totalCollected = monthlyStats.reduce((s, m) => s + m.collected, 0);
  const totalDue = totalBilled - totalCollected;
  const yearPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title={<>ফি কালেকশন রিপোর্ট — <BanglaDigit value={year} /></>}
        subtitle="মাসিক collection summary — কোন মাসে কত billed হলো, কত collected হলো, বাকি কত।"
        impact={[
          { label: <>Billed · ৳ <BanglaDigit value={totalBilled.toLocaleString("en-IN")} /></>, tone: "default" },
          { label: <>Collected · ৳ <BanglaDigit value={totalCollected.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>বাকি · ৳ <BanglaDigit value={totalDue.toLocaleString("en-IN")} /></>, tone: totalDue > 0 ? "warning" : "default" },
          { label: <>কালেকশন · <BanglaDigit value={yearPct} />%</>, tone: "accent" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস</TableHead>
                <TableHead className="text-right">ইনভয়েস</TableHead>
                <TableHead className="text-right">Billed (৳)</TableHead>
                <TableHead className="text-right">Collected (৳)</TableHead>
                <TableHead className="text-right">বাকি (৳)</TableHead>
                <TableHead className="text-right">% কালেকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyStats.map((s) => (
                <TableRow key={s.month}>
                  <TableCell>{monthLabels[s.month - 1]}</TableCell>
                  <TableCell className="text-right"><BanglaDigit value={s.invoices} /></TableCell>
                  <TableCell className="text-right"><BanglaDigit value={s.billed.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className="text-right text-success"><BanglaDigit value={s.collected.toLocaleString("en-IN")} /></TableCell>
                  <TableCell className={`text-right ${s.due > 0 ? "text-warning-foreground dark:text-warning" : ""}`}>
                    <BanglaDigit value={s.due.toLocaleString("en-IN")} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      s.pct >= 90 ? "bg-success/10 text-success" :
                      s.pct >= 70 ? "bg-warning/10 text-warning-foreground dark:text-warning" :
                      s.billed === 0 ? "bg-muted text-muted-foreground" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {s.billed > 0 ? <><BanglaDigit value={s.pct} />%</> : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
