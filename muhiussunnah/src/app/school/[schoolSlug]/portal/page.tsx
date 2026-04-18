import Link from "next/link";
import { CalendarCheck, CreditCard, Megaphone, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { PORTAL_ROLES } from "@/lib/auth/roles";
import { formatDualDate } from "@/lib/utils/date";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function PortalHomePage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, PORTAL_ROLES);
  const today = formatDualDate(new Date(), { withWeekday: true });

  const supabase = await supabaseServer();

  // Load children for parents, self for students
  let childrenIds: string[] = [];
  if (membership.role === "PARENT") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: guardians } = await (supabase as any)
      .from("student_guardians")
      .select("student_id")
      .eq("user_id", membership.school_user_id);
    childrenIds = ((guardians ?? []) as { student_id: string }[]).map((g) => g.student_id);
  } else if (membership.role === "STUDENT") {
    // students table uses user_id via student_users? For phase 1 we assume student = school_user with role=STUDENT
    // and we look up via guardian_phone or a separate linking table (future).
    // For now, return empty to trigger the "no child linked" empty state.
    childrenIds = [];
  }

  let children: Array<{
    id: string; name_bn: string; student_code: string; roll: number | null; photo_url: string | null;
    sections: { name: string; classes: { name_bn: string } } | null;
  }> = [];
  if (childrenIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("students")
      .select("id, name_bn, student_code, roll, photo_url, sections(name, classes(name_bn))")
      .in("id", childrenIds);
    children = data ?? [];
  }

  const firstChild = children[0];

  // Latest notices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: noticesData } = await (supabase as any)
    .from("notices")
    .select("id, title, body, sent_at, created_at")
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false })
    .limit(5);
  const notices = (noticesData ?? []) as { id: string; title: string; body: string; sent_at: string | null; created_at: string }[];

  // Today's attendance for first child
  let todayAtt: { status: string } | null = null;
  let recentAttendance: { date: string; status: string }[] = [];
  if (firstChild) {
    const d = new Date().toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: att } = await (supabase as any)
      .from("attendance")
      .select("date, status")
      .eq("student_id", firstChild.id)
      .order("date", { ascending: false })
      .limit(30);
    recentAttendance = (att ?? []) as { date: string; status: string }[];
    todayAtt = recentAttendance.find((a) => a.date === d) ?? null;
  }

  // Pending fees
  let dueTotal = 0;
  if (firstChild) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invs } = await (supabase as any)
      .from("fee_invoices")
      .select("due_amount")
      .eq("student_id", firstChild.id)
      .in("status", ["unpaid", "partial", "overdue"]);
    dueTotal = ((invs ?? []) as { due_amount: number }[]).reduce((sum, i) => sum + Number(i.due_amount ?? 0), 0);
  }

  const presentDays = recentAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendancePct = recentAttendance.length > 0 ? Math.round((presentDays / recentAttendance.length) * 100) : 0;

  const greeting = membership.role === "PARENT"
    ? `আসসালামু আলাইকুম, ${membership.full_name_bn ?? "অভিভাবক"}`
    : `স্বাগতম, ${membership.full_name_bn ?? "শিক্ষার্থী"}`;

  if (!firstChild) {
    return (
      <>
        <PageHeader title={greeting} subtitle={`আজ ${today}`} />
        <EmptyState
          icon={<CalendarCheck className="size-8" />}
          title={membership.role === "PARENT" ? "সন্তানের সাথে লিংক করা নেই" : "আপনার প্রোফাইল এখনও যুক্ত হয়নি"}
          body="স্কুল অ্যাডমিনকে জানান যেন আপনাকে সন্তানের সাথে যুক্ত করেন। এরপর আপনি সব তথ্য দেখতে পাবেন।"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={greeting}
        subtitle={`আজ ${today}`}
        impact={
          todayAtt
            ? [{ label: todayAtt.status === "absent" ? "❌ আজ অনুপস্থিত" : "✅ আজ উপস্থিত", tone: todayAtt.status === "absent" ? "warning" : "success" }]
            : [{ label: "⏳ আজকের attendance এখনও নেওয়া হয়নি", tone: "default" }]
        }
      />

      {/* Student card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="size-16">
            {firstChild.photo_url ? <AvatarImage src={firstChild.photo_url} alt={firstChild.name_bn} /> : null}
            <AvatarFallback className="bg-gradient-primary text-white text-xl">{firstChild.name_bn.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{firstChild.name_bn}</h2>
            <p className="text-sm text-muted-foreground">
              {firstChild.sections ? <>{firstChild.sections.classes.name_bn} — {firstChild.sections.name} · </> : null}
              {firstChild.roll ? <>রোল: <BanglaDigit value={firstChild.roll} /> · </> : null}
              ID: <span className="font-mono">{firstChild.student_code}</span>
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="text-xs text-muted-foreground">এ মাসে উপস্থিতি</div>
            <div className="text-xl font-bold"><BanglaDigit value={attendancePct} />%</div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="size-4" />
              উপস্থিতি (৩০ দিন)
            </div>
            <div className="text-3xl font-bold"><BanglaDigit value={attendancePct} />%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-4" />
              বাকি ফি
            </div>
            <div className="text-2xl font-bold">৳ <BanglaDigit value={dueTotal.toLocaleString("en-IN")} /></div>
            {dueTotal > 0 ? (
              <Link href={`/school/${schoolSlug}/portal/fees`} className={buttonVariants({ size: "sm", className: "mt-2 bg-gradient-primary text-white" })}>
                এখনই পেমেন্ট
              </Link>
            ) : (
              <p className="mt-1 text-xs text-success">✓ কোন বকেয়া নেই</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Megaphone className="size-4" />
              নোটিশ
            </div>
            <div className="text-3xl font-bold"><BanglaDigit value={notices.length} /></div>
            <Link href={`/school/${schoolSlug}/portal/notices`} className="mt-2 inline-block text-xs text-primary">
              সব দেখুন →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <ScrollText className="size-4" />
              ফলাফল
            </div>
            <p className="text-sm text-muted-foreground">Phase 2-এ আসছে 🚧</p>
          </CardContent>
        </Card>
      </div>

      {notices.length > 0 ? (
        <Card className="mt-4">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">সাম্প্রতিক নোটিশ</h3>
            <ul className="divide-y divide-border/60">
              {notices.map((n) => (
                <li key={n.id} className="py-2">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground"><BengaliDate value={n.sent_at ?? n.created_at} /></div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
