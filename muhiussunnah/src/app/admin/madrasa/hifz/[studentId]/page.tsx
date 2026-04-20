import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveMadrasaRole } from "@/lib/auth/require-madrasa";
import { ADMIN_ROLES, TEACHER_ROLES } from "@/lib/auth/roles";
import { ParaRow } from "./para-row";

type PageProps = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ para?: string }>;
};

export default async function HifzStudentPage({ params, searchParams }: PageProps) {
  const { studentId } = await params;
  const { para: paraParam } = await searchParams;
  const { active } = await requireActiveMadrasaRole([...ADMIN_ROLES, ...TEACHER_ROLES, "MADRASA_USTADH"]);

  const schoolSlug = active.school_slug;
  const supabase = await supabaseServer();

  // Independent — both keyed off studentId (from URL params).
  const [studentRes, progressRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, student_code, roll, photo_url, sections(name, classes(name_bn))")
      .eq("id", studentId)
      .eq("school_id", active.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("hifz_progress")
      .select("para_no, status, mark, grade, mistakes_count, tested_on, note")
      .eq("student_id", studentId)
      .order("para_no"),
  ]);
  const { data: student } = studentRes;
  const { data: progress } = progressRes;

  if (!student) notFound();

  const progressMap = new Map<number, { status: string; mark: number | null; grade: string | null; mistakes_count: number; tested_on: string | null; note: string | null }>();
  for (const p of (progress ?? []) as Array<{ para_no: number; status: string; mark: number | null; grade: string | null; mistakes_count: number; tested_on: string | null; note: string | null }>) {
    progressMap.set(p.para_no, p);
  }

  const paras = Array.from({ length: 30 }, (_, i) => i + 1);
  const completed = paras.filter((n) => {
    const st = progressMap.get(n)?.status;
    return st === "completed" || st === "tested";
  }).length;
  const pct = Math.round((completed / 30) * 100);

  const highlightPara = paraParam ? Number(paraParam) : null;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/madrasa/hifz`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> হিফজ
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            <Avatar className="size-10">
              {student.photo_url ? <AvatarImage src={student.photo_url} alt={student.name_bn} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">{student.name_bn.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{student.name_bn}</span>
          </span>
        }
        subtitle={
          <>
            {student.sections ? <>{student.sections.classes.name_bn} — {student.sections.name} · </> : null}
            ID: <span className="font-mono">{student.student_code}</span>
          </>
        }
        impact={[
          { label: <>সম্পন্ন · <BanglaDigit value={completed} />/<BanglaDigit value={30} /></>, tone: "success" },
          { label: <>অগ্রগতি · <BanglaDigit value={pct} />%</>, tone: "accent" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs">
              <tr>
                <th className="p-2 text-left">পারা</th>
                <th className="p-2 text-left">স্ট্যাটাস</th>
                <th className="p-2 text-right">মার্ক</th>
                <th className="p-2 text-center">ভুল</th>
                <th className="p-2 text-left">পরীক্ষিত</th>
                <th className="p-2 text-left">মন্তব্য</th>
                <th className="p-2 text-right">আপডেট</th>
              </tr>
            </thead>
            <tbody>
              {paras.map((n) => {
                const p = progressMap.get(n);
                return (
                  <tr key={n} className={`border-t border-border/40 ${highlightPara === n ? "bg-primary/5" : ""}`}>
                    <td className="p-2 font-semibold"><BanglaDigit value={n} /></td>
                    <td className="p-2"><StatusPill status={p?.status ?? "none"} /></td>
                    <td className="p-2 text-right">{p?.mark !== null && p?.mark !== undefined ? <BanglaDigit value={p.mark} /> : "—"}</td>
                    <td className="p-2 text-center">{p?.mistakes_count ? <BanglaDigit value={p.mistakes_count} /> : "—"}</td>
                    <td className="p-2 text-xs">{p?.tested_on ? <BengaliDate value={p.tested_on} /> : "—"}</td>
                    <td className="p-2 text-xs text-muted-foreground">{p?.note ?? "—"}</td>
                    <td className="p-2 text-right">
                      <ParaRow
                        studentId={studentId}
                        paraNo={n}
                        initial={{
                          status: (p?.status ?? "learning") as "learning" | "revising" | "completed" | "tested",
                          mark: p?.mark ?? null,
                          grade: p?.grade ?? "",
                          mistakes_count: p?.mistakes_count ?? 0,
                          note: p?.note ?? "",
                        }}
                        schoolSlug={schoolSlug}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    learning:  { label: "শিখছে",   cls: "bg-warning/20 text-warning-foreground dark:text-warning" },
    revising:  { label: "রিভিশন",  cls: "bg-info/20 text-info" },
    completed: { label: "সম্পন্ন",  cls: "bg-primary/20 text-primary" },
    tested:    { label: "পরীক্ষিত", cls: "bg-success/20 text-success" },
    none:      { label: "শুরু হয়নি", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[status] ?? map.none;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${m.cls}`}>{m.label}</span>;
}
