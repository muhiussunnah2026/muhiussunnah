import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export default async function MessagingReportPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const t = await getTranslations("messaging");

  const schoolSlug = membership.school_slug;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = await supabaseServer();
  const [smsLogsRes, whatsappLogsRes, pushLogsRes, schoolRes, topupsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sms_logs")
      .select("status, cost, provider, sent_at")
      .eq("school_id", membership.school_id)
      .gte("created_at", thirtyDaysAgo),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("whatsapp_logs")
      .select("status, cost, provider, sent_at")
      .eq("school_id", membership.school_id)
      .gte("created_at", thirtyDaysAgo),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("push_logs")
      .select("status, sent_at")
      .eq("school_id", membership.school_id)
      .gte("created_at", thirtyDaysAgo),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("schools")
      .select("sms_credit_balance_bdt")
      .eq("id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sms_credit_topups")
      .select("amount_bdt, method, created_at, balance_after")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const { data: smsLogs } = smsLogsRes;
  const { data: whatsappLogs } = whatsappLogsRes;
  const { data: pushLogs } = pushLogsRes;
  const { data: school } = schoolRes;
  const { data: topups } = topupsRes;

  const sms = (smsLogs ?? []) as { status: string; cost: number; provider: string | null; sent_at: string | null }[];
  const wa = (whatsappLogs ?? []) as { status: string; cost: number; provider: string | null; sent_at: string | null }[];
  const push = (pushLogs ?? []) as { status: string; sent_at: string | null }[];
  const topupList = (topups ?? []) as { amount_bdt: number; method: string; created_at: string; balance_after: number }[];

  const smsSent = sms.filter((l) => l.status === "sent" || l.status === "delivered").length;
  const smsFailed = sms.filter((l) => l.status === "failed").length;
  const smsCost = sms.reduce((s, l) => s + Number(l.cost ?? 0), 0);

  const waSent = wa.filter((l) => l.status === "sent" || l.status === "delivered").length;
  const waCost = wa.reduce((s, l) => s + Number(l.cost ?? 0), 0);

  const pushSent = push.filter((l) => l.status === "sent" || l.status === "queued").length;

  return (
    <>
      <PageHeader
        title={t("report_title")}
        subtitle={t("report_subtitle")}
        impact={[
          { label: <>{t("report_sms_balance")} · ৳ <BanglaDigit value={Number(school?.sms_credit_balance_bdt ?? 0).toLocaleString("en-IN")} /></>, tone: Number(school?.sms_credit_balance_bdt ?? 0) > 100 ? "success" : "warning" },
          { label: <>{t("report_sms_cost_30d")} · ৳ <BanglaDigit value={smsCost.toFixed(2)} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={t("metric_sms_sent")} value={smsSent} trendLabel={smsFailed > 0 ? t("metric_sms_failed", { count: smsFailed }) : t("metric_sms_all_ok")} />
        <MetricCard label={t("metric_whatsapp")} value={waSent} trendLabel={t("metric_whatsapp_cost", { cost: waCost.toFixed(2) })} />
        <MetricCard label={t("metric_push")} value={pushSent} />
        <MetricCard label={t("metric_total")} value={smsSent + waSent + pushSent} tone="accent" />
      </div>

      {topupList.length > 0 ? (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("topup_heading")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("topup_col_date")}</TableHead>
                  <TableHead>{t("topup_col_method")}</TableHead>
                  <TableHead className="text-right">{t("topup_col_amount")}</TableHead>
                  <TableHead className="text-right">{t("topup_col_balance_after")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topupList.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs"><BengaliDate value={row.created_at} /></TableCell>
                    <TableCell className="text-xs"><span className="rounded-full bg-muted px-2 py-0.5">{row.method}</span></TableCell>
                    <TableCell className="text-right">৳ <BanglaDigit value={Number(row.amount_bdt).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right font-medium">৳ <BanglaDigit value={Number(row.balance_after).toLocaleString("en-IN")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
