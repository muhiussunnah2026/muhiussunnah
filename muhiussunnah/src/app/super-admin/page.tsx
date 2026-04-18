import type { Metadata } from "next";
import { Building2, CreditCard, Users, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDualDate } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Super Admin · ড্যাশবোর্ড" };

export default async function SuperAdminDashboardPage() {
  const today = formatDualDate(new Date(), { withWeekday: true });

  return (
    <>
      <PageHeader
        title="প্ল্যাটফর্ম ড্যাশবোর্ড"
        subtitle={`আজ ${today} · সব টেনান্টের সংক্ষিপ্ত চিত্র এক নজরে`}
        impact={[
          { label: "🚀 Phase 0 · Scaffolding in place", tone: "accent" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="মোট স্কুল"      value={0} icon={<Building2 className="size-4" />} target="প্রথম টেনান্ট স্বাগত!" />
        <MetricCard label="সক্রিয় সাবস্ক্রিপশন" value={0} icon={<CreditCard className="size-4" />} />
        <MetricCard label="মোট ব্যবহারকারী"  value={0} icon={<Users className="size-4" />} />
        <MetricCard label="মাসিক আয়"       value={0} icon={<TrendingUp className="size-4" />} valuePrefix="৳ " />
      </div>

      <div className="mt-8">
        <EmptyState
          icon={<Building2 className="size-8" />}
          title="কোন স্কুল এখনও রেজিস্টার হয়নি"
          body="আপনার প্রথম স্কুল রেজিস্টার করুন অথবা টেস্ট ডেটা দিয়ে শুরু করুন।"
          primaryAction={<a href="/register-school" className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white">স্কুল রেজিস্টার করুন</a>}
          secondaryAction={<a href="/super-admin/schools" className="rounded-md border border-border px-4 py-2 text-sm">স্কুল তালিকা দেখুন</a>}
          proTip="ফ্রি ট্রায়াল প্ল্যানে ৩০ দিনের জন্য ৫০ জন ছাত্র সাপোর্ট করে। পরবর্তীতে স্বয়ংক্রিয়ভাবে Basic প্ল্যানে upgrade প্রস্তাব যাবে।"
        />
      </div>
    </>
  );
}
