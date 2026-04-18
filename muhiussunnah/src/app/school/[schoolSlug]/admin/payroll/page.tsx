import { Banknote } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { GeneratePayrollPanel } from "./generate-panel";
import { MarkPaidButton } from "./mark-paid";

type PageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function PayrollPage({ params, searchParams }: PageProps) {
  const { schoolSlug } = await params;
  const search = await searchParams;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const now = new Date();
  const month = Number(search.month ?? now.getMonth() + 1);
  const year = Number(search.year ?? now.getFullYear());

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("staff_salaries")
    .select("id, basic, gross_amount, net_amount, status, paid_on, school_users!inner(id, full_name_bn, role, school_id)")
    .eq("school_users.school_id", membership.school_id)
    .eq("month", month)
    .eq("year", year)
    .order("status", { ascending: true });

  const list = (data ?? []) as Array<{
    id: string; basic: number; gross_amount: number; net_amount: number;
    status: string; paid_on: string | null;
    school_users: { full_name_bn: string | null; role: string };
  }>;

  const totalPayroll = list.reduce((s, r) => s + Number(r.net_amount), 0);
  const paid = list.filter((r) => r.status === "paid").length;

  return (
    <>
      <PageHeader
        title="বেতন ব্যবস্থাপনা"
        subtitle={`${month}/${year} · ${list.length.toString()} টি এন্ট্রি · মোট ৳ ${totalPayroll.toLocaleString("en-IN")}`}
        impact={[
          { label: <>পরিশোধিত · <BanglaDigit value={paid} /> / <BanglaDigit value={list.length} /></>, tone: "success" },
          { label: <>মোট · ৳ <BanglaDigit value={totalPayroll.toLocaleString("en-IN")} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<Banknote className="size-8" />}
              title={`${month}/${year} মাসের কোন এন্ট্রি নেই`}
              body="ডান পাশ থেকে এই মাসের draft salary তৈরি করুন। প্রতি staff-এর metadata.basic_salary থেকে hisab হবে।"
              proTip="Staff profile থেকে basic_salary + allowances + deductions সেট করে রাখুন, প্রতি মাসে এক ক্লিকে বেতন তৈরি হবে।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead className="hidden md:table-cell">ভূমিকা</TableHead>
                      <TableHead className="text-right">Basic</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.school_users.full_name_bn ?? "—"}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{r.school_users.role}</TableCell>
                        <TableCell className="text-right">৳ <BanglaDigit value={Number(r.basic).toLocaleString("en-IN")} /></TableCell>
                        <TableCell className="text-right">৳ <BanglaDigit value={Number(r.gross_amount).toLocaleString("en-IN")} /></TableCell>
                        <TableCell className="text-right font-semibold">৳ <BanglaDigit value={Number(r.net_amount).toLocaleString("en-IN")} /></TableCell>
                        <TableCell>
                          {r.status === "paid" ? (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">পরিশোধিত</span>
                          ) : (
                            <MarkPaidButton schoolSlug={schoolSlug} id={r.id} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        <aside>
          <GeneratePayrollPanel schoolSlug={schoolSlug} initialMonth={month} initialYear={year} />
        </aside>
      </div>
    </>
  );
}
