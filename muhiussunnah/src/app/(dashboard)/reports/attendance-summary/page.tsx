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
  searchParams: Promise<{ month?: string; year?: string }>;
};

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
  const t = await getTranslations("reports");
  const unknown = t("as_unknown");

  // Group by class+section
  const sectionMap = new Map<string, { label: string; total: number; present: number; absent: number; late: number }>();
  for (const r of list) {
    const key = r.sections ? `${r.sections.classes?.name_bn ?? ""} — ${r.sections.name_bn}` : unknown;
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
          <Link href={`/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("index_title")}
          </Link>
        }
        title={<>{t("as_title")} {t(`month_${month}`)} <BanglaDigit value={year} /></>}
        subtitle={t("as_subtitle", { month, year })}
        impact={[
          { label: <>{t("as_impact_total_records")} · <BanglaDigit value={totalRecords} /></>, tone: "default" },
          { label: <>{t("as_impact_present_pct")} · <BanglaDigit value={avgPct} />%</>, tone: avgPct >= 85 ? "success" : avgPct >= 70 ? "warning" : "default" },
        ]}
      />

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("as_empty")}</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("as_col_class_section")}</TableHead>
                  <TableHead className="text-right">{t("as_col_total")}</TableHead>
                  <TableHead className="text-right">{t("as_col_present_header")}</TableHead>
                  <TableHead className="text-right">{t("as_col_absent")}</TableHead>
                  <TableHead className="text-right">{t("as_col_late")}</TableHead>
                  <TableHead className="text-right">{t("as_col_rate")}</TableHead>
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
