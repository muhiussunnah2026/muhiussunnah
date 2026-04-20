import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

const monthLabels = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default async function AttendanceSummaryPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const now = new Date();
  const year = Number(search.year ?? now.getFullYear());
  const month = Number(search.month ?? now.getMonth() + 1);

  // Date range for the selected month
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = new Date(year, month, 0).toISOString().split("T")[0]; // last day of month

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: records } = await (supabase as any)
    .from("attendance")
    .select("student_id, status, date, sections ( name_bn, classes ( name_bn ) )")
    .eq("school_id", membership.school_id)
    .gte("date", from)
    .lte("date", to);

  type AttRecord = { student_id: string; status: string; date: string; sections: { name_bn: string; classes: { name_bn: string } } | null };
  const list = (records ?? []) as AttRecord[];

  // Group by class+section
  const sectionMap = new Map<string, { label: string; total: number; present: number; absent: number; late: number }>();
  for (const r of list) {
    const key = r.sections ? `${r.sections.classes?.name_bn ?? ""} — ${r.sections.name_bn}` : "অজানা";
    const existing = sectionMap.get(key) ?? { label: key, total: 0, present: 0, absent: 0, late: 0 };
    existing.total++;
    if (r.status === "present") existing.present++;
    else if (r.status === "absent") existing.absent++;
    else if (r.status === "late") existing.late++;
    sectionMap.set(key, existing);
  }

  const rows = Array.from(sectionMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  const totalPresent = rows.reduce((s, r) => s + r.present, 0);
  const totalRecords = rows.reduce((s, r) => s + r.total, 0);
  const avgPct = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title={<>উপস্থিতি সারসংক্ষেপ — {monthLabels[month - 1]} <BanglaDigit value={year} /></>}
        subtitle="শ্রেণি ও সেকশন অনুযায়ী উপস্থিতি হার।"
        impact={[
          { label: <>মোট রেকর্ড · <BanglaDigit value={totalRecords} /></>, tone: "default" },
          { label: <>উপস্থিত · <BanglaDigit value={avgPct} />%</>, tone: avgPct >= 85 ? "success" : avgPct >= 70 ? "warning" : "default" },
        ]}
      />

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">এই মাসে কোন উপস্থিতি রেকর্ড নেই।</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শ্রেণি / সেকশন</TableHead>
                  <TableHead className="text-right">মোট</TableHead>
                  <TableHead className="text-right">উপস্থিত</TableHead>
                  <TableHead className="text-right">অনুপস্থিত</TableHead>
                  <TableHead className="text-right">দেরি</TableHead>
                  <TableHead className="text-right">হার</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const pct = r.total > 0 ? Math.round((r.present / r.total) * 100) : 0;
                  return (
                    <TableRow key={r.label}>
                      <TableCell className="text-sm">{r.label}</TableCell>
                      <TableCell className="text-right"><BanglaDigit value={r.total} /></TableCell>
                      <TableCell className="text-right text-success"><BanglaDigit value={r.present} /></TableCell>
                      <TableCell className="text-right text-destructive"><BanglaDigit value={r.absent} /></TableCell>
                      <TableCell className="text-right text-warning-foreground dark:text-warning"><BanglaDigit value={r.late} /></TableCell>
                      <TableCell className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${pct >= 85 ? "bg-success/10 text-success" : pct >= 70 ? "bg-warning/10 text-warning-foreground dark:text-warning" : "bg-destructive/10 text-destructive"}`}>
                          <BanglaDigit value={pct} />%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
