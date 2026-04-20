import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { PORTAL_ROLES } from "@/lib/auth/roles";

const statusColor: Record<string, string> = {
  learning:  "bg-warning/40",
  revising:  "bg-info/40",
  completed: "bg-primary/60",
  tested:    "bg-success/70",
  none:      "bg-muted",
};

const statusLabel: Record<string, string> = {
  learning: "শিখছে", revising: "রিভিশন", completed: "সম্পন্ন", tested: "পরীক্ষিত", none: "শুরু হয়নি",
};

export default async function PortalHifzPage() {
  const membership = await requireActiveRole(PORTAL_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

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
        <PageHeader title="হিফজ অগ্রগতি" subtitle="সন্তানের হিফজ অবস্থা এখানে দেখাবে।" />
        <EmptyState
          icon={<BookOpenText className="size-8" />}
          title="সন্তানের সাথে লিংক করা নেই"
          body="স্কুল অ্যাডমিনকে জানান যেন আপনাকে সন্তানের সাথে যুক্ত করেন।"
        />
      </>
    );
  }

  // Independent queries — both keyed off childIds only.
  const [studentsRes, progressRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn")
      .in("id", childIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("hifz_progress")
      .select("student_id, para_no, status, mark, tested_on")
      .in("student_id", childIds),
  ]);
  const { data: students } = studentsRes;
  const { data: progress } = progressRes;

  const byStudent = new Map<string, Map<number, { status: string; mark: number | null; tested_on: string | null }>>();
  for (const p of (progress ?? []) as Array<{ student_id: string; para_no: number; status: string; mark: number | null; tested_on: string | null }>) {
    const m = byStudent.get(p.student_id) ?? new Map();
    m.set(p.para_no, { status: p.status, mark: p.mark, tested_on: p.tested_on });
    byStudent.set(p.student_id, m);
  }

  const studentList = (students ?? []) as { id: string; name_bn: string }[];

  return (
    <>
      <PageHeader
        title="হিফজ অগ্রগতি"
        subtitle="আপনার সন্তানের ৩০ পারার হিফজ অবস্থা।"
      />

      {studentList.map((s) => {
        const paraMap = byStudent.get(s.id);
        const completed = paraMap ? Array.from(paraMap.values()).filter((v) => v.status === "completed" || v.status === "tested").length : 0;
        const pct = Math.round((completed / 30) * 100);
        return (
          <Card key={s.id} className="mb-4">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{s.name_bn}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <BanglaDigit value={completed} />/<BanglaDigit value={30} /> পারা · <BanglaDigit value={pct} />%
                </span>
              </div>

              {/* 30-para grid */}
              <div className="grid grid-cols-10 gap-1 md:grid-cols-15">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
                  const p = paraMap?.get(n);
                  const st = p?.status ?? "none";
                  return (
                    <div key={n} className="flex flex-col items-center gap-0.5">
                      <div
                        className={`size-8 rounded ${statusColor[st]} flex items-center justify-center text-[10px] font-semibold text-white`}
                        title={`পারা ${n} · ${statusLabel[st]}${p?.tested_on ? ` · পরীক্ষিত ${p.tested_on}` : ""}`}
                      >
                        <BanglaDigit value={n} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent tested */}
              {paraMap ? (
                <div className="mt-4 text-xs text-muted-foreground">
                  {Array.from(paraMap.entries())
                    .filter(([, v]) => v.status === "tested" && v.tested_on)
                    .sort((a, b) => (b[1].tested_on ?? "").localeCompare(a[1].tested_on ?? ""))
                    .slice(0, 3)
                    .map(([n, v]) => (
                      <span key={n} className="me-3">
                        পারা <BanglaDigit value={n} /> পরীক্ষিত · <BengaliDate value={v.tested_on!} />
                      </span>
                    ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
