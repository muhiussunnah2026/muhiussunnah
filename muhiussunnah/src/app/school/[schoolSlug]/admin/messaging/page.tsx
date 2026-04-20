import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function MessagingReportPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = await supabaseServer();
  // All five independent — logs + topups by school_id, school by id.
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
        title="মেসেজিং রিপোর্ট"
        subtitle="সর্বশেষ ৩০ দিনের SMS / WhatsApp / Push ব্যবহার। SMS ক্রেডিট ব্যালেন্স শেষ হওয়ার আগেই topup করে রাখুন।"
        impact={[
          { label: <>SMS ক্রেডিট · ৳ <BanglaDigit value={Number(school?.sms_credit_balance_bdt ?? 0).toLocaleString("en-IN")} /></>, tone: Number(school?.sms_credit_balance_bdt ?? 0) > 100 ? "success" : "warning" },
          { label: <>SMS খরচ ৩০ দিনে · ৳ <BanglaDigit value={smsCost.toFixed(2)} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="SMS পাঠান ো" value={smsSent} trendLabel={smsFailed > 0 ? `${smsFailed} ব্যর্থ` : "সব সফল"} />
        <MetricCard label="WhatsApp" value={waSent} trendLabel={`৳ ${waCost.toFixed(2)} খরচ`} />
        <MetricCard label="Push notifications" value={pushSent} />
        <MetricCard label="মোট মেসেজ" value={smsSent + waSent + pushSent} tone="accent" />
      </div>

      {topupList.length > 0 ? (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">সাম্প্রতিক SMS ক্রেডিট topup</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>পদ্ধতি</TableHead>
                  <TableHead className="text-right">amount</TableHead>
                  <TableHead className="text-right">balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topupList.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs"><BengaliDate value={t.created_at} /></TableCell>
                    <TableCell className="text-xs"><span className="rounded-full bg-muted px-2 py-0.5">{t.method}</span></TableCell>
                    <TableCell className="text-right">৳ <BanglaDigit value={Number(t.amount_bdt).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right font-medium">৳ <BanglaDigit value={Number(t.balance_after).toLocaleString("en-IN")} /></TableCell>
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
