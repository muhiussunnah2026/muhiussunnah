import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { PrintButton } from "@/components/ui/print-button";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { GenerateCommentButton } from "./generate-comment-button";

type PageProps = { params: Promise<{ id: string; studentId: string }> };

export default async function MarksheetPage({ params }: PageProps) {
  const { id: examId, studentId } = await params;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // All five independent — each keyed off known URL params / membership.school_id.
  const [studentRes, examRes, schoolRes, marksRes, reportCardRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, name_en, student_code, roll, photo_url, date_of_birth, sections(name, classes(name_bn))")
      .eq("id", studentId)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("exams")
      .select("id, name, start_date, end_date, is_published, published_at")
      .eq("id", examId)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("schools")
      .select("name_bn, name_en, eiin, address, phone, logo_url, type")
      .eq("id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("marks")
      .select(`
        marks_obtained, is_absent, grade,
        exam_subjects!inner ( full_marks, pass_marks, exam_id,
          subjects ( name_bn, name_en, code )
        )
      `)
      .eq("student_id", studentId)
      .eq("exam_subjects.exam_id", examId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("report_cards")
      .select("overall_gpa, overall_grade, total_marks_obtained, total_full_marks, position_in_class, attendance_pct, teacher_comment, ai_generated_comment, principal_remark")
      .eq("student_id", studentId)
      .eq("exam_id", examId)
      .maybeSingle(),
  ]);
  const { data: student } = studentRes;
  const { data: exam } = examRes;
  const { data: school } = schoolRes;
  const { data: marks } = marksRes;
  const { data: reportCard } = reportCardRes;

  if (!student) notFound();
  if (!exam) notFound();

  const marksList = (marks ?? []) as Array<{
    marks_obtained: number | null; is_absent: boolean; grade: string | null;
    exam_subjects: { full_marks: number; pass_marks: number;
      subjects: { name_bn: string; name_en: string | null; code: string | null } };
  }>;

  const totalMarks = marksList.reduce((s, m) => s + (m.is_absent ? 0 : Number(m.marks_obtained ?? 0)), 0);
  const fullMarks = marksList.reduce((s, m) => s + Number(m.exam_subjects.full_marks), 0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/admin/exams/${examId}`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
          <ArrowLeft className="size-3.5" /> পরীক্ষা
        </Link>
        <div className="flex gap-2">
          <GenerateCommentButton examId={examId} studentId={studentId} schoolSlug={schoolSlug} />
          <PrintButton />
        </div>
      </div>

      <article className="marksheet mx-auto max-w-3xl rounded-lg border border-border/60 bg-card p-8 shadow-soft print:border-0 print:shadow-none print:p-12">
        {/* Letterhead */}
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
            <p className="text-xs text-muted-foreground">
              {school?.eiin ? <>EIIN: {school.eiin}</> : null}
              {school?.phone ? <> · {school.phone}</> : null}
            </p>
          </div>
        </header>

        <h2 className="my-6 text-center text-xl font-bold tracking-wide">
          মার্কশিট / Marksheet
        </h2>
        <p className="mb-6 text-center text-sm">
          <span className="font-semibold">{exam.name}</span>
          {exam.start_date ? (<> · <BengaliDate value={exam.start_date} /></>) : null}
        </p>

        {/* Student info */}
        <section className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <Row label="নাম" value={student.name_bn} />
          {student.name_en ? <Row label="Name" value={student.name_en} /> : <div />}
          <Row label="শ্রেণি" value={student.sections ? `${student.sections.classes.name_bn} — ${student.sections.name}` : "—"} />
          <Row label="রোল" value={student.roll ?? "—"} />
          <Row label="ID" value={student.student_code} />
          {student.date_of_birth ? <Row label="জন্মতারিখ" value={<BengaliDate value={student.date_of_birth} />} /> : <div />}
        </section>

        {/* Marks table */}
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

        {/* Summary */}
        {reportCard ? (
          <section className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-primary/60 pt-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">GPA</div>
              <div className="text-2xl font-bold">
                <BanglaDigit value={reportCard.overall_gpa?.toFixed(2) ?? "—"} />
              </div>
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

        {/* Comments */}
        {reportCard?.teacher_comment || reportCard?.ai_generated_comment || reportCard?.principal_remark ? (
          <section className="mt-6 border-t border-border/60 pt-4">
            {reportCard.teacher_comment ? (
              <div className="mb-3">
                <div className="text-xs font-semibold text-muted-foreground">শিক্ষকের মন্তব্য</div>
                <p className="text-sm">{reportCard.teacher_comment}</p>
              </div>
            ) : null}
            {reportCard.ai_generated_comment && !reportCard.teacher_comment ? (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="size-3" /> AI-জেনারেটেড মন্তব্য
                </div>
                <p className="text-sm">{reportCard.ai_generated_comment}</p>
              </div>
            ) : null}
            {reportCard.principal_remark ? (
              <div>
                <div className="text-xs font-semibold text-muted-foreground">প্রধান শিক্ষকের মন্তব্য</div>
                <p className="text-sm">{reportCard.principal_remark}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Signatures */}
        <footer className="mt-12 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="mb-1 border-t border-border pt-1">শ্রেণি শিক্ষক</div>
          </div>
          <div>
            <div className="mb-1 border-t border-border pt-1">পরীক্ষা নিয়ন্ত্রক</div>
          </div>
          <div>
            <div className="mb-1 border-t border-border pt-1">প্রধান শিক্ষক</div>
          </div>
        </footer>

        {exam.published_at ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            প্রকাশিত: <BengaliDate value={exam.published_at} />
          </p>
        ) : null}
      </article>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-20 text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
