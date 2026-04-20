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

  const nav = adminNav(membership);

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
    >
      {children}
      <OnlineStatus />
    </DashboardShell>
  );
}

function adminNav(membership: ActiveSchoolMembership) {
  const items = [
    { href: "/admin",                label: "ড্যাশবোর্ড",    icon: <LayoutDashboard className="size-4" /> },
    { href: "/admin/admission-inquiry", label: "ভর্তি জিজ্ঞাসা",  icon: <ClipboardList className="size-4" /> },
    { href: "/admin/students",       label: "ছাত্র-ছাত্রী",     icon: <Users2 className="size-4" /> },
    { href: "/admin/staff",          label: "শিক্ষক/স্টাফ",     icon: <Users2 className="size-4" /> },
    { href: "/admin/classes",        label: "শ্রেণি",           icon: <Building2 className="size-4" /> },
    { href: "/admin/attendance",     label: "উপস্থিতি",         icon: <FileCheck2 className="size-4" /> },
    { href: "/admin/academic-years", label: "শিক্ষাবর্ষ",       icon: <CalendarDays className="size-4" /> },
    { href: "/admin/exams",          label: "পরীক্ষা",          icon: <ScrollText className="size-4" /> },
    { href: "/admin/assignments",    label: "অ্যাসাইনমেন্ট",    icon: <ClipboardCheck className="size-4" /> },
    { href: "/admin/online-classes", label: "অনলাইন ক্লাস",     icon: <Video className="size-4" /> },
    { href: "/admin/certificates",   label: "সার্টিফিকেট",      icon: <FileText className="size-4" /> },
    { href: "/admin/fees",           label: "ফি",                icon: <Wallet className="size-4" /> },
    { href: "/admin/fees/payments",  label: "পেমেন্ট",           icon: <Receipt className="size-4" /> },
    { href: "/admin/expenses",       label: "খরচ",              icon: <CreditCard className="size-4" /> },
    { href: "/admin/donations",      label: "চাঁদা",             icon: <HeartHandshake className="size-4" /> },
    { href: "/admin/investments",    label: "বিনিয়োগ",          icon: <TrendingUp className="size-4" /> },
    { href: "/admin/payroll",        label: "বেতন",             icon: <Banknote className="size-4" /> },
    { href: "/admin/scholarships",   label: "বৃত্তি",            icon: <Award className="size-4" /> },
    { href: "/admin/notices",        label: "নোটিশ",            icon: <Megaphone className="size-4" /> },
    { href: "/admin/messaging",      label: "মেসেজিং রিপোর্ট", icon: <MessageSquare className="size-4" /> },
    { href: "/admin/library",        label: "লাইব্রেরি",         icon: <BookOpen className="size-4" /> },
    { href: "/admin/transport",      label: "পরিবহন",           icon: <Bus className="size-4" /> },
    { href: "/admin/hostel",         label: "হোস্টেল",           icon: <Home className="size-4" /> },
    { href: "/admin/inventory",      label: "ইনভেন্টরি",        icon: <Package className="size-4" /> },
    { href: "/admin/support",        label: "সাপোর্ট",          icon: <LifeBuoy className="size-4" /> },
    { href: "/admin/reports",        label: "রিপোর্ট",          icon: <ScrollText className="size-4" /> },
    { href: "/admin/insights/dropout-risk", label: "AI ঝুঁকি",  icon: <Sparkles className="size-4" /> },
    { href: "/admin/audit-logs",     label: "অডিট লগ",           icon: <History className="size-4" /> },
  ];

  if (membership.school_type === "madrasa" || membership.school_type === "both") {
    items.push(
      { href: "/admin/madrasa/hifz",        label: "হিফজ",         icon: <BookOpenText className="size-4" /> },
      { href: "/admin/madrasa/kitab",       label: "কিতাব",        icon: <BookOpenText className="size-4" /> },
      { href: "/admin/madrasa/daily-sabaq", label: "দৈনিক সবক",   icon: <BookOpenText className="size-4" /> },
    );
  }

  items.push({ href: "/admin/settings", label: "সেটিংস", icon: <Settings2 className="size-4" /> });
  return items;
}
