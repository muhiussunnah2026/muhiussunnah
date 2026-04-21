import { getTranslations } from "next-intl/server";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";
import { TopupForm } from "./topup-form";

export default async function SmsCreditsPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data: schools } = await admin
    .from("schools")
    .select("id, slug, name_bn, sms_credit_balance_bdt, subscription_status")
    .order("sms_credit_balance_bdt", { ascending: true });

  const list = (schools ?? []) as { id: string; slug: string; name_bn: string; sms_credit_balance_bdt: number; subscription_status: string }[];
  const totalBalance = list.reduce((s, x) => s + Number(x.sms_credit_balance_bdt ?? 0), 0);
  const lowBalance = list.filter((x) => Number(x.sms_credit_balance_bdt ?? 0) < 100);

  return (
    <>
      <PageHeader
        title={t("sms_page_title")}
        subtitle={t("sms_page_subtitle")}
        impact={[
          { label: <>{t("sms_tally_total")} · ৳ <BanglaDigit value={totalBalance.toLocaleString("en-IN")} /></>, tone: "accent" },
          { label: t("sms_tally_low", { count: lowBalance.length }), tone: lowBalance.length > 0 ? "warning" : "success" },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("sms_metric_total_schools")} value={list.length} />
        <MetricCard label={t("sms_metric_pool")} value={totalBalance.toFixed(2)} valuePrefix="৳ " tone="accent" />
        <MetricCard label={t("sms_metric_low")} value={lowBalance.length} tone={lowBalance.length > 0 ? "warning" : "default"} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<MessageSquare className="size-8" />} title={t("sms_empty_title")} body={t("sms_empty_body")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sms_col_school")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("sms_col_sub")}</TableHead>
                    <TableHead className="text-right">{t("sms_col_balance")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.name_bn}</div>
                        <div className="text-xs text-muted-foreground font-mono">/{s.slug}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{s.subscription_status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={Number(s.sms_credit_balance_bdt) < 100 ? "text-warning-foreground dark:text-warning font-medium" : ""}>
                          ৳ <BanglaDigit value={Number(s.sms_credit_balance_bdt).toLocaleString("en-IN")} />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">{t("sms_topup_heading")}</h2>
              <TopupForm schools={list.map((s) => ({ id: s.id, name: s.name_bn, slug: s.slug }))} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
