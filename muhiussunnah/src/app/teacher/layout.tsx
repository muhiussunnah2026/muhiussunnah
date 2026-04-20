import type { ReactNode } from "react";
import { BookOpenText, CalendarCheck, ClipboardList, LayoutDashboard, Mail, ScrollText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireActiveRole } from "@/lib/auth/active-school";
import { TEACHER_ROLES } from "@/lib/auth/roles";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const membership = await requireActiveRole(TEACHER_ROLES);

  const nav = [
    { href: "/teacher",              label: "ড্যাশবোর্ড",     icon: <LayoutDashboard className="size-4" /> },
    { href: "/teacher/attendance",   label: "উপস্থিতি",       icon: <CalendarCheck className="size-4" /> },
    { href: "/teacher/marks",        label: "মার্ক্স এন্ট্রি", icon: <ScrollText className="size-4" /> },
    { href: "/teacher/assignments",  label: "অ্যাসাইনমেন্ট",   icon: <ClipboardList className="size-4" /> },
    { href: "/teacher/messages",     label: "বার্তা",          icon: <Mail className="size-4" /> },
  ];

  if (membership.role === "MADRASA_USTADH" || membership.school_type !== "school") {
    nav.splice(3, 0, {
      href: "/teacher/daily-sabaq",
      label: "দৈনিক সবক",
      icon: <BookOpenText className="size-4" />,
    });
  }

  return (
    <DashboardShell
      title={membership.school_name_bn}
      subtitle="শিক্ষক ড্যাশবোর্ড"
      nav={nav}
      userLabel={membership.full_name_bn ?? membership.full_name_en ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
