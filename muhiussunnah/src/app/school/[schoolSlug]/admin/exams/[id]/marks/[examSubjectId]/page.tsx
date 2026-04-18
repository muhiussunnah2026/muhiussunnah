import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES, TEACHER_ROLES } from "@/lib/auth/roles";
import { MarksGrid } from "./marks-grid";

type PageProps = { params: Promise<{ schoolSlug: string; id: string; examSubjectId: string }> };

export default async function MarksEntryPage({ params }: PageProps) {
  const { schoolSlug, id: examId, examSubjectId } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT", ...TEACHER_ROLES]);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: examSubject } = await (supabase as any)
    .from("exam_subjects")
    .select(`
      id, full_marks, pass_marks,
      exams!inner(id, name, school_id),
      subjects(name_bn),
      sections(id, name, classes(name_bn))
    `)
    .eq("id", examSubjectId)
    .single();

  if (!examSubject || examSubject.exams.school_id !== membership.school_id) notFound();

  const es = examSubject as {
    id: string; full_marks: number; pass_marks: number;
    exams: { id: string; name: string };
    subjects: { name_bn: string };
    sections: { id: string; name: string; classes: { name_bn: string } };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, name_bn, roll, student_code, photo_url")
    .eq("section_id", es.sections.id)
    .eq("status", "active")
    .order("roll", { ascending: true, nullsFirst: false })
    .order("name_bn");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("marks")
    .select("student_id, marks_obtained, is_absent, grade, locked")
    .eq("exam_subject_id", examSubjectId);

  const studentList = (students ?? []) as { id: string; name_bn: string; roll: number | null; student_code: string; photo_url: string | null }[];
  const existingMap: Record<string, { marks: number | null; is_absent: boolean; grade: string | null }> = {};
  let locked = false;
  for (const e of (existing ?? []) as { student_id: string; marks_obtained: number | null; is_absent: boolean; grade: string | null; locked: boolean }[]) {
    existingMap[e.student_id] = { marks: e.marks_obtained, is_absent: e.is_absent, grade: e.grade };
    if (e.locked) locked = true;
  }

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/exams/${examId}`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> পরীক্ষা
          </Link>
        }
        title={<>{es.subjects.name_bn} — মার্ক্স এন্ট্রি</>}
        subtitle={<>{es.exams.name} · {es.sections.classes.name_bn} — {es.sections.name}</>}
        impact={[
          { label: <>পূর্ণমান · <BanglaDigit value={es.full_marks} /></>, tone: "default" },
          { label: <>পাশ · <BanglaDigit value={es.pass_marks} /></>, tone: "default" },
          { label: <>ছাত্র · <BanglaDigit value={studentList.length} /></>, tone: "accent" },
          locked ? { label: "🔒 লক করা", tone: "warning" as const } : { label: "✏ Editable", tone: "default" as const },
        ]}
      />

      {studentList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            এই সেকশনে এখনও সক্রিয় শিক্ষার্থী নেই।
          </CardContent>
        </Card>
      ) : (
        <MarksGrid
          schoolSlug={schoolSlug}
          examSubjectId={examSubjectId}
          fullMarks={es.full_marks}
          passMarks={es.pass_marks}
          students={studentList}
          initial={existingMap}
          locked={locked}
        />
      )}
    </>
  );
}
