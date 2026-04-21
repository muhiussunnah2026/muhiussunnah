import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Building2, CreditCard, LayoutDashboard, MessageSquare, Settings2, ShieldCheck, BarChart3 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSuperAdmin();
  const t = await getTranslations("superAdmin");
  const superAdmin = session.memberships.find((m) => m.role === "SUPER_ADMIN");
  const displayName =
    superAdmin?.full_name_bn ?? superAdmin?.full_name_en ?? session.email ?? "Super Admin";

  const nav = [
    { href: "/super-admin",               label: t("nav_dashboard"),    icon: <LayoutDashboard className="size-4" /> },
    { href: "/super-admin/schools",       label: t("nav_schools"),      icon: <Building2 className="size-4" /> },
    { href: "/super-admin/subscriptions", label: t("nav_subscriptions"), icon: <CreditCard className="size-4" /> },
    { href: "/super-admin/plans",         label: t("nav_plans"),        icon: <ShieldCheck className="size-4" /> },
    { href: "/super-admin/sms-credits",   label: t("nav_sms"),          icon: <MessageSquare className="size-4" /> },
    { href: "/super-admin/analytics",     label: t("nav_analytics"),    icon: <BarChart3 className="size-4" /> },
    { href: "/super-admin/settings",      label: t("nav_settings"),     icon: <Settings2 className="size-4" /> },
  ];

  return (
    <DashboardShell
      title="Super Admin"
      subtitle={t("layout_subtitle")}
      nav={nav}
      userLabel={displayName}
    >
      {children}
    </DashboardShell>
  );
}
