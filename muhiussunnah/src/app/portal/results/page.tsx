import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { PORTAL_ROLES } from "@/lib/auth/roles";

export default async function PortalResultsPage() {
  const membership = await requireActiveRole(PORTAL_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Load linked children
  let childIds: string[] = [];
  if (membership.role === "PARENT") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: guardians } = await (supabase as any)
      .from("student_guardians")
      .select("student_id")
      .eq("user_id", membership.school_user_id);
    childIds = ((guardians ?? []) as { student_id: string }[]).map((g) => g.student_id);
  }

  if (childIds.length === 0) {
    return (
      <>
        <PageHeader title="পরীক্ষার ফলাফল" subtitle="আপনার সন্তানের সব পরীক্ষার ফলাফল এখানে দেখাবে।" />
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title="সন্তানের সাথে লিংক করা নেই"
          body="স্কুল অ্যাডমিনকে জানান যেন আপনাকে সন্তানের সাথে যুক্ত করেন।"
        />
      </>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cards } = await (supabase as any)
    .from("report_cards")
    .select(`
      id, exam_id, student_id, overall_gpa, overall_grade, position_in_class, attendance_pct, published_at,
      exams!inner(id, name, start_date, is_published),
      students ( id, name_bn )
    `)
    .in("student_id", childIds)
    .eq("exams.is_published", true)
    .order("published_at", { ascending: false });

  const list = (cards ?? []) as Array<{
    id: string; exam_id: string; student_id: string;
    overall_gpa: number | null; overall_grade: string | null;
    position_in_class: number | null; attendance_pct: number | null; published_at: string;
    exams: { id: string; name: string; start_date: string | null };
    students: { id: string; name_bn: string };
  }>;

  return (
    <>
      <PageHeader
        title="পরীক্ষার ফলাফল"
        subtitle={list.length > 0 ? `${list.length} টি প্রকাশিত ফলাফল` : "এখনও কোন ফলাফল প্রকাশিত হয়নি"}
        impact={[{ label: <>মোট · <BanglaDigit value={list.length} /></>, tone: "accent" }]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title="কোন ফলাফল প্রকাশিত হয়নি"
          body="স্কুল যখন পরীক্ষার ফলাফল প্রকাশ করবে, এখানে সাথে সাথে দেখা যাবে।"
        />
      ) : (
        <div className="grid gap-3">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="flex-1">
                  <h3 className="font-semibold">{c.exams.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.students.name_bn} · {c.exams.start_date ? <BengaliDate value={c.exams.start_date} /> : null}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <span>GPA: <span className="font-bold">{c.overall_gpa?.toFixed(2) ?? "—"}</span></span>
                    <span>গ্রেড: <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{c.overall_grade ?? "—"}</span></span>
                    {c.position_in_class !== null ? (
                      <span>অবস্থান: <BanglaDigit value={c.position_in_class} /></span>
                    ) : null}
                    {c.attendance_pct !== null ? (
                      <span>উপস্থিতি: <BanglaDigit value={Math.round(Number(c.attendance_pct))} />%</span>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/portal/results/${c.exam_id}/${c.student_id}`}
                  className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
                >
                  মার্কশিট
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
