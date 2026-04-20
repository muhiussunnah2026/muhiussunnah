import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddExpenseForm } from "./add-expense-form";

export default async function ExpensesPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Independent — both keyed off school_id.
  const [expensesRes, headsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("expenses")
      .select("id, date, amount, paid_to, payment_method, description, expense_heads ( name_bn, category )")
      .eq("school_id", membership.school_id)
      .order("date", { ascending: false })
      .limit(200),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("expense_heads")
      .select("id, name_bn, category")
      .eq("school_id", membership.school_id)
      .eq("is_active", true)
      .order("display_order"),
  ]);
  const { data: expenses } = expensesRes;
  const { data: heads } = headsRes;

  const list = (expenses ?? []) as Array<{
    id: string; date: string; amount: number; paid_to: string | null; payment_method: string;
    description: string | null; expense_heads: { name_bn: string; category: string } | null;
  }>;
  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  // This month only
  const now = new Date();
  const thisMonth = list.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <PageHeader
        title="খরচ ব্যবস্থাপনা"
        subtitle="প্রতিটি খরচ নির্দিষ্ট হেডে রেকর্ড করুন। এ মাসে, গত মাসের সাথে তুলনা — ড্যাশবোর্ডে দেখাবে।"
        impact={[
          { label: <>এ মাসে · ৳ <BanglaDigit value={thisMonthTotal.toLocaleString("en-IN")} /></>, tone: "warning" },
          { label: <>মোট · ৳ <BanglaDigit value={total.toLocaleString("en-IN")} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-8" />}
              title="এখনও কোন খরচ রেকর্ড করা হয়নি"
              body="ডান পাশের ফর্ম থেকে প্রথম খরচ যোগ করুন। ২৪টি ডিফল্ট হেড seed হয়েছে রেজিস্ট্রেশনের সময়।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>হেড</TableHead>
                      <TableHead>বিবরণ</TableHead>
                      <TableHead>পদ্ধতি</TableHead>
                      <TableHead className="text-right">amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs whitespace-nowrap"><BengaliDate value={e.date} /></TableCell>
                        <TableCell>
                          <div>{e.expense_heads?.name_bn ?? "—"}</div>
                          {e.paid_to ? <div className="text-xs text-muted-foreground">→ {e.paid_to}</div> : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.description ?? "—"}</TableCell>
                        <TableCell className="text-xs"><span className="rounded-full bg-muted px-2 py-0.5">{e.payment_method}</span></TableCell>
                        <TableCell className="text-right">৳ <BanglaDigit value={Number(e.amount).toLocaleString("en-IN")} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন খরচ</h2>
              <AddExpenseForm heads={heads ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
