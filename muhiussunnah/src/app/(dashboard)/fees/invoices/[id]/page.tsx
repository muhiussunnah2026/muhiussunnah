import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { RecordPaymentForm } from "./record-payment-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inv } = await (supabase as any)
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, issue_date, due_date,
      total_amount, paid_amount, due_amount, status, late_fee, notes,
      students ( id, name_bn, student_code, roll, sections ( name, classes ( name_bn ) ) ),
      fee_invoice_items ( id, amount, waiver, waiver_reason, description, fee_heads ( name_bn ) ),
      payments ( id, amount, method, receipt_no, paid_at, status, transaction_id )
    `)
    .eq("id", id)
    .eq("school_id", membership.school_id)
    .single();

  if (!inv) notFound();

  const invoice = inv as {
    id: string; invoice_no: string; month: number; year: number; issue_date: string | null; due_date: string | null;
    total_amount: number; paid_amount: number; due_amount: number; status: string; late_fee: number; notes: string | null;
    students: { id: string; name_bn: string; student_code: string; roll: number | null;
      sections: { name: string; classes: { name_bn: string } } | null } | null;
    fee_invoice_items: { id: string; amount: number; waiver: number; waiver_reason: string | null; description: string | null; fee_heads: { name_bn: string } | null }[];
    payments: { id: string; amount: number; method: string; receipt_no: string; paid_at: string; status: string; transaction_id: string | null }[];
  };

  const dueAmount = Number(invoice.due_amount);

  const t = await getTranslations("fees");

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/fees/invoices`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("invoice_back")}
          </Link>
        }
        title={t("invoice_title", { no: invoice.invoice_no })}
        subtitle={
          <>
            {invoice.students?.name_bn}
            {invoice.students?.roll ? t("invoice_roll_inline", { roll: invoice.students.roll }) : null}
            {invoice.students?.sections ? <> · {invoice.students.sections.classes.name_bn} — {invoice.students.sections.name}</> : null}
          </>
        }
        impact={[
          { label: <>{t("invoice_impact_total")} · ৳ <BanglaDigit value={Number(invoice.total_amount).toLocaleString("en-IN")} /></>, tone: "default" },
          { label: <>{t("invoice_impact_paid")} · ৳ <BanglaDigit value={Number(invoice.paid_amount).toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>{t("invoice_impact_due")} · ৳ <BanglaDigit value={dueAmount.toLocaleString("en-IN")} /></>, tone: dueAmount > 0 ? "warning" : "success" },
        ]}
        actions={
          <Link href="#" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Printer className="me-1 size-3.5" /> {t("invoice_print")}
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("invoice_fee_breakdown")}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("invoice_col_description")}</TableHead>
                    <TableHead className="text-right">{t("col_amount")}</TableHead>
                    <TableHead className="text-right">{t("invoice_col_discount")}</TableHead>
                    <TableHead className="text-right">{t("invoice_col_grand_total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.fee_invoice_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>{item.fee_heads?.name_bn ?? item.description}</div>
                      </TableCell>
                      <TableCell className="text-right">৳ <BanglaDigit value={Number(item.amount).toLocaleString("en-IN")} /></TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {item.waiver > 0 ? <>৳ <BanglaDigit value={Number(item.waiver).toLocaleString("en-IN")} /></> : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">৳ <BanglaDigit value={Number(Number(item.amount) - Number(item.waiver)).toLocaleString("en-IN")} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("invoice_payment_history")}</h3>
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("invoice_no_payments")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_receipt")}</TableHead>
                      <TableHead>{t("col_method")}</TableHead>
                      <TableHead>{t("col_date")}</TableHead>
                      <TableHead className="text-right">{t("col_amount")}</TableHead>
                      <TableHead>{t("col_status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.receipt_no}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("invoice_info_card")}</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">{t("invoice_label_number")}</dt>
                <dd className="font-mono text-xs">{invoice.invoice_no}</dd>
                <dt className="text-muted-foreground">{t("invoice_label_issue_date")}</dt>
                <dd>{invoice.issue_date ? <BengaliDate value={invoice.issue_date} /> : "—"}</dd>
                <dt className="text-muted-foreground">{t("due_prefix").replace(":", "")}</dt>
                <dd>{invoice.due_date ? <BengaliDate value={invoice.due_date} /> : "—"}</dd>
                <dt className="text-muted-foreground">{t("invoice_label_status")}</dt>
                <dd>{(() => {
                  try { return t(`status_${invoice.status}`); } catch { return invoice.status; }
                })()}</dd>
              </dl>
            </CardContent>
          </Card>

          {dueAmount > 0 ? (
            <Card className="border-primary/30">
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold">{t("record_payment_heading")}</h3>
                <RecordPaymentForm invoiceId={invoice.id} maxAmount={dueAmount} schoolSlug={schoolSlug} />
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
