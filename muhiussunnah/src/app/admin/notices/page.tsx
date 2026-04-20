import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

const audienceLabel: Record<string, string> = {
  all: "সবাই", staff: "স্টাফ", teachers: "শিক্ষক", students: "ছাত্র",
  parents: "অভিভাবক", class: "ক্লাস", section: "সেকশন", individual: "নির্দিষ্ট",
};

export default async function NoticesListPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Independent — notices by school_id, school by membership.school_id (known pre-query).
  const [noticesRes, schoolRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("notices")
      .select("id, title, body, audience, channels, scheduled_for, sent_at, created_at")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false })
      .limit(200),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("schools")
      .select("sms_credit_balance_bdt")
      .eq("id", membership.school_id)
      .single(),
  ]);
  const { data: notices } = noticesRes;
  const { data: school } = schoolRes;

  const list = (notices ?? []) as Array<{
    id: string; title: string; body: string; audience: string;
    channels: string[]; scheduled_for: string | null; sent_at: string | null; created_at: string;
  }>;

  const sent = list.filter((n) => n.sent_at).length;
  const scheduled = list.filter((n) => n.scheduled_for && !n.sent_at).length;

  const balance = Number(school?.sms_credit_balance_bdt ?? 0);

  return (
    <>
      <PageHeader
        title="নোটিশ ব্যবস্থাপনা"
        subtitle="এক ক্লিকে SMS + WhatsApp + App + Email — একসাথে ৫০০+ অভিভাবকে ১০ সেকেন্ডে পৌঁছান।"
        impact={[
          { label: <>পাঠান ো · <BanglaDigit value={sent} /></>, tone: "success" },
          { label: <>নির্ধারিত · <BanglaDigit value={scheduled} /></>, tone: "accent" },
          { label: <>SMS ক্রেডিট · ৳ <BanglaDigit value={balance.toLocaleString("en-IN")} /></>, tone: balance > 100 ? "default" : "warning" },
        ]}
        actions={
          <Link
            href={`/admin/notices/new`}
            className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
          >
            <Plus className="me-1 size-3.5" /> নতুন নোটিশ
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-8" />}
          title="📢 প্রথম নোটিশ পাঠান"
          body="এক ফর্মে লিখুন, তারপর SMS + WhatsApp + App-এ একসাথে পাঠান। প্রতিটি চ্যানেলের cost live দেখাবে।"
          primaryAction={
            <Link href={`/admin/notices/new`} className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
              নতুন নোটিশ তৈরি
            </Link>
          }
          proTip="SMS ক্রেডিট শেষ হলে শুধু in-app + push পাঠানো যাবে। Super admin থেকে topup করুন।"
        />
      ) : (
        <div className="grid gap-3">
          {list.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex flex-col gap-2 p-5 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {audienceLabel[n.audience] ?? n.audience}
                    </span>
                    {n.channels.map((c) => (
                      <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {n.sent_at ? (
                      <>✓ পাঠান ো হয়েছে · <BengaliDate value={n.sent_at} /></>
                    ) : n.scheduled_for ? (
                      <>📅 নির্ধারিত · <BengaliDate value={n.scheduled_for} /></>
                    ) : (
                      <>Draft</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
