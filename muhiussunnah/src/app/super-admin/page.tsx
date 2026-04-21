import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Building2, CreditCard, Users, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDualDate } from "@/lib/utils/date";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("superAdmin");
  return { title: t("dash_meta_title") };
}

export default async function SuperAdminDashboardPage() {
  const t = await getTranslations("superAdmin");
  const locale = (await getLocale()) as Locale;
  const dateLocale = locale === "ur" ? "en" : locale;
  const today = formatDualDate(new Date(), { withWeekday: true, locale: dateLocale });

  return (
    <>
      <PageHeader
        title={t("dash_title")}
        subtitle={t("dash_subtitle", { date: today })}
        impact={[
          { label: t("dash_badge"), tone: "accent" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={t("dash_metric_total_schools")} value={0} icon={<Building2 className="size-4" />} target={t("dash_metric_target")} />
        <MetricCard label={t("dash_metric_active_subs")} value={0} icon={<CreditCard className="size-4" />} />
        <MetricCard label={t("dash_metric_users")}  value={0} icon={<Users className="size-4" />} />
        <MetricCard label={t("dash_metric_monthly_revenue")}       value={0} icon={<TrendingUp className="size-4" />} valuePrefix="৳ " />
      </div>

      <div className="mt-8">
        <EmptyState
          icon={<Building2 className="size-8" />}
          title={t("dash_empty_title")}
          body={t("dash_empty_body")}
          primaryAction={<a href="/register-school" className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white">{t("dash_empty_primary")}</a>}
          secondaryAction={<a href="/super-admin/schools" className="rounded-md border border-border px-4 py-2 text-sm">{t("dash_empty_secondary")}</a>}
          proTip={t("dash_empty_tip")}
        />
      </div>
    </>
  );
}
