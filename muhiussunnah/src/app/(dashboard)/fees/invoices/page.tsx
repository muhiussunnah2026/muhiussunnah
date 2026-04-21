import Link from "next/link";
import { Receipt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { FeesSubNav } from "../nav";
import { GenerateInvoicesPanel } from "./generate-panel";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string; status?: string; q?: string }>;
};

const statusTones: Record<string, string> = {
  unpaid: "bg-warning/10 text-warning-foreground dark:text-warning",
  partial: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
};

export default async function InvoicesListPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const now = new Date();
  const month = Number(search.month ?? now.getMonth() + 1);
  const year = Number(search.year ?? now.getFullYear());

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase as any)
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, issue_date, due_date, total_amount, paid_amount, due_amount, status,
      students ( id, name_bn, roll, student_code, sections ( name, classes ( name_bn ) ) )
    `)
    .eq("school_id", membership.school_id)
    .eq("month", month)
    .eq("year", year)
    .order("created_at", { ascending: false })
    .limit(500);

  if (search.status) q = q.eq("status", search.status);

  // Independent queries — invoice rows + class reference list for the generate panel.
  const [dataRes, classesRes] = await Promise.all([
    q,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn")
      .eq("school_id", membership.school_id)
      .order("display_order"),
  ]);
  const { data } = dataRes;
  const { data: classes } = classesRes;
  const invoices = (data ?? []) as Array<{
    id: string; invoice_no: string; month: number; year: number; issue_date: string | null; due_date: string | null;
    total_amount: number; paid_amount: number; due_amount: number; status: string;
    students: { id: string; name_bn: string; roll: number | null; student_code: string;
      sections: { name: string; classes: { name_bn: string } } | null } | null;
  }>;

  const totalDue = invoices.reduce((sum, i) => sum + Number(i.due_amount ?? 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + Number(i.paid_amount ?? 0), 0);
  const totalBilled = invoices.reduce((sum, i) => sum + Number(i.total_amount ?? 0), 0);
  const collectionPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const t = await getTranslations("fees");

  return (
    <>
      <PageHeader
        title={t("invoices_page_title")}
        subtitle={t("invoices_page_subtitle", {
          month, year,
          count: invoices.length,
          collected: totalCollected.toLocaleString("en-IN"),
          due: totalDue.toLocaleString("en-IN"),
        })}
        impact={[
          { label: <>{t("impact_collected")} · ৳ <BanglaDigit value={totalCollected.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>{t("impact_due")} · ৳ <BanglaDigit value={totalDue.toLocaleString("en-IN")} /></>, tone: totalDue > 0 ? "warning" : "default" },
          { label: <>{t("impact_collection_rate")} · <BanglaDigit value={collectionPct} />%</>, tone: "accent" },
        ]}
      />
      <FeesSubNav active="invoices" schoolSlug={schoolSlug} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<Receipt className="size-8" />}
              title={t("invoices_empty_title")}
              body={t("invoices_empty_body")}
              proTip={t("invoices_empty_tip")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_invoice")}</TableHead>
                      <TableHead>{t("col_student")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_class")}</TableHead>
                      <TableHead className="text-right">{t("col_total")}</TableHead>
                      <TableHead className="text-right">{t("col_due")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} className="cursor-pointer">
                        <TableCell>
                          <Link href={`/fees/invoices/${inv.id}`} className="font-mono text-xs underline-offset-4 hover:underline">
                            {inv.invoice_no}
                          </Link>
                          {inv.due_date ? <div className="text-xs text-muted-foreground">{t("due_prefix")} <BengaliDate value={inv.due_date} /></div> : null}
                        </TableCell>
                        <TableCell>
                          {inv.students ? (
                            <Link href={`/students/${inv.students.id}`} className="font-medium hover:underline">
                              {inv.students.name_bn}
                            </Link>
                          ) : "—"}
                          {inv.students?.roll ? <div className="text-xs text-muted-foreground">{t("roll_prefix")} <BanglaDigit value={inv.students.roll} /></div> : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {inv.students?.sections ? `${inv.students.sections.classes.name_bn} — ${inv.students.sections.name}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">৳ <BanglaDigit value={Number(inv.total_amount).toLocaleString("en-IN")} /></TableCell>
                        <TableCell className="text-right font-medium">৳ <BanglaDigit value={Number(inv.due_amount).toLocaleString("en-IN")} /></TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${statusTones[inv.status] ?? "bg-muted"}`}>
                            {(() => {
                              try { return t(`status_${inv.status}`); } catch { return inv.status; }
                            })()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <aside>
          <GenerateInvoicesPanel classes={classes ?? []} schoolSlug={schoolSlug} />
        </aside>
      </div>
    </>
  );
}
