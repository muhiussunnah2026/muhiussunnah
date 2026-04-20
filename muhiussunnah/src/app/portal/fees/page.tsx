import Link from "next/link";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { PORTAL_ROLES } from "@/lib/auth/roles";

const statusLabel: Record<string, string> = {
  unpaid: "বকেয়া", partial: "আংশিক", paid: "পরিশোধিত", overdue: "মেয়াদোত্তীর্ণ", canceled: "বাতিল",
};

export default async function PortalFeesPage() {
  const membership = await requireActiveRole(PORTAL_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Resolve children ids
  let childIds: string[] = [];
  if (membership.role === "PARENT") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: guardians } = await (supabase as any)
      .from("student_guardians")
      .select("student_id")
      .eq("user_id", membership.school_user_id);
    childIds = ((guardians ?? []) as { student_id: string }[]).map((g) => g.student_id);
  }

  if (childIds.length === 0) {
    return (
      <>
        <PageHeader title="ফি ও পেমেন্ট" subtitle="আপনার সন্তানের বকেয়া ফি এখানে দেখাবে।" />
        <EmptyState
          icon={<CreditCard className="size-8" />}
          title="সন্তানের সাথে লিংক করা নেই"
          body="স্কুল অ্যাডমিনকে জানান যেন আপনাকে সন্তানের সাথে যুক্ত করেন।"
        />
      </>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase as any)
    .from("fee_invoices")
    .select("id, invoice_no, month, year, total_amount, paid_amount, due_amount, status, due_date, students(name_bn)")
    .in("student_id", childIds)
    .order("created_at", { ascending: false });

  const list = (invoices ?? []) as Array<{
    id: string; invoice_no: string; month: number; year: number;
    total_amount: number; paid_amount: number; due_amount: number; status: string;
    due_date: string | null;
    students: { name_bn: string } | null;
  }>;

  const outstanding = list.filter((i) => Number(i.due_amount) > 0);
  const totalDue = outstanding.reduce((s, i) => s + Number(i.due_amount), 0);
  const paidList = list.filter((i) => i.status === "paid");

  return (
    <>
      <PageHeader
        title="ফি ও পেমেন্ট"
        subtitle={totalDue > 0 ? `মোট ৳ ${totalDue.toLocaleString("en-IN")} বাকি আছে` : "কোন বকেয়া নেই ✨"}
        impact={[
          { label: <>বকেয়া · ৳ <BanglaDigit value={totalDue.toLocaleString("en-IN")} /></>, tone: totalDue > 0 ? "warning" : "success" },
          { label: <>পরিশোধিত · <BanglaDigit value={paidList.length} /> টি</>, tone: "default" },
        ]}
      />

      {outstanding.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-warning-foreground dark:text-warning">🔔 বকেয়া ইনভয়েস</h2>
          <div className="grid gap-3">
            {outstanding.map((inv) => (
              <Card key={inv.id} className="border-warning/30">
                <CardContent className="flex flex-col items-start justify-between gap-3 p-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{inv.invoice_no}</span>
                      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning-foreground dark:text-warning">
                        {statusLabel[inv.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">
                      {inv.students?.name_bn} · <BanglaDigit value={inv.month} />/<BanglaDigit value={inv.year} />
                      {inv.due_date ? <> · Due <BengaliDate value={inv.due_date} /></> : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">৳ <BanglaDigit value={Number(inv.due_amount).toLocaleString("en-IN")} /></div>
                      <div className="text-xs text-muted-foreground">
                        মোট ৳ <BanglaDigit value={Number(inv.total_amount).toLocaleString("en-IN")} />
                      </div>
                    </div>
                    <Link
                      href={`/portal/fees/pay/${inv.id}`}
                      className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
                    >
                      <CreditCard className="me-1 size-3.5" /> এখনই পেমেন্ট
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {paidList.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">পরিশোধিত ইতিহাস</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/60">
                {paidList.slice(0, 20).map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-mono text-xs">{inv.invoice_no}</div>
                      <div className="text-xs text-muted-foreground">
                        {inv.students?.name_bn} · <BanglaDigit value={inv.month} />/<BanglaDigit value={inv.year} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">৳ <BanglaDigit value={Number(inv.paid_amount).toLocaleString("en-IN")} /></div>
                      <div className="text-xs text-success">✓ পরিশোধিত</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </>
  );
}
