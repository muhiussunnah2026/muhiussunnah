import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function PayrollSummaryPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const now = new Date();
  const year = Number(search.year ?? now.getFullYear());
  const month = Number(search.month ?? now.getMonth() + 1);

  const supabase = await supabaseServer();

  // staff_salaries references school_user_id → filter via inner join on school_users.school_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payrolls } = await (supabase as any)
    .from("staff_salaries")
    .select("id, gross_amount, net_amount, deductions, status, school_users!inner ( school_id, full_name_bn, full_name_en, role )")
    .eq("school_users.school_id", membership.school_id)
    .eq("year", year)
    .eq("month", month)
    .order("gross_amount", { ascending: false });

  type Payroll = {
    id: string;
    gross_amount: number;
    net_amount: number;
    deductions: Record<string, number>;
    status: string;
    school_users: { full_name_bn: string | null; full_name_en: string | null; role: string } | null;
  };
  const list = (payrolls ?? []) as Payroll[];
  const sumDeductions = (d: Record<string, number> | null) =>
    d ? Object.values(d).reduce((s, v) => s + Number(v || 0), 0) : 0;

  const totalGross = list.reduce((s, p) => s + Number(p.gross_amount), 0);
  const totalNet = list.reduce((s, p) => s + Number(p.net_amount), 0);
  const paid = list.filter((p) => p.status === "paid").length;

  const t = await getTranslations("reports");

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("index_title")}
          </Link>
        }
        title={<>{t("ps_title")} {t(`month_${month}`)} <BanglaDigit value={year} /></>}
        subtitle={t("ps_subtitle", { month, year })}
        impact={[
          { label: <>{t("ps_impact_gross")} · ৳ <BanglaDigit value={totalGross.toLocaleString("en-IN")} /></>, tone: "default" },
          { label: <>{t("ps_impact_net")} · ৳ <BanglaDigit value={totalNet.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <><BanglaDigit value={paid} /> / <BanglaDigit value={list.length} /> {t("ps_impact_paid_ratio")}</>, tone: paid === list.length ? "success" : "warning" },
        ]}
      />

      {list.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("ps_empty")}</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ps_col_employee")}</TableHead>
                  <TableHead>{t("ps_col_position")}</TableHead>
                  <TableHead className="text-right">{t("ps_col_gross")}</TableHead>
                  <TableHead className="text-right">{t("ps_col_deduct")}</TableHead>
                  <TableHead className="text-right">{t("ps_col_net_amt")}</TableHead>
                  <TableHead>{t("ps_col_status_label")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.school_users?.full_name_bn ?? p.school_users?.full_name_en ?? "—"}</TableCell>
                    <TableCell className="text-xs"><Badge variant="outline">{p.school_users?.role ?? "—"}</Badge></TableCell>
                    <TableCell className="text-right"><BanglaDigit value={Number(p.gross_amount).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right text-destructive"><BanglaDigit value={sumDeductions(p.deductions).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right font-medium"><BanglaDigit value={Number(p.net_amount).toLocaleString("en-IN")} /></TableCell>
                    <TableCell>
                      <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                        {p.status === "paid" ? t("ps_status_paid_label") : p.status === "approved" ? t("ps_status_approved") : t("ps_status_draft_label")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
