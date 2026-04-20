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
import { requireRole, type ActiveSchoolMembership } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { supabaseServer } from "@/lib/supabase/server";

type Props = {
  children: ReactNode;
  params: Promise<{ schoolSlug: string }>;
};

export default async function SchoolAdminLayout({ children, params }: Props) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const nav = adminNav(schoolSlug, membership);

  // Pull branding (logo + display_name_locale) for the shell. `select("*")`
  // tolerates projects where migration 0018 hasn't run yet — optional columns
  // just come back as undefined.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: schoolRow } = await (supabase as any)
    .from("schools")
    .select("*")
    .eq("id", membership.school_id)
    .maybeSingle();

  const logoUrl = (schoolRow?.logo_url as string | null) ?? null;
  const rawHeaderFields = (schoolRow?.header_display_fields as string | null) ?? "name_bn";

  const fieldValueMap: Record<string, string | null | undefined> = {
    name_bn: membership.school_name_bn,
    name_en: membership.school_name_en,
    address: schoolRow?.address ?? null,
    phone: schoolRow?.phone ?? null,
    email: schoolRow?.email ?? null,
    website: schoolRow?.website ?? null,
  };

  const allowed = new Set(["name_bn", "name_en", "address", "phone", "email", "website"]);
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

function adminNav(slug: string, membership: ActiveSchoolMembership) {
  const items = [
    { href: `/school/${slug}/admin`,                label: "ড্যাশবোর্ড",    icon: <LayoutDashboard className="size-4" /> },
    { href: `/school/${slug}/admin/admission-inquiry`, label: "ভর্তি জিজ্ঞাসা",  icon: <ClipboardList className="size-4" /> },
    { href: `/school/${slug}/admin/students`,       label: "ছাত্র-ছাত্রী",     icon: <Users2 className="size-4" /> },
    { href: `/school/${slug}/admin/staff`,          label: "শিক্ষক/স্টাফ",     icon: <Users2 className="size-4" /> },
    { href: `/school/${slug}/admin/classes`,        label: "শ্রেণি",           icon: <Building2 className="size-4" /> },
    { href: `/school/${slug}/admin/attendance`,     label: "উপস্থিতি",         icon: <FileCheck2 className="size-4" /> },
    { href: `/school/${slug}/admin/academic-years`, label: "শিক্ষাবর্ষ",       icon: <CalendarDays className="size-4" /> },
    { href: `/school/${slug}/admin/exams`,          label: "পরীক্ষা",          icon: <ScrollText className="size-4" /> },
    { href: `/school/${slug}/admin/assignments`,    label: "অ্যাসাইনমেন্ট",    icon: <ClipboardCheck className="size-4" /> },
    { href: `/school/${slug}/admin/online-classes`, label: "অনলাইন ক্লাস",     icon: <Video className="size-4" /> },
    { href: `/school/${slug}/admin/certificates`,   label: "সার্টিফিকেট",      icon: <FileText className="size-4" /> },
    { href: `/school/${slug}/admin/fees`,           label: "ফি",                icon: <Wallet className="size-4" /> },
    { href: `/school/${slug}/admin/fees/payments`,  label: "পেমেন্ট",           icon: <Receipt className="size-4" /> },
    { href: `/school/${slug}/admin/expenses`,       label: "খরচ",              icon: <CreditCard className="size-4" /> },
    { href: `/school/${slug}/admin/donations`,      label: "চাঁদা",             icon: <HeartHandshake className="size-4" /> },
    { href: `/school/${slug}/admin/investments`,    label: "বিনিয়োগ",          icon: <TrendingUp className="size-4" /> },
    { href: `/school/${slug}/admin/payroll`,        label: "বেতন",             icon: <Banknote className="size-4" /> },
    { href: `/school/${slug}/admin/scholarships`,   label: "বৃত্তি",            icon: <Award className="size-4" /> },
    { href: `/school/${slug}/admin/notices`,        label: "নোটিশ",            icon: <Megaphone className="size-4" /> },
    { href: `/school/${slug}/admin/messaging`,      label: "মেসেজিং রিপোর্ট", icon: <MessageSquare className="size-4" /> },
    { href: `/school/${slug}/admin/library`,        label: "লাইব্রেরি",         icon: <BookOpen className="size-4" /> },
    { href: `/school/${slug}/admin/transport`,      label: "পরিবহন",           icon: <Bus className="size-4" /> },
    { href: `/school/${slug}/admin/hostel`,         label: "হোস্টেল",           icon: <Home className="size-4" /> },
    { href: `/school/${slug}/admin/inventory`,      label: "ইনভেন্টরি",        icon: <Package className="size-4" /> },
    { href: `/school/${slug}/admin/support`,        label: "সাপোর্ট",          icon: <LifeBuoy className="size-4" /> },
    { href: `/school/${slug}/admin/reports`,        label: "রিপোর্ট",          icon: <ScrollText className="size-4" /> },
    { href: `/school/${slug}/admin/insights/dropout-risk`, label: "AI ঝুঁকি",  icon: <Sparkles className="size-4" /> },
    { href: `/school/${slug}/admin/audit-logs`,     label: "অডিট লগ",           icon: <History className="size-4" /> },
  ];

  if (membership.school_type === "madrasa" || membership.school_type === "both") {
    items.push(
      { href: `/school/${slug}/admin/madrasa/hifz`,        label: "হিফজ",         icon: <BookOpenText className="size-4" /> },
      { href: `/school/${slug}/admin/madrasa/kitab`,       label: "কিতাব",        icon: <BookOpenText className="size-4" /> },
      { href: `/school/${slug}/admin/madrasa/daily-sabaq`, label: "দৈনিক সবক",   icon: <BookOpenText className="size-4" /> },
    );
  }

  items.push({ href: `/school/${slug}/admin/settings`, label: "সেটিংস", icon: <Settings2 className="size-4" /> });
  return items;
}
