import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { FeesSubNav } from "../nav";

export default async function PaymentsLogPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("payments")
    .select(`
      id, amount, method, transaction_id, receipt_no, paid_at, status,
      invoice_id, fee_invoices ( invoice_no ),
      students ( id, name_bn )
    `)
    .eq("school_id", membership.school_id)
    .order("paid_at", { ascending: false })
    .limit(500);

  const payments = (data ?? []) as Array<{
    id: string; amount: number; method: string; transaction_id: string | null; receipt_no: string | null;
    paid_at: string; status: string;
    invoice_id: string | null; fee_invoices: { invoice_no: string } | null;
    students: { id: string; name_bn: string } | null;
  }>;

  const completed = payments.filter((p) => p.status === "completed");
  const totalCollected = completed.reduce((s, p) => s + Number(p.amount), 0);
  const t = await getTranslations("fees");

  return (
    <>
      <PageHeader
        title={t("payments_page_title")}
        subtitle={t("payments_page_subtitle", {
          count: payments.length,
          collected: totalCollected.toLocaleString("en-IN"),
        })}
        impact={[{
          label: t("payments_impact_done", { count: completed.length }),
          tone: "success",
        }]}
      />
      <FeesSubNav active="payments" schoolSlug={schoolSlug} />

      <div className="mt-4">
        {payments.length === 0 ? (
          <EmptyState title={t("payments_empty_title")} body={t("payments_empty_body")} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("col_receipt")}</TableHead>
                    <TableHead>{t("col_student")}</TableHead>
                    <TableHead>{t("col_invoice")}</TableHead>
                    <TableHead>{t("col_method")}</TableHead>
                    <TableHead>{t("col_date")}</TableHead>
                    <TableHead className="text-right">{t("col_amount")}</TableHead>
                    <TableHead>{t("col_status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.receipt_no ?? "—"}</TableCell>
                      <TableCell>
                        {p.students ? (
                          <Link href={`/students/${p.students.id}`} className="hover:underline">
                            {p.students.name_bn}
                          </Link>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.invoice_id ? (
                          <Link href={`/fees/invoices/${p.invoice_id}`} className="text-primary hover:underline">
                            {p.fee_invoices?.invoice_no ?? p.invoice_id.slice(0, 8)}
                          </Link>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs"><span className="rounded-full bg-muted px-2 py-0.5">{p.method}</span></TableCell>
                      <TableCell className="text-xs"><BengaliDate value={p.paid_at} /></TableCell>
                      <TableCell className="text-right">৳ <BanglaDigit value={Number(p.amount).toLocaleString("en-IN")} /></TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === "completed" ? "bg-success/10 text-success" :
                          p.status === "pending" ? "bg-warning/10 text-warning-foreground dark:text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {p.status}
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
    </>
  );
}
