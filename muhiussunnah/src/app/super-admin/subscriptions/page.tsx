import { getTranslations } from "next-intl/server";
import { CreditCard } from "lucide-react";
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
import { ManageSchoolDialog, type PlanOption } from "./manage-dialog";
import { DeleteSchoolButton } from "./delete-school-button";

type SchoolRow = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string | null;
  email: string | null;
  subscription_status: string;
  subscription_plan_id: string | null;
  trial_ends_at: string | null;
  subscription_expires_at: string | null;
  is_platform_owned: boolean;
  created_at: string;
  plan: { code: string; name_bn: string; name_en: string; price_bdt: number } | null;
};

type AdminRow = {
  school_id: string;
  user_id: string;
  full_name_bn: string | null;
  role: string;
};

/** Map status → colored badge tone for the impact row and table cells. */
function statusTone(status: string): "success" | "accent" | "warning" | "destructive" | "default" {
  if (status === "active") return "success";
  if (status === "trial") return "accent";
  if (status === "past_due") return "warning";
  if (status === "canceled" || status === "suspended") return "destructive";
  return "default";
}

export default async function SubscriptionsPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  // 1. All schools + the plan they're on
  const { data: schoolsData } = await admin
    .from("schools")
    .select(
      `id, slug, name_bn, name_en, email,
       subscription_status, subscription_plan_id,
       trial_ends_at, subscription_expires_at, is_platform_owned, created_at,
       plan:subscription_plans ( code, name_bn, name_en, price_bdt )`,
    )
    .order("created_at", { ascending: false });

  const schools: SchoolRow[] = (schoolsData ?? []) as SchoolRow[];

  // 1b. Plans (for the manage dialog select)
  const { data: plansData } = await admin
    .from("subscription_plans")
    .select("id, name_bn, name_en, price_bdt, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  const plans: PlanOption[] = (plansData ?? []) as PlanOption[];

  // 2. Admin contact per school. Prefer a SCHOOL_ADMIN; fall back to
  //    SUPER_ADMIN so the platform owner's own schools show a name
  //    instead of "—".
  const { data: adminsData } = await admin
    .from("school_users")
    .select("school_id, user_id, full_name_bn, role")
    .in("role", ["SCHOOL_ADMIN", "SUPER_ADMIN"])
    .eq("status", "active");

  const adminRows: AdminRow[] = (adminsData ?? []) as AdminRow[];
  // Prefer SCHOOL_ADMIN over SUPER_ADMIN when both exist.
  adminRows.sort((a, b) => (a.role === "SCHOOL_ADMIN" ? -1 : b.role === "SCHOOL_ADMIN" ? 1 : 0));
  const adminBySchool = new Map<string, AdminRow>();
  for (const r of adminRows) {
    if (!adminBySchool.has(r.school_id)) adminBySchool.set(r.school_id, r);
  }

  // 3. Auth user emails (one paginated fetch; covers low tenant count for now).
  const emailByUserId = new Map<string, string>();
  try {
    const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of (usersData?.users ?? []) as Array<{ id: string; email: string | null }>) {
      if (u.email) emailByUserId.set(u.id, u.email);
    }
  } catch {
    // Non-fatal — fall back to schools.email
  }

  // Aggregates
  const total = schools.length;
  const activeCount = schools.filter((s) => s.subscription_status === "active").length;
  const trialCount = schools.filter((s) => s.subscription_status === "trial").length;
  // Revenue skips platform-owned tenants — those are yours, not paying.
  const monthlyRevenue = schools
    .filter((s) => s.subscription_status === "active" && s.plan && !s.is_platform_owned)
    .reduce((sum, s) => sum + Number(s.plan?.price_bdt ?? 0), 0);

  return (
    <>
      <PageHeader
        title={t("subs_page_title")}
        subtitle={t("subs_page_subtitle")}
        impact={[
          {
            label: (
              <>
                {t("subs_impact_total")} · <BanglaDigit value={total} />
              </>
            ),
            tone: "accent",
          },
          {
            label: (
              <>
                {t("subs_impact_active")} · <BanglaDigit value={activeCount} />
              </>
            ),
            tone: "success",
          },
          {
            label: (
              <>
                {t("subs_impact_revenue")} · ৳{" "}
                <BanglaDigit value={monthlyRevenue.toLocaleString("en-IN")} />
              </>
            ),
            tone: "accent",
          },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={t("subs_metric_total")} value={total} />
        <MetricCard label={t("subs_metric_active")} value={activeCount} tone="success" />
        <MetricCard label={t("subs_metric_trial")} value={trialCount} tone="accent" />
        <MetricCard
          label={t("subs_metric_revenue")}
          value={monthlyRevenue.toFixed(0)}
          valuePrefix="৳ "
          tone="accent"
        />
      </div>

      {schools.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-8" />}
          title={t("subs_empty_title")}
          body={t("subs_empty_body")}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("subs_col_school")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("subs_col_admin")}</TableHead>
                  <TableHead>{t("subs_col_plan")}</TableHead>
                  <TableHead>{t("subs_col_status")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("subs_col_ends")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("subs_col_created")}</TableHead>
                  <TableHead className="text-right">{t("subs_col_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => {
                  const adminRow = adminBySchool.get(s.id);
                  const adminEmail =
                    (adminRow ? emailByUserId.get(adminRow.user_id) : undefined) ??
                    s.email ??
                    "—";
                  const endsAt =
                    s.subscription_status === "trial"
                      ? s.trial_ends_at
                      : s.subscription_expires_at;
                  const tone = statusTone(s.subscription_status);
                  const toneClasses: Record<typeof tone, string> = {
                    success:
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    accent: "bg-primary/10 text-primary",
                    warning:
                      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    destructive:
                      "bg-destructive/10 text-destructive",
                    default: "bg-muted text-muted-foreground",
                  };
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.name_bn}</div>
                        <div className="font-mono text-xs text-muted-foreground">/{s.slug}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{adminRow?.full_name_bn ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{adminEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {s.plan?.name_bn ?? t("subs_plan_none")}
                        </div>
                        {s.plan?.price_bdt ? (
                          <div className="text-xs text-muted-foreground">
                            ৳ <BanglaDigit value={Number(s.plan.price_bdt).toLocaleString("en-IN")} />
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
                        >
                          {t(`subs_status_${s.subscription_status}` as Parameters<typeof t>[0])}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {endsAt ? new Date(endsAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ManageSchoolDialog
                            schoolId={s.id}
                            schoolName={s.name_bn}
                            adminUserId={adminRow?.user_id ?? null}
                            adminEmail={adminEmail === "—" ? "" : adminEmail}
                            currentPlanId={s.subscription_plan_id}
                            currentStatus={s.subscription_status}
                            currentTrialEndsAt={s.trial_ends_at}
                            currentExpiresAt={s.subscription_expires_at}
                            currentIsPlatformOwned={s.is_platform_owned ?? false}
                            plans={plans}
                          />
                          <DeleteSchoolButton
                            schoolId={s.id}
                            schoolName={s.name_bn}
                            schoolSlug={s.slug}
                          />
                        </div>
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
