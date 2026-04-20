import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { PORTAL_ROLES } from "@/lib/auth/roles";
import { isSslCommerzConfigured } from "@/lib/payments/sslcommerz";
import { isBkashConfigured } from "@/lib/payments/bkash";
import { isNagadConfigured } from "@/lib/payments/nagad";
import { PayButtons } from "./pay-buttons";

type PageProps = { params: Promise<{ invoiceId: string }> };

export default async function PayInvoicePage({ params }: PageProps) {
  const { invoiceId } = await params;
  const membership = await requireActiveRole(PORTAL_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inv } = await (supabase as any)
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, total_amount, paid_amount, due_amount, status, due_date,
      students ( id, name_bn, sections ( name, classes ( name_bn ) ) ),
      fee_invoice_items ( id, amount, waiver, description, fee_heads ( name_bn ) )
    `)
    .eq("id", invoiceId)
    .eq("school_id", membership.school_id)
    .single();

  if (!inv) notFound();

  const invoice = inv as {
    id: string; invoice_no: string; month: number; year: number;
    total_amount: number; paid_amount: number; due_amount: number; status: string; due_date: string | null;
    students: { id: string; name_bn: string; sections: { name: string; classes: { name_bn: string } } | null } | null;
    fee_invoice_items: { id: string; amount: number; waiver: number; description: string | null; fee_heads: { name_bn: string } | null }[];
  };

  const dueAmount = Number(invoice.due_amount);
  const gateways = {
    sslcommerz: isSslCommerzConfigured(),
    bkash: isBkashConfigured(),
    nagad: isNagadConfigured(),
  };

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/portal/fees`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> বকেয়া তালিকা
          </Link>
        }
        title="অনলাইন পেমেন্ট"
        subtitle={`${invoice.invoice_no} · ${invoice.students?.name_bn} · <BanglaDigit value={${invoice.month}} />/${invoice.year}`}
        impact={[
          { label: <>বাকি · ৳ <BanglaDigit value={dueAmount.toLocaleString("en-IN")} /></>, tone: "warning" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">ইনভয়েস বিবরণ</h3>
              <ul className="divide-y divide-border/60">
                {invoice.fee_invoice_items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{it.fee_heads?.name_bn ?? it.description}</span>
                    <span>৳ <BanglaDigit value={(Number(it.amount) - Number(it.waiver)).toLocaleString("en-IN")} /></span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="text-sm text-muted-foreground">বাকি</span>
                <span className="text-2xl font-bold">৳ <BanglaDigit value={dueAmount.toLocaleString("en-IN")} /></span>
              </div>
              {invoice.due_date ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Due: <BengaliDate value={invoice.due_date} />
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="border-primary/30">
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">পেমেন্ট পদ্ধতি নির্বাচন</h3>
              <PayButtons invoiceId={invoice.id} gateways={gateways} schoolSlug={schoolSlug} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                <span>Secure — SSL encryption · কার্ড/MFS তথ্য আমরা সংরক্ষণ করি না</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
