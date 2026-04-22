import { getTranslations } from "next-intl/server";
import { BarChart3, Building2, Users, CreditCard, TrendingUp, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";

/** Build [month-key, label] list for the last N months in chronological order. */
function lastNMonths(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    const label = m.toLocaleDateString(undefined, { month: "short" });
    out.push({ key, label });
  }
  return out;
}

export default async function AnalyticsPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const [schoolsRes, studentsRes, staffRes, subsRes] = await Promise.all([
    admin
      .from("schools")
      .select("id, subscription_status, subscription_plan_id, created_at, type, is_platform_owned"),
    admin.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin
      .from("school_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin.from("subscription_plans").select("id, price_bdt"),
  ]);

  type SchoolLite = {
    id: string;
    subscription_status: string;
    subscription_plan_id: string | null;
    created_at: string;
    type: "school" | "madrasa" | "both";
    is_platform_owned: boolean;
  };
  const schools = (schoolsRes.data ?? []) as SchoolLite[];
  const planPrice = new Map<string, number>();
  for (const p of (subsRes.data ?? []) as { id: string; price_bdt: number }[]) {
    planPrice.set(p.id, Number(p.price_bdt));
  }

  const totalSchools = schools.length;
  const totalStudents = (studentsRes.count ?? 0) as number;
  const totalStaff = (staffRes.count ?? 0) as number;

  const activeCount = schools.filter((s) => s.subscription_status === "active").length;
  const trialCount = schools.filter((s) => s.subscription_status === "trial").length;
  const pastDueCount = schools.filter((s) => s.subscription_status === "past_due").length;

  // MRR ignores platform-owned tenants (not paying customers).
  const mrr = schools
    .filter(
      (s) =>
        s.subscription_status === "active" &&
        s.subscription_plan_id &&
        !s.is_platform_owned,
    )
    .reduce((sum, s) => sum + (planPrice.get(s.subscription_plan_id!) ?? 0), 0);

  // New-school trend over last 6 months
  const months = lastNMonths(6);
  const bucket = new Map<string, number>(months.map((m) => [m.key, 0]));
  for (const s of schools) {
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  const maxSignup = Math.max(1, ...Array.from(bucket.values()));

  // School type distribution
  const typeCounts = {
    school: schools.filter((s) => s.type === "school").length,
    madrasa: schools.filter((s) => s.type === "madrasa").length,
    both: schools.filter((s) => s.type === "both").length,
  };
  const typeTotal = Math.max(1, typeCounts.school + typeCounts.madrasa + typeCounts.both);

  return (
    <>
      <PageHeader
        title={t("analytics_page_title")}
        subtitle={t("analytics_page_subtitle")}
        impact={[
          {
            label: (
              <>
                {t("analytics_impact_mrr")} · ৳{" "}
                <BanglaDigit value={mrr.toLocaleString("en-IN")} />
              </>
            ),
            tone: "accent",
          },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label={t("analytics_metric_schools")} value={totalSchools} icon={<Building2 className="size-4" />} />
        <MetricCard label={t("analytics_metric_students")} value={totalStudents} icon={<Users className="size-4" />} tone="success" />
        <MetricCard label={t("analytics_metric_staff")} value={totalStaff} icon={<UserCheck className="size-4" />} />
        <MetricCard label={t("analytics_metric_active_subs")} value={activeCount} icon={<CreditCard className="size-4" />} tone="success" />
        <MetricCard label={t("analytics_metric_trial")} value={trialCount} tone="accent" />
        <MetricCard label={t("analytics_metric_past_due")} value={pastDueCount} tone={pastDueCount > 0 ? "warning" : "default"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("analytics_signups_title")}</h2>
            </div>
            <div className="flex items-end gap-2" style={{ height: 180 }}>
              {months.map((m) => {
                const count = bucket.get(m.key) ?? 0;
                const h = Math.max(4, (count / maxSignup) * 150);
                return (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-md bg-gradient-primary shadow-sm shadow-primary/20"
                      style={{ height: `${h}px` }}
                      title={`${m.label}: ${count}`}
                    />
                    <div className="text-[11px] text-muted-foreground">{m.label}</div>
                    <div className="text-xs font-medium">
                      <BanglaDigit value={count} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("analytics_types_title")}</h2>
            </div>
            <div className="flex flex-col gap-4">
              {(
                [
                  { key: "school", label: t("schools_type_school"), color: "bg-primary" },
                  { key: "madrasa", label: t("schools_type_madrasa"), color: "bg-emerald-500" },
                  { key: "both", label: t("schools_type_both"), color: "bg-purple-500" },
                ] as const
              ).map((row) => {
                const n = typeCounts[row.key];
                const pct = Math.round((n / typeTotal) * 100);
                return (
                  <div key={row.key}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{row.label}</span>
                      <span className="text-muted-foreground">
                        <BanglaDigit value={n} /> · <BanglaDigit value={pct} />%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
