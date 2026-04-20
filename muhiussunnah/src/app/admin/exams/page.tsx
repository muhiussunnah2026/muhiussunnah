import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddExamForm } from "./add-exam-form";

const typeLabel: Record<string, string> = {
  term: "সাময়িক", annual: "বার্ষিক", model_test: "মডেল টেস্ট",
  monthly: "মাসিক", other: "অন্যান্য",
};

export default async function ExamsListPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Independent — both keyed off school_id.
  const [examsRes, yearsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("exams")
      .select("id, name, type, start_date, end_date, is_published, published_at, academic_year_id, academic_years(name)")
      .eq("school_id", membership.school_id)
      .order("start_date", { ascending: false, nullsFirst: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("academic_years")
      .select("id, name, is_active")
      .eq("school_id", membership.school_id)
      .order("start_date", { ascending: false }),
  ]);
  const { data: exams } = examsRes;
  const { data: years } = yearsRes;

  const list = (exams ?? []) as Array<{
    id: string; name: string; type: string; start_date: string | null; end_date: string | null;
    is_published: boolean; published_at: string | null;
    academic_years: { name: string } | null;
  }>;
  const yearList = (years ?? []) as { id: string; name: string; is_active: boolean }[];

  const published = list.filter((e) => e.is_published).length;

  return (
    <>
      <PageHeader
        title="পরীক্ষা ব্যবস্থাপনা"
        subtitle="সাময়িক, বার্ষিক, মডেল টেস্ট — সব পরীক্ষা এক জায়গায়। রুটিন → মার্ক্স এন্ট্রি → ফলাফল প্রকাশ, এক workflow।"
        impact={[
          { label: <>মোট · <BanglaDigit value={list.length} /></>, tone: "accent" },
          { label: <>প্রকাশিত · <BanglaDigit value={published} /></>, tone: "success" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="size-8" />}
              title="📝 প্রথম পরীক্ষা তৈরি করুন"
              body="পরীক্ষা তৈরি করে রুটিন সেট করুন, তারপর শিক্ষকরা মার্ক্স এন্ট্রি করতে পারবে।"
              proTip="প্রথমে একটি Academic Year তৈরি করুন, তারপর সেই বছরের অধীনে পরীক্ষা যোগ করুন।"
            />
          ) : (
            <div className="grid gap-3">
              {list.map((e) => (
                <Link key={e.id} href={`/admin/exams/${e.id}`} className="group">
                  <Card className="transition hover:shadow-hover">
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{e.name}</h3>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {typeLabel[e.type] ?? e.type}
                          </span>
                          {e.academic_years ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              {e.academic_years.name}
                            </span>
                          ) : null}
                          {e.is_published ? (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                              ✓ প্রকাশিত
                            </span>
                          ) : (
                            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning-foreground dark:text-warning">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {e.start_date ? <><BengaliDate value={e.start_date} /> থেকে </> : null}
                          {e.end_date ? <BengaliDate value={e.end_date} /> : null}
                          {!e.start_date && !e.end_date ? "তারিখ সেট করা হয়নি" : null}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন পরীক্ষা</h2>
              <AddExamForm years={yearList} schoolSlug={schoolSlug} />
              {yearList.length === 0 ? (
                <p className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs">
                  ⚠ আগে Academic Year তৈরি করুন Settings থেকে।
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
