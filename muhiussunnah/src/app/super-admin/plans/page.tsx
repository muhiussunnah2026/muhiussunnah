import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";

type PlanRow = {
  id: string;
  code: string;
  name_bn: string;
  name_en: string;
  price_bdt: number;
  max_students: number | null;
  max_branches: number | null;
  max_sms: number | null;
  max_storage_mb: number | null;
  is_active: boolean;
  display_order: number;
};

type SchoolPlanRow = { subscription_plan_id: string | null; subscription_status: string };

function fmt(val: number | null): string {
  return val == null ? "∞" : val.toLocaleString("en-IN");
}

export default async function PlansPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: plansData } = await admin
    .from("subscription_plans")
    .select(
      "id, code, name_bn, name_en, price_bdt, max_students, max_branches, max_sms, max_storage_mb, is_active, display_order",
    )
    .order("display_order", { ascending: true });
  const plans: PlanRow[] = (plansData ?? []) as PlanRow[];

  // Count schools per plan (only active subscriptions count towards revenue)
  const { data: schoolsData } = await admin
    .from("schools")
    .select("subscription_plan_id, subscription_status");
  const countByPlan = new Map<string, number>();
  const activeCountByPlan = new Map<string, number>();
  for (const s of (schoolsData ?? []) as SchoolPlanRow[]) {
    if (!s.subscription_plan_id) continue;
    countByPlan.set(s.subscription_plan_id, (countByPlan.get(s.subscription_plan_id) ?? 0) + 1);
    if (s.subscription_status === "active") {
      activeCountByPlan.set(
        s.subscription_plan_id,
        (activeCountByPlan.get(s.subscription_plan_id) ?? 0) + 1,
      );
    }
  }

  const activePlans = plans.filter((p) => p.is_active).length;
  const estimatedMrr = plans.reduce(
    (sum, p) => sum + Number(p.price_bdt) * (activeCountByPlan.get(p.id) ?? 0),
    0,
  );

  return (
    <>
      <PageHeader
        title={t("plans_page_title")}
        subtitle={t("plans_page_subtitle")}
        impact={[
          {
            label: (
              <>
                {t("plans_impact_total")} · <BanglaDigit value={plans.length} />
              </>
            ),
            tone: "accent",
          },
          {
            label: (
              <>
                {t("plans_impact_mrr")} · ৳{" "}
                <BanglaDigit value={estimatedMrr.toLocaleString("en-IN")} />
              </>
            ),
            tone: "success",
          },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("plans_metric_total")} value={plans.length} />
        <MetricCard label={t("plans_metric_active")} value={activePlans} tone="success" />
        <MetricCard
          label={t("plans_metric_mrr")}
          value={estimatedMrr.toFixed(0)}
          valuePrefix="৳ "
          tone="accent"
        />
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-8" />}
          title={t("plans_empty_title")}
          body={t("plans_empty_body")}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("plans_col_plan")}</TableHead>
                  <TableHead>{t("plans_col_price")}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    {t("plans_col_students")}
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    {t("plans_col_branches")}
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    {t("plans_col_sms")}
                  </TableHead>
                  <TableHead className="text-right hidden lg:table-cell">
                    {t("plans_col_storage")}
                  </TableHead>
                  <TableHead className="text-right">{t("plans_col_active_schools")}</TableHead>
                  <TableHead>{t("plans_col_status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => {
                  const active = activeCountByPlan.get(p.id) ?? 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name_bn}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">{p.code}</span> · {p.name_en}
                        </div>
                      </TableCell>
                      <TableCell>
                        ৳ <BanglaDigit value={Number(p.price_bdt).toLocaleString("en-IN")} />
                        <div className="text-xs text-muted-foreground">{t("plans_per_month")}</div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell font-mono">
                        {fmt(p.max_students)}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell font-mono">
                        {fmt(p.max_branches)}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell font-mono">
                        {fmt(p.max_sms)}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell font-mono">
                        {p.max_storage_mb == null
                          ? "∞"
                          : `${(p.max_storage_mb / 1024).toFixed(1)} GB`}
                      </TableCell>
                      <TableCell className="text-right">
                        <BanglaDigit value={active} />
                        {(countByPlan.get(p.id) ?? 0) > active ? (
                          <span className="ms-1 text-xs text-muted-foreground">
                            /{(countByPlan.get(p.id) ?? 0).toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t(p.is_active ? "plans_status_on" : "plans_status_off")}
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
    </>
  );
}
