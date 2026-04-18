import type { ReactNode } from "react";
import { Building2, CreditCard, LayoutDashboard, MessageSquare, Settings2, ShieldCheck, BarChart3 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSuperAdmin();
  const superAdmin = session.memberships.find((m) => m.role === "SUPER_ADMIN");
  const displayName =
    superAdmin?.full_name_bn ?? superAdmin?.full_name_en ?? session.email ?? "Super Admin";

  const nav = [
    { href: "/super-admin",               label: "ড্যাশবোর্ড",       icon: <LayoutDashboard className="size-4" /> },
    { href: "/super-admin/schools",       label: "স্কুলসমূহ",        icon: <Building2 className="size-4" /> },
    { href: "/super-admin/subscriptions", label: "সাবস্ক্রিপশন",     icon: <CreditCard className="size-4" /> },
    { href: "/super-admin/plans",         label: "প্ল্যান",           icon: <ShieldCheck className="size-4" /> },
    { href: "/super-admin/sms-credits",   label: "SMS ক্রেডিট",       icon: <MessageSquare className="size-4" /> },
    { href: "/super-admin/analytics",     label: "অ্যানালিটিক্স",    icon: <BarChart3 className="size-4" /> },
    { href: "/super-admin/settings",      label: "সেটিংস",           icon: <Settings2 className="size-4" /> },
  ];

  return (
    <DashboardShell
      title="Super Admin"
      subtitle="প্ল্যাটফর্ম নিয়ন্ত্রণ কেন্দ্র"
      nav={nav}
      userLabel={displayName}
    >
      {children}
    </DashboardShell>
  );
}
