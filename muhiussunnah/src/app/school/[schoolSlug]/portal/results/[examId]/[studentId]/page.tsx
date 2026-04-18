import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { PrintButton } from "@/components/ui/print-button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { PORTAL_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string; examId: string; studentId: string }> };

export default async function PortalMarksheetPage({ params }: PageProps) {
  const { schoolSlug, examId, studentId } = await params;
  const membership = await requireRole(schoolSlug, PORTAL_ROLES);

  const supabase = await supabaseServer();

  if (membership.role === "PARENT") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: link } = await (supabase as any)
      .from("student_guardians")
      .select("student_id")
      .eq("user_id", membership.school_user_id)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!link) redirect(`/school/${schoolSlug}/portal/results`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exam } = await (supabase as any)
    .from("exams")
    .select("id, name, start_date, end_date, is_published, published_at, school_id")
    .eq("id", examId)
    .single();
  if (!exam || !exam.is_published || exam.school_id !== membership.school_id) {
    redirect(`/school/${schoolSlug}/portal/results`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (supabase as any)
    .from("students")
    .select("id, name_bn, name_en, student_code, roll, photo_url, date_of_birth, sections(name, classes(name_bn))")
    .eq("id", studentId)
    .eq("school_id", membership.school_id)
    .single();
  if (!student) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (supabase as any)
    .from("schools")
    .select("name_bn, name_en, eiin, address, phone, logo_url")
    .eq("id", membership.school_id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: marks } = await (supabase as any)
    .from("marks")
    .select(`
      marks_obtained, is_absent, grade,
      exam_subjects!inner(full_marks, pass_marks, exam_id, subjects(name_bn, code))
    `)
    .eq("student_id", studentId)
    .eq("exam_subjects.exam_id", examId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reportCard } = await (supabase as any)
    .from("report_cards")
    .select("overall_gpa, overall_grade, total_marks_obtained, total_full_marks, position_in_class, attendance_pct, teacher_comment, ai_generated_comment, principal_remark")
    .eq("student_id", studentId)
    .eq("exam_id", examId)
    .maybeSingle();

  const marksList = (marks ?? []) as Array<{
    marks_obtained: number | null; is_absent: boolean; grade: string | null;
    exam_subjects: { full_marks: number; pass_marks: number; subjects: { name_bn: string; code: string | null } };
  }>;

  const totalMarks = marksList.reduce((s, m) => s + (m.is_absent ? 0 : Number(m.marks_obtained ?? 0)), 0);
  const fullMarks = marksList.reduce((s, m) => s + Number(m.exam_subjects.full_marks), 0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/school/${schoolSlug}/portal/results`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
          <ArrowLeft className="size-3.5" /> ফলাফল তালিকা
        </Link>
        <PrintButton />
      </div>

      <article className="marksheet mx-auto max-w-3xl rounded-lg border border-border/60 bg-card p-8 shadow-soft print:border-0 print:shadow-none print:p-12">
        <header className="flex items-center gap-4 border-b-2 border-primary/60 pb-4">
          {school?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logo_url} alt={school.name_bn} className="size-16 rounded object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded bg-gradient-primary text-2xl font-bold text-white">
              {school?.name_bn?.charAt(0) ?? "শ"}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{school?.name_bn}</h1>
            {school?.name_en ? <p className="text-sm text-muted-foreground">{school.name_en}</p> : null}
            {school?.address ? <p className="text-xs text-muted-foreground">{school.address}</p> : null}
          </div>
        </header>

        <h2 className="my-6 text-center text-xl font-bold tracking-wide">মার্কশিট / Marksheet</h2>
        <p className="mb-6 text-center text-sm"><span className="font-semibold">{exam.name}</span></p>

        <section className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div><span className="text-muted-foreground">নাম:</span> <span className="font-medium">{student.name_bn}</span></div>
          <div><span className="text-muted-foreground">ID:</span> <span className="font-medium">{student.student_code}</span></div>
          <div><span className="text-muted-foreground">শ্রেণি:</span> <span className="font-medium">{student.sections ? `${student.sections.classes.name_bn} — ${student.sections.name}` : "—"}</span></div>
          {student.roll ? <div><span className="text-muted-foreground">রোল:</span> <span className="font-medium">{student.roll}</span></div> : null}
        </section>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-primary/60">
              <th className="p-2 text-left">বিষয়</th>
              <th className="p-2 text-right">পূর্ণমান</th>
              <th className="p-2 text-right">পাশ</th>
              <th className="p-2 text-right">প্রাপ্ত</th>
              <th className="p-2 text-center">গ্রেড</th>
            </tr>
          </thead>
          <tbody>
            {marksList.map((m, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="p-2">{m.exam_subjects.subjects.name_bn}</td>
                <td className="p-2 text-right"><BanglaDigit value={m.exam_subjects.full_marks} /></td>
                <td className="p-2 text-right"><BanglaDigit value={m.exam_subjects.pass_marks} /></td>
                <td className="p-2 text-right font-medium">
                  {m.is_absent ? "অ" : m.marks_obtained !== null ? <BanglaDigit value={Number(m.marks_obtained)} /> : "—"}
                </td>
                <td className="p-2 text-center">{m.grade ?? "—"}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-primary/60 font-bold">
              <td className="p-2">মোট</td>
              <td className="p-2 text-right"><BanglaDigit value={fullMarks} /></td>
              <td className="p-2 text-right">—</td>
              <td className="p-2 text-right"><BanglaDigit value={totalMarks} /></td>
              <td className="p-2 text-center">{reportCard?.overall_grade ?? "—"}</td>
            </tr>
          </tbody>
        </table>

        {reportCard ? (
          <section className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-primary/60 pt-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">GPA</div>
              <div className="text-2xl font-bold"><BanglaDigit value={reportCard.overall_gpa?.toFixed(2) ?? "—"} /></div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">অবস্থান</div>
              <div className="text-2xl font-bold">
                {reportCard.position_in_class !== null ? <BanglaDigit value={reportCard.position_in_class} /> : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">উপস্থিতি</div>
              <div className="text-2xl font-bold">
                {reportCard.attendance_pct !== null ? (<><BanglaDigit value={Math.round(Number(reportCard.attendance_pct))} />%</>) : "—"}
              </div>
            </div>
          </section>
        ) : null}

        {reportCard?.teacher_comment || reportCard?.ai_generated_comment ? (
          <section className="mt-6 border-t border-border/60 pt-4">
            <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3" /> শিক্ষকের মন্তব্য
            </div>
            <p className="text-sm">{reportCard.teacher_comment ?? reportCard.ai_generated_comment}</p>
          </section>
        ) : null}

        {exam.published_at ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            প্রকাশিত: <BengaliDate value={exam.published_at} />
          </p>
        ) : null}
      </article>
    </>
  );
}
