import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { GradeForm } from "./grade-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const membership = await requireActiveRole([...ADMIN_ROLES, "CLASS_TEACHER", "SUBJECT_TEACHER"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase as any)
    .from("assignments")
    .select("id, title, description, due_date, max_marks, section_id, sections ( name_bn, classes ( name_bn ) ), subjects ( name_bn )")
    .eq("id", id)
    .eq("school_id", membership.school_id)
    .single();

  if (!assignment) return notFound();

  const [{ data: submissions }, { data: students }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("assignment_submissions")
      .select("id, student_id, body, file_url, marks, feedback, submitted_at, graded_at")
      .eq("assignment_id", id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, name_en, roll_no")
      .eq("section_id", assignment.section_id)
      .eq("is_active", true)
      .order("roll_no"),
  ]);

  type Student = { id: string; name_bn: string | null; name_en: string | null; roll_no: string | null };
  type Submission = { id: string; student_id: string; body: string | null; file_url: string | null; marks: number | null; feedback: string | null; submitted_at: string | null; graded_at: string | null };
  const studentList = (students ?? []) as Student[];
  const subMap = new Map(((submissions ?? []) as Submission[]).map((s) => [s.student_id, s]));

  const submittedCount = subMap.size;
  const gradedCount = Array.from(subMap.values()).filter((s) => s.graded_at).length;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/assignments`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> অ্যাসাইনমেন্ট
          </Link>
        }
        title={assignment.title}
        subtitle={`${assignment.sections?.classes?.name_bn ?? ""} — ${assignment.sections?.name_bn ?? ""} · ${assignment.subjects?.name_bn ?? ""}`}
        impact={[
          { label: <>জমা · <BanglaDigit value={submittedCount} /> / <BanglaDigit value={studentList.length} /></>, tone: "accent" },
          { label: <>গ্রেড · <BanglaDigit value={gradedCount} /> / <BanglaDigit value={submittedCount} /></>, tone: gradedCount === submittedCount && submittedCount > 0 ? "success" : "default" },
          ...(assignment.due_date ? [{ label: <>শেষ তারিখ: {new Date(assignment.due_date).toLocaleDateString("bn-BD")}</>, tone: "default" as const }] : []),
        ]}
      />

      {assignment.description && (
        <Card className="mb-4">
          <CardContent className="p-4 text-sm whitespace-pre-wrap">{assignment.description}</CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {studentList.map((s) => {
          const sub = subMap.get(s.id);
          return (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-medium">{s.name_bn ?? s.name_en ?? "—"}</div>
                    {s.roll_no && <div className="text-xs text-muted-foreground">Roll: <BanglaDigit value={s.roll_no} /></div>}
                  </div>
                  {sub ? (
                    sub.graded_at
                      ? <Badge className="bg-success/10 text-success" variant="secondary">গ্রেড করা হয়েছে</Badge>
                      : <Badge variant="default">জমা হয়েছে — গ্রেড দিন</Badge>
                  ) : (
                    <Badge variant="outline">জমা দেয়নি</Badge>
                  )}
                </div>

                {sub && (
                  <>
                    {sub.body && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">{sub.body}</div>
                    )}
                    {sub.file_url && (
                      <a href={sub.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                        📎 জমা দেওয়া ফাইল দেখুন
                      </a>
                    )}
                    <div className="mt-3">
                      <GradeForm
                        submissionId={sub.id}
                        currentMarks={sub.marks}
                        currentFeedback={sub.feedback}
                        maxMarks={assignment.max_marks} schoolSlug={schoolSlug}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
