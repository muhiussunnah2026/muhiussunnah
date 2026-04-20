import { CalendarCheck, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireActiveRole } from "@/lib/auth/active-school";
import { TEACHER_ROLES } from "@/lib/auth/roles";
import { formatDualDate } from "@/lib/utils/date";

export default async function TeacherDashboardPage() {
  const membership = await requireActiveRole(TEACHER_ROLES);
  const schoolSlug = membership.school_slug;
  const today = formatDualDate(new Date(), { withWeekday: true });

  return (
    <>
      <PageHeader
        title={`আসসালামু আলাইকুম, ${membership.full_name_bn ?? "শিক্ষক"} স্যার`}
        subtitle={`আজ ${today} · আপনার ক্লাসের কাজ এক নজরে`}
        impact={[{ label: "⚡ Offline-capable", tone: "success" }]}
      />

      <EmptyState
        icon={<CalendarCheck className="size-8" />}
        title="আজকের ক্লাসের attendance নিন"
        body="ক্লাসে গিয়ে ২-৩ সেকেন্ডে সব ছাত্রের attendance নিতে পারবেন। Swipe ডান = উপস্থিত, swipe বাম = অনুপস্থিত।"
        primaryAction={
          <a href={`/teacher/attendance`} className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white">
            Attendance নিন
          </a>
        }
        secondaryAction={
          <a href={`/teacher/assignments`} className="rounded-md border border-border px-4 py-2 text-sm">
            <ClipboardList className="me-1.5 inline size-4" />
            অ্যাসাইনমেন্ট
          </a>
        }
        proTip="ইন্টারনেট না থাকলেও attendance নিতে পারবেন, পরে online হলে স্বয়ংক্রিয়ভাবে sync হবে।"
      />
    </>
  );
}
