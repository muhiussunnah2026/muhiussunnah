import { Banknote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { GeneratePayrollPanel } from "./generate-panel";
import { MarkPaidButton } from "./mark-paid";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function PayrollPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
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

  const t = await getTranslations("payroll");

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle", {
          month, year,
          count: list.length,
          total: totalPayroll.toLocaleString("en-IN"),
        })}
        impact={[
          { label: <>{t("impact_paid")} · <BanglaDigit value={paid} /> / <BanglaDigit value={list.length} /></>, tone: "success" },
          { label: <>{t("impact_total")} · ৳ <BanglaDigit value={totalPayroll.toLocaleString("en-IN")} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<Banknote className="size-8" />}
              title={t("empty_title", { month, year })}
              body={t("empty_body")}
              proTip={t("empty_tip")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_name")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_role")}</TableHead>
                      <TableHead className="text-right">{t("col_basic")}</TableHead>
                      <TableHead className="text-right">{t("col_gross")}</TableHead>
                      <TableHead className="text-right">{t("col_net")}</TableHead>
                      <TableHead>{t("col_status")}</TableHead>
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
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">{t("status_paid")}</span>
                          ) : (
                            <MarkPaidButton id={r.id} schoolSlug={schoolSlug} />
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
          <GeneratePayrollPanel initialMonth={month} initialYear={year} schoolSlug={schoolSlug} />
        </aside>
      </div>
    </>
  );
}
