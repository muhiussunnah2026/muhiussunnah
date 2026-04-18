import type { ReactNode } from "react";
import { BookOpenText, CalendarCheck, ClipboardCheck, CreditCard, Home, LifeBuoy, Mail, Megaphone, ScrollText, UserCircle2, Video } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";
import { PORTAL_ROLES } from "@/lib/auth/roles";

type Props = {
  children: ReactNode;
  params: Promise<{ schoolSlug: string }>;
};

export default async function PortalLayout({ children, params }: Props) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, PORTAL_ROLES);

  const nav = [
    { href: `/school/${schoolSlug}/portal`,              label: "হোম",            icon: <Home className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/attendance`,   label: "উপস্থিতি",       icon: <CalendarCheck className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/results`,      label: "ফলাফল",          icon: <ScrollText className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/assignments`,  label: "অ্যাসাইনমেন্ট",  icon: <ClipboardCheck className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/online-classes`, label: "অনলাইন ক্লাস", icon: <Video className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/fees`,         label: "ফি পেমেন্ট",     icon: <CreditCard className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/notices`,      label: "নোটিশ",          icon: <Megaphone className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/messages`,     label: "বার্তা",          icon: <Mail className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/support`,      label: "সাপোর্ট",         icon: <LifeBuoy className="size-4" /> },
    { href: `/school/${schoolSlug}/portal/profile`,      label: "প্রোফাইল",       icon: <UserCircle2 className="size-4" /> },
  ];

  if (membership.school_type === "madrasa" || membership.school_type === "both") {
    nav.splice(3, 0, {
      href: `/school/${schoolSlug}/portal/hifz`,
      label: "হিফজ",
      icon: <BookOpenText className="size-4" />,
    });
  }

  return (
    <DashboardShell
      title={membership.school_name_bn}
      subtitle={membership.role === "PARENT" ? "অভিভাবক পোর্টাল" : "ছাত্র পোর্টাল"}
      nav={nav}
      userLabel={membership.full_name_bn ?? membership.full_name_en ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
