import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ScrollText, Users2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { RoutineAddForm } from "./routine-add-form";
import { DeleteRoutineButton } from "./delete-routine";
import { PublishButton } from "./publish-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // All five independent — exam by id, routine/reportCards by exam_id, subjects/sections by school_id (all known pre-query).
  const [examRes, routineRes, subjectsRes, sectionsRes, reportCardsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("exams")
      .select("id, name, type, start_date, end_date, is_published, published_at, academic_year_id, school_id")
      .eq("id", id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("exam_subjects")
      .select(`
        id, date, start_time, duration_mins, full_marks, pass_marks,
        subjects ( id, name_bn, name_en ),
        sections ( id, name, classes ( id, name_bn ) )
      `)
      .eq("exam_id", id)
      .order("date", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("subjects")
      .select("id, name_bn, class_id, full_marks, pass_marks")
      .eq("school_id", membership.school_id)
      .order("display_order"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id, name, class_id, classes!inner(name_bn, school_id)")
      .eq("classes.school_id", membership.school_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("report_cards")
      .select(`
        id, student_id, overall_gpa, overall_grade, total_marks_obtained, total_full_marks, position_in_class, attendance_pct,
        students ( id, name_bn, student_code, roll, sections ( name, classes ( name_bn ) ) )
      `)
      .eq("exam_id", id)
      .order("overall_gpa", { ascending: false }),
  ]);
  const { data: exam } = examRes;
  const { data: routine } = routineRes;
  const { data: subjects } = subjectsRes;
  const { data: sections } = sectionsRes;
  const { data: reportCards } = reportCardsRes;

  if (!exam || exam.school_id !== membership.school_id) notFound();

  const routineRows = (routine ?? []) as Array<{
    id: string; date: string | null; start_time: string | null; duration_mins: number | null;
    full_marks: number; pass_marks: number;
    subjects: { id: string; name_bn: string; name_en: string | null };
    sections: { id: string; name: string; classes: { id: string; name_bn: string } };
  }>;

  const subjectList = (subjects ?? []) as { id: string; name_bn: string; class_id: string | null; full_marks: number; pass_marks: number }[];
  const sectionList = (sections ?? []) as { id: string; name: string; class_id: string; classes: { name_bn: string } }[];

  const cards = (reportCards ?? []) as Array<{
    id: string; student_id: string; overall_gpa: number | null; overall_grade: string | null;
    total_marks_obtained: number | null; total_full_marks: number | null;
    position_in_class: number | null; attendance_pct: number | null;
    students: { id: string; name_bn: string; student_code: string; roll: number | null; sections: { name: string; classes: { name_bn: string } } | null } | null;
  }>;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/exams`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> পরীক্ষা তালিকা
          </Link>
        }
        title={exam.name}
        subtitle={
          <>
            {exam.start_date ? <><BengaliDate value={exam.start_date} /> থেকে </> : null}
            {exam.end_date ? <BengaliDate value={exam.end_date} /> : null}
          </>
        }
        impact={[
          { label: <>রুটিন · <BanglaDigit value={routineRows.length} /></>, tone: "accent" },
          { label: <>Report card · <BanglaDigit value={cards.length} /></>, tone: "default" },
          exam.is_published
            ? { label: "✓ প্রকাশিত", tone: "success" as const }
            : { label: "Draft", tone: "warning" as const },
        ]}
        actions={<PublishButton examId={id} published={exam.is_published} schoolSlug={schoolSlug} />}
      />

      <Tabs defaultValue="routine">
        <TabsList className="mb-4">
          <TabsTrigger value="routine"><Calendar className="me-1.5 size-3.5" />রুটিন</TabsTrigger>
          <TabsTrigger value="marks"><ScrollText className="me-1.5 size-3.5" />মার্ক্স</TabsTrigger>
          <TabsTrigger value="results"><Users2 className="me-1.5 size-3.5" />ফলাফল</TabsTrigger>
        </TabsList>

        <TabsContent value="routine">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardContent className="p-0">
                {routineRows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    এখনও কোন রুটিন এন্ট্রি নেই।
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>সময়</TableHead>
                        <TableHead>বিষয়</TableHead>
                        <TableHead>ক্লাস/সেকশন</TableHead>
                        <TableHead className="text-right">পূর্ণমান</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routineRows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs"><BengaliDate value={r.date} /></TableCell>
                          <TableCell className="text-xs">{r.start_time ?? "—"}{r.duration_mins ? ` (${r.duration_mins}m)` : ""}</TableCell>
                          <TableCell>
                            <Link href={`/admin/exams/${id}/marks/${r.id}`} className="font-medium text-primary hover:underline">
                              {r.subjects.name_bn}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.sections.classes.name_bn} — {r.sections.name}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <BanglaDigit value={r.full_marks} /> · পাশ <BanglaDigit value={r.pass_marks} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DeleteRoutineButton examId={id} rowId={r.id} schoolSlug={schoolSlug} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <aside>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 text-lg font-semibold">রুটিন যোগ</h3>
                  <RoutineAddForm examId={id} subjects={subjectList} sections={sectionList} schoolSlug={schoolSlug} />
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="marks">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">মার্ক্স এন্ট্রির জন্য একটি বিষয় নির্বাচন করুন</h3>
              {routineRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">প্রথমে রুটিন সেট করুন।</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {routineRows.map((r) => (
                    <Link
                      key={r.id}
                      href={`/admin/exams/${id}/marks/${r.id}`}
                      className="rounded-lg border border-border/60 p-4 transition hover:border-primary/40 hover:shadow-hover"
                    >
                      <div className="font-medium">{r.subjects.name_bn}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.sections.classes.name_bn} — {r.sections.name} · পূর্ণমান <BanglaDigit value={r.full_marks} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {cards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                এখনও কোন report card তৈরি হয়নি। মার্ক্স এন্ট্রির পর &ldquo;প্রকাশ করুন&rdquo; চাপুন।
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>অবস্থান</TableHead>
                      <TableHead>ছাত্র</TableHead>
                      <TableHead>ক্লাস</TableHead>
                      <TableHead className="text-right">মোট</TableHead>
                      <TableHead className="text-right">GPA</TableHead>
                      <TableHead>গ্রেড</TableHead>
                      <TableHead className="text-right">উপস্থিতি</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold">
                          {c.position_in_class !== null ? <BanglaDigit value={c.position_in_class} /> : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{c.students?.name_bn}</div>
                          <div className="text-xs text-muted-foreground">{c.students?.student_code}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.students?.sections ? `${c.students.sections.classes.name_bn} — ${c.students.sections.name}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <BanglaDigit value={Number(c.total_marks_obtained ?? 0)} />/<BanglaDigit value={Number(c.total_full_marks ?? 0)} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">{c.overall_gpa?.toFixed(2) ?? "—"}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{c.overall_grade ?? "—"}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {c.attendance_pct !== null ? <><BanglaDigit value={Math.round(Number(c.attendance_pct))} />%</> : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {c.students ? (
                            <Link
                              href={`/admin/exams/${id}/marksheet/${c.students.id}`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              মার্কশিট
                            </Link>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
