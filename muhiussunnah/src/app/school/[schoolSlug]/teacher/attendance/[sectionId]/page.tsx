import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { TEACHER_ROLES } from "@/lib/auth/roles";
import { formatDualDate } from "@/lib/utils/date";
import { AttendanceRoster } from "./roster";

type PageProps = {
  params: Promise<{ schoolSlug: string; sectionId: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function AttendanceEntryPage({ params, searchParams }: PageProps) {
  const { schoolSlug, sectionId } = await params;
  const { date = new Date().toISOString().slice(0, 10) } = await searchParams;
  const membership = await requireRole(schoolSlug, TEACHER_ROLES);

  const supabase = await supabaseServer();
  // Independent queries — section meta, roster, existing attendance all keyed off sectionId.
  const [sectionRes, studentsRes, existingRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id, name, classes!inner(name_bn, school_id)")
      .eq("id", sectionId)
      .eq("classes.school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, name_en, roll, photo_url, gender")
      .eq("section_id", sectionId)
      .eq("status", "active")
      .order("roll", { ascending: true, nullsFirst: false })
      .order("name_bn"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("attendance")
      .select("student_id, status, remarks")
      .eq("section_id", sectionId)
      .eq("date", date),
  ]);
  const { data: section } = sectionRes;
  const { data: students } = studentsRes;
  const { data: existing } = existingRes;

  if (!section) notFound();

  const studentList = (students ?? []) as Array<{ id: string; name_bn: string; name_en: string | null; roll: number | null; photo_url: string | null; gender: string | null }>;
  const existingMap: Record<string, { status: string; remarks: string | null }> = {};
  for (const e of (existing ?? []) as Array<{ student_id: string; status: string; remarks: string | null }>) {
    existingMap[e.student_id] = { status: e.status, remarks: e.remarks };
  }

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/teacher/attendance`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> সেকশন তালিকা
          </Link>
        }
        title={
          <>
            {(section as { classes: { name_bn: string } }).classes.name_bn} — সেকশন {(section as { name: string }).name}
          </>
        }
        subtitle={`${formatDualDate(date, { withWeekday: true })}`}
        impact={[
          { label: <>মোট ছাত্র · <BanglaDigit value={studentList.length} /></>, tone: "accent" },
          { label: "💡 সবুজ = উপস্থিত · লাল = অনুপস্থিত", tone: "default" },
        ]}
      />

      {studentList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            এই সেকশনে এখনও কোন সক্রিয় শিক্ষার্থী নেই।
          </CardContent>
        </Card>
      ) : (
        <AttendanceRoster
          schoolSlug={schoolSlug}
          sectionId={sectionId}
          date={date}
          students={studentList}
          initial={existingMap}
        />
      )}
    </>
  );
}
