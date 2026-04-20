import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { formatDualDate } from "@/lib/utils/date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const search = await searchParams;
  const date = search.date ?? new Date().toISOString().slice(0, 10);
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Independent — both keyed off school_id.
  const [totalStudentsRes, todayAttendanceRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id", { count: "exact" })
      .eq("school_id", membership.school_id)
      .eq("status", "active"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("attendance")
      .select("status, section_id, sections ( name, classes ( name_bn ) )")
      .eq("school_id", membership.school_id)
      .eq("date", date),
  ]);
  const { data: totalStudents } = totalStudentsRes;
  const { data: todayAttendance } = todayAttendanceRes;

  const attendance = (todayAttendance ?? []) as Array<{
    status: string; section_id: string | null;
    sections: { name: string; classes: { name_bn: string } } | null;
  }>;

  const total = totalStudents?.length ?? 0;
  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;
  const marked = attendance.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by section
  type SectionStat = { label: string; present: number; absent: number; total: number };
  const sectionMap = new Map<string, SectionStat>();
  for (const a of attendance) {
    if (!a.sections) continue;
    const key = `${a.sections.classes.name_bn}-${a.sections.name}`;
    const label = `${a.sections.classes.name_bn} — ${a.sections.name}`;
    const cur = sectionMap.get(key) ?? { label, present: 0, absent: 0, total: 0 };
    cur.total++;
    if (a.status === "present" || a.status === "late") cur.present++;
    if (a.status === "absent") cur.absent++;
    sectionMap.set(key, cur);
  }
  const sectionStats = Array.from(sectionMap.values()).sort((a, b) => b.total - a.total);

  return (
    <>
      <PageHeader
        title="আজকের উপস্থিতি"
        subtitle={`${formatDualDate(date, { withWeekday: true })} · পুর ো স্কুলের চিত্র এক নজরে`}
        impact={[
          { label: <>গড় উপস্থিতি · <BanglaDigit value={pct} />%</>, tone: pct >= 90 ? "success" : pct >= 70 ? "warning" : "accent" },
          { label: <>উপস্থিত · <BanglaDigit value={present} /></>, tone: "success" },
          { label: <>অনুপস্থিত · <BanglaDigit value={absent} /></>, tone: "warning" },
          { label: <>দেরি · <BanglaDigit value={late} /></>, tone: "default" },
        ]}
      />

      {marked === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="size-8" />}
          title="আজ এখনও কোন attendance নেওয়া হয়নি"
          body="শিক্ষকরা তাদের ক্লাসে attendance নিতে শুরু করলে এখানে real-time আপডেট আসবে।"
          proTip="শিক্ষকদের teacher dashboard থেকে attendance নিতে বলুন। অফলাইনেও কাজ করবে, পরে sync হবে।"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                সেকশন অনুযায়ী (<BanglaDigit value={sectionStats.length} /> সেকশন)
              </h3>
              <ul className="divide-y divide-border/60">
                {sectionStats.map((s) => {
                  const spct = Math.round((s.present / s.total) * 100);
                  return (
                    <li key={s.label} className="flex items-center justify-between gap-4 py-2">
                      <span className="text-sm">{s.label}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-success"><BanglaDigit value={s.present} />/<BanglaDigit value={s.total} /></span>
                        <span className={`rounded-full px-2 py-0.5 font-medium ${spct >= 90 ? "bg-success/10 text-success" : spct >= 70 ? "bg-warning/10 text-warning-foreground dark:text-warning" : "bg-destructive/10 text-destructive"}`}>
                          <BanglaDigit value={spct} />%
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">সারাংশ</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <dt className="text-muted-foreground">মোট সক্রিয় ছাত্র</dt>
                <dd className="text-right"><BanglaDigit value={total} /></dd>
                <dt className="text-muted-foreground">Marked</dt>
                <dd className="text-right"><BanglaDigit value={marked} /></dd>
                <dt className="text-muted-foreground">Marking pending</dt>
                <dd className="text-right text-warning"><BanglaDigit value={total - marked} /></dd>
              </dl>
              <p className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
                💡 Real-time ড্যাশবোর্ড — শিক্ষক attendance নিতেই এই সংখ্যা আপডেট হয়ে যাবে।
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
