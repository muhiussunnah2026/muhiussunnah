import { CalendarDays, Users2, Wallet, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeDashboardIndicator } from "@/components/dashboard/realtime-dashboard-indicator";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { formatDualDate } from "@/lib/utils/date";

export default async function SchoolAdminDashboardPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const schoolSlug = membership.school_slug;
  const showHijri = membership.school_type === "madrasa" || membership.school_type === "both";
  const today = formatDualDate(new Date(), { withWeekday: true, withHijri: showHijri });

  return (
    <>
      <PageHeader
        title={`স্বাগতম, ${membership.full_name_bn ?? "প্রিন্সিপাল"} সাহেব`}
        subtitle={`আজ ${today} · আপনার স্কুলের সম্পূর্ণ চিত্র এক নজরে`}
        impact={[
          { label: <RealtimeDashboardIndicator schoolId={membership.school_id} />, tone: "success" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="মোট ছাত্র-ছাত্রী" value={0} icon={<Users2 className="size-4" />} target="প্রথম শিক্ষার্থী ভর্তি করুন" />
        <MetricCard label="আজকের উপস্থিতি"   value={0} valueSuffix={<span className="text-muted-foreground text-base">%</span>} icon={<CalendarDays className="size-4" />} />
        <MetricCard label="এ মাসের আয়"       value={0} valuePrefix="৳ " icon={<Wallet className="size-4" />} />
        <MetricCard label="বাকি ফি"            value={0} valuePrefix="৳ " icon={<TrendingUp className="size-4" />} tone="warning" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <EmptyState
          icon={<Users2 className="size-8" />}
          title="🎓 প্রথম শিক্ষার্থী ভর্তি করুন"
          body="একজন ছাত্র যোগ করতে মাত্র ৩০ সেকেন্ড লাগবে। বাল্ক import করলে ১০০+ ছাত্র একসাথে ১ মিনিটে!"
          primaryAction={
            <a href={`/admin/students/new`} className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white">
              নতুন ভর্তি
            </a>
          }
          secondaryAction={
            <a href={`/admin/students/bulk-import`} className="rounded-md border border-border px-4 py-2 text-sm">
              Excel থেকে import
            </a>
          }
          proTip="Excel template ডাউনলোড করে পূরণ করে upload করলে পুরো ক্লাসের ডেটা মুহূর্তে ঢুকে যাবে।"
        />
        <EmptyState
          icon={<CalendarDays className="size-8" />}
          title="🏫 ক্লাস + সেকশন + সাবজেক্ট সেট করুন"
          body="আপনার স্কুলের একাডেমিক কাঠামো সেট করুন যাতে শিক্ষার্থী, পরীক্ষা, ফি সব সংযুক্ত হতে পারে।"
          primaryAction={
            <a href={`/admin/classes`} className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white">
              ক্লাস যোগ করুন
            </a>
          }
          secondaryAction={
            <a href={`/admin/settings`} className="rounded-md border border-border px-4 py-2 text-sm">
              সেটিংস
            </a>
          }
        />
      </div>
    </>
  );
}
