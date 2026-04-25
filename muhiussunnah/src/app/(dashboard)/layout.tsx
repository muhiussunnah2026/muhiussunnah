import type { ReactNode } from "react";
import {
  Award,
  Banknote,
  BookOpen,
  BookOpenText,
  Building2,
  Bus,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FileText,
  HeartHandshake,
  History,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  Settings2,
  Sparkles,
  TrendingUp,
  Users2,
  Video,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OnlineStatus } from "@/components/pwa/online-status";
import { requireActiveRole } from "@/lib/auth/active-school";
import { type ActiveSchoolMembership } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { getSchoolBranding } from "@/lib/schools/branding";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Resolve the active school from the active_school_id cookie and verify
  // the current user has an admin-level role in it. No URL slug means the
  // user can't type their way into another school's dashboard — only
  // schools they have a valid membership in are accessible.
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const schoolRow = await getSchoolBranding(membership.school_id);

  const tNav = await getTranslations("nav");
  const nav = adminNav(membership, tNav);

  const logoUrl = (schoolRow?.logo_url as string | null) ?? null;
  const rawHeaderFields = (schoolRow?.header_display_fields as string | null) ?? "name_bn";

  const fieldValueMap: Record<string, string | null | undefined> = {
    name_bn: membership.school_name_bn,
    name_en: membership.school_name_en,
    name_ar: schoolRow?.name_ar ?? null,
    address: schoolRow?.address ?? null,
    phone: schoolRow?.phone ?? null,
    email: schoolRow?.email ?? null,
    website: schoolRow?.website ?? null,
  };

  const allowed = new Set(["name_bn", "name_en", "name_ar", "address", "phone", "email", "website"]);
  const parts = rawHeaderFields
    .split(",")
    .map((s) => s.trim())
    .filter((s) => allowed.has(s));
  const keys = parts.length > 0 ? parts : ["name_bn"];

  const headerFields = keys.map((k, idx) => ({
    key: k,
    value: fieldValueMap[k],
    emphasis: idx === 0 ? ("primary" as const) : ("secondary" as const),
  }));

  return (
    <DashboardShell
      headerFields={headerFields}
      title={membership.school_name_bn}
      logoUrl={logoUrl}
      nav={nav}
      userLabel={membership.full_name_bn ?? membership.full_name_en ?? undefined}
      userPhotoUrl={membership.photo_url}
    >
      {children}
      <OnlineStatus />
    </DashboardShell>
  );
}

function adminNav(
  membership: ActiveSchoolMembership,
  t: (key: string) => string,
) {
  // Top-level items always visible (never grouped) — the most-used routes
  // every principal touches daily.
  const top = [
    { href: "/admin",              label: t("dashboard"),          icon: <LayoutDashboard className="size-4" /> },
    { href: "/students",           label: t("students"),           icon: <Users2 className="size-4" /> },
    { href: "/classes",            label: t("classes"),            icon: <Building2 className="size-4" /> },
    { href: "/staff",              label: t("staff"),              icon: <Users2 className="size-4" /> },
    { href: "/admission-inquiry",  label: t("admission_inquiry"),  icon: <ClipboardList className="size-4" /> },
    { href: "/attendance",         label: t("attendance"),         icon: <FileCheck2 className="size-4" /> },
  ];

  const groups = [
    {
      id: "academic",
      label: t("group_academic"),
      icon: <CalendarDays className="size-4" />,
      items: [
        { href: "/academic-years", label: t("academic_years"), icon: <CalendarDays className="size-4" /> },
        { href: "/exams",          label: t("exams"),          icon: <ScrollText className="size-4" /> },
        { href: "/assignments",    label: t("assignments"),    icon: <ClipboardCheck className="size-4" /> },
        { href: "/online-classes", label: t("online_classes"), icon: <Video className="size-4" />, paid: true },
        { href: "/certificates",   label: t("certificates"),   icon: <FileText className="size-4" /> },
      ],
    },
    {
      id: "finance",
      label: t("group_finance"),
      icon: <Wallet className="size-4" />,
      items: [
        { href: "/fees",          label: t("fees"),          icon: <Wallet className="size-4" /> },
        { href: "/fees/payments", label: t("payments"),      icon: <Receipt className="size-4" /> },
        { href: "/expenses",      label: t("expenses"),      icon: <CreditCard className="size-4" /> },
        { href: "/donations",     label: t("donations"),     icon: <HeartHandshake className="size-4" /> },
        { href: "/investments",   label: t("investments"),   icon: <TrendingUp className="size-4" /> },
        { href: "/payroll",       label: t("payroll"),       icon: <Banknote className="size-4" /> },
        { href: "/scholarships",  label: t("scholarships"),  icon: <Award className="size-4" /> },
      ],
    },
    {
      id: "messaging",
      label: t("group_messaging"),
      icon: <Megaphone className="size-4" />,
      items: [
        { href: "/notices",            label: t("notices"),            icon: <Megaphone className="size-4" /> },
        { href: "/messaging",          label: t("messaging"),          icon: <MessageSquare className="size-4" />, paid: true },
        { href: "/tickets",            label: t("tickets"),            icon: <LifeBuoy className="size-4" /> },
      ],
    },
    {
      id: "operations",
      label: t("group_operations"),
      icon: <Package className="size-4" />,
      items: [
        { href: "/library",   label: t("library"),   icon: <BookOpen className="size-4" /> },
        { href: "/transport", label: t("transport"), icon: <Bus className="size-4" /> },
        { href: "/hostel",    label: t("hostel"),    icon: <Home className="size-4" /> },
        { href: "/inventory", label: t("inventory"), icon: <Package className="size-4" /> },
      ],
    },
  ];

  // Madrasa-specific group only for madrasa or "both" schools.
  if (membership.school_type === "madrasa" || membership.school_type === "both") {
    groups.push({
      id: "madrasa",
      label: t("group_madrasa"),
      icon: <BookOpenText className="size-4" />,
      items: [
        { href: "/madrasa/hifz",        label: t("hifz"),        icon: <BookOpenText className="size-4" /> },
        { href: "/madrasa/kitab",       label: t("kitab"),       icon: <BookOpenText className="size-4" /> },
        { href: "/madrasa/daily-sabaq", label: t("daily_sabaq"), icon: <BookOpenText className="size-4" /> },
      ],
    });
  }

  groups.push({
    id: "insights",
    label: t("group_insights"),
    icon: <Sparkles className="size-4" />,
    items: [
      { href: "/reports",               label: t("reports"),     icon: <ScrollText className="size-4" /> },
      { href: "/insights/dropout-risk", label: t("ai_risk"),     icon: <Sparkles className="size-4" />, paid: true },
      { href: "/audit-logs",            label: t("audit_logs"),  icon: <History className="size-4" /> },
    ],
  });

  // /settings sits at the bottom outside any group so it's always
  // one click away regardless of which sections the user has
  // collapsed.
  const bottom = [
    { href: "/settings", label: t("settings"), icon: <Settings2 className="size-4" /> },
  ];

  return { top, groups, bottom };
}
