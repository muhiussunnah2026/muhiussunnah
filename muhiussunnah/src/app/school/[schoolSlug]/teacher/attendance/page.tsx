import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { TEACHER_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function TeacherAttendanceIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, TEACHER_ROLES);

  const supabase = await supabaseServer();

  // Independent queries — both keyed off the same user_id / school_id.
  const [sectionsAsClassTeacherRes, assignmentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id, name, classes!inner(name_bn, school_id)")
      .eq("classes.school_id", membership.school_id)
      .eq("class_teacher_id", membership.school_user_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("teacher_assignments")
      .select("section_id, sections!inner(id, name, classes!inner(name_bn, school_id))")
      .eq("school_user_id", membership.school_user_id)
      .eq("sections.classes.school_id", membership.school_id),
  ]);
  const { data: sectionsAsClassTeacher } = sectionsAsClassTeacherRes;
  const { data: assignments } = assignmentsRes;

  const sectionMap = new Map<string, { id: string; name: string; class_name: string }>();
  for (const s of (sectionsAsClassTeacher ?? []) as Array<{ id: string; name: string; classes: { name_bn: string } }>) {
    sectionMap.set(s.id, { id: s.id, name: s.name, class_name: s.classes.name_bn });
  }
  for (const a of (assignments ?? []) as Array<{ sections: { id: string; name: string; classes: { name_bn: string } } }>) {
    if (!a.sections) continue;
    sectionMap.set(a.sections.id, { id: a.sections.id, name: a.sections.name, class_name: a.sections.classes.name_bn });
  }
  const sections = Array.from(sectionMap.values());

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="আজকের উপস্থিতি"
        subtitle="আপনার অ্যাসাইন করা সেকশনে ক্লিক করে attendance নিন। প্রতিটি ছাত্রের জন্য মাত্র ২-৩ সেকেন্ড।"
        impact={[
          { label: <>আপনার সেকশন · <BanglaDigit value={sections.length} /></>, tone: "accent" },
          { label: "⚡ Offline-capable", tone: "success" },
        ]}
      />

      {sections.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="size-8" />}
          title="কোন ক্লাস অ্যাসাইন করা হয়নি"
          body="প্রিন্সিপালকে জানান যেন আপনাকে কোন সেকশন/বিষয়ে অ্যাসাইন করেন।"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/school/${schoolSlug}/teacher/attendance/${s.id}?date=${today}`}
              className="group"
            >
              <Card className="transition hover:shadow-hover">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-semibold">{s.class_name}</h3>
                    <p className="text-sm text-muted-foreground">সেকশন: {s.name}</p>
                  </div>
                  <span className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Attendance →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
