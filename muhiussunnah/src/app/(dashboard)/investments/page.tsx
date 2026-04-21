import { TrendingUp } from "lucide-react";
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
import { AddInvestmentForm } from "./add-investment-form";

export default async function InvestmentsPage() {
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("investments")
    .select("id, title, principal, return_expected, start_date, maturity_date, status, notes, investment_returns(id, amount)")
    .eq("school_id", membership.school_id)
    .order("start_date", { ascending: false });

  const list = (data ?? []) as Array<{
    id: string; title: string; principal: number; return_expected: number | null;
    start_date: string; maturity_date: string | null; status: string; notes: string | null;
    investment_returns: { id: string; amount: number }[];
  }>;

  const totalPrincipal = list.reduce((s, i) => s + Number(i.principal), 0);
  const totalReturns = list.reduce((s, i) => s + i.investment_returns.reduce((a, r) => a + Number(r.amount), 0), 0);

  const t = await getTranslations("investments");

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: <>{t("impact_invested")} · ৳ <BanglaDigit value={totalPrincipal.toLocaleString("en-IN")} /></>, tone: "default" },
          { label: <>{t("impact_returns")} · ৳ <BanglaDigit value={totalReturns.toLocaleString("en-IN")} /></>, tone: "success" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_title")}</TableHead>
                      <TableHead>{t("col_start")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_maturity")}</TableHead>
                      <TableHead className="text-right">{t("col_principal")}</TableHead>
                      <TableHead className="text-right">{t("col_returns")}</TableHead>
                      <TableHead>{t("col_status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((i) => {
                      const returnsTotal = i.investment_returns.reduce((a, r) => a + Number(r.amount), 0);
                      return (
                        <TableRow key={i.id}>
                          <TableCell>
                            <div className="font-medium">{i.title}</div>
                            {i.notes ? <div className="text-xs text-muted-foreground line-clamp-1">{i.notes}</div> : null}
                          </TableCell>
                          <TableCell className="text-xs"><BengaliDate value={i.start_date} /></TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {i.maturity_date ? <BengaliDate value={i.maturity_date} /> : "—"}
                          </TableCell>
                          <TableCell className="text-right">৳ <BanglaDigit value={Number(i.principal).toLocaleString("en-IN")} /></TableCell>
                          <TableCell className="text-right text-success">
                            {returnsTotal > 0 ? <>৳ <BanglaDigit value={returnsTotal.toLocaleString("en-IN")} /></> : "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${
                              i.status === "active" ? "bg-primary/10 text-primary" :
                              i.status === "matured" ? "bg-success/10 text-success" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {(() => {
                                try { return t(`status_${i.status}`); } catch { return i.status; }
                              })()}
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
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">{t("sidebar_title")}</h2>
              <AddInvestmentForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
