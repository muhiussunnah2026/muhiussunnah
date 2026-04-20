import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { TEACHER_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function TeacherMarksIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, TEACHER_ROLES);

  const supabase = await supabaseServer();

  // Independent queries — both keyed off the same user_id.
  const [assignmentsRes, classTeacherSectionsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("teacher_assignments")
      .select("section_id, subject_id")
      .eq("school_user_id", membership.school_user_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id")
      .eq("class_teacher_id", membership.school_user_id),
  ]);
  const { data: assignments } = assignmentsRes;
  const { data: classTeacherSections } = classTeacherSectionsRes;

  const subjectIds = new Set(((assignments ?? []) as { subject_id: string | null }[]).map((a) => a.subject_id).filter(Boolean));
  const sectionIds = new Set(((assignments ?? []) as { section_id: string }[]).map((a) => a.section_id));
  for (const s of ((classTeacherSections ?? []) as { id: string }[])) sectionIds.add(s.id);

  // Find exam_subjects matching the teacher's scope (active exams)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("exam_subjects")
    .select(`
      id, date, full_marks, pass_marks, section_id, subject_id,
      subjects(name_bn),
      sections(name, classes(name_bn)),
      exams!inner(id, name, is_published, school_id)
    `)
    .eq("exams.school_id", membership.school_id)
    .order("date", { ascending: true, nullsFirst: false });

  if (sectionIds.size > 0) query = query.in("section_id", Array.from(sectionIds));

  const { data: examSubjects } = await query;
  const list = (examSubjects ?? []) as Array<{
    id: string; date: string | null; full_marks: number; pass_marks: number;
    section_id: string; subject_id: string;
    subjects: { name_bn: string };
    sections: { name: string; classes: { name_bn: string } };
    exams: { id: string; name: string; is_published: boolean };
  }>;

  // Further filter: for SUBJECT_TEACHER, only keep subjects they're assigned to
  const filtered = membership.role === "SUBJECT_TEACHER"
    ? list.filter((es) => subjectIds.has(es.subject_id))
    : list;

  return (
    <>
      <PageHeader
        title="মার্ক্স এন্ট্রি"
        subtitle="আপনি যে ক্লাস + বিষয়ে শিক্ষক, সেগুলোর মার্ক্স এন্ট্রি এখান থেকে করুন।"
        impact={[{ label: <>আপনার ক্লাস · <BanglaDigit value={filtered.length} /></>, tone: "accent" }]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title="কোন মার্ক্স এন্ট্রি বাকি নেই"
          body="হয় আপনার জন্য অ্যাসাইনমেন্ট নেই, অথবা সব পরীক্ষার মার্ক্স আগেই দেওয়া আছে।"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((es) => (
            <Link
              key={es.id}
              href={`/school/${schoolSlug}/admin/exams/${es.exams.id}/marks/${es.id}`}
              className="group"
            >
              <Card className="transition hover:shadow-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{es.subjects.name_bn}</h3>
                      <p className="text-xs text-muted-foreground">
                        {es.sections.classes.name_bn} — {es.sections.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      পূর্ণমান <BanglaDigit value={es.full_marks} />
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">{es.exams.name}</div>
                  {es.exams.is_published ? (
                    <div className="mt-2 text-xs text-success">✓ ফলাফল প্রকাশিত</div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
