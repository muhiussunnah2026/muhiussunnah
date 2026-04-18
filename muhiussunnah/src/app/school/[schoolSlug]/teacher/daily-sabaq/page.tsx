import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { formatDualDate } from "@/lib/utils/date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMadrasaRole } from "@/lib/auth/require-madrasa";
import { TEACHER_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function TeacherSabaqPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const { active } = await requireMadrasaRole(schoolSlug, [...TEACHER_ROLES, "MADRASA_USTADH"]);

  const supabase = await supabaseServer();

  // Sections where teacher is class_teacher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sectionsAsClassTeacher } = await (supabase as any)
    .from("sections")
    .select("id, name, classes!inner(name_bn, school_id, stream)")
    .eq("classes.school_id", active.school_id)
    .eq("class_teacher_id", active.school_user_id);

  // Sections via teacher_assignments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignments } = await (supabase as any)
    .from("teacher_assignments")
    .select("section_id, sections!inner(id, name, classes!inner(name_bn, school_id, stream))")
    .eq("school_user_id", active.school_user_id)
    .eq("sections.classes.school_id", active.school_id);

  const map = new Map<string, { id: string; name: string; class_name: string; stream: string }>();
  for (const s of (sectionsAsClassTeacher ?? []) as Array<{ id: string; name: string; classes: { name_bn: string; stream: string } }>) {
    map.set(s.id, { id: s.id, name: s.name, class_name: s.classes.name_bn, stream: s.classes.stream });
  }
  for (const a of (assignments ?? []) as Array<{ sections: { id: string; name: string; classes: { name_bn: string; stream: string } } }>) {
    if (!a.sections) continue;
    map.set(a.sections.id, { id: a.sections.id, name: a.sections.name, class_name: a.sections.classes.name_bn, stream: a.sections.classes.stream });
  }
  const sections = Array.from(map.values());
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="দৈনিক সবক"
        subtitle={`${formatDualDate(today, { withWeekday: true, withHijri: true })} · আপনার সেকশনে ক্লিক করে সবক এন্ট্রি করুন।`}
        impact={[{ label: <>আপনার সেকশন · <BanglaDigit value={sections.length} /></>, tone: "accent" }]}
      />

      {sections.length === 0 ? (
        <EmptyState
          icon={<BookOpenText className="size-8" />}
          title="কোন ক্লাস অ্যাসাইন করা হয়নি"
          body="প্রিন্সিপালকে জানান যেন আপনাকে কোন সেকশনে অ্যাসাইন করেন।"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/school/${schoolSlug}/admin/madrasa/daily-sabaq/${s.id}?date=${today}`}
              className="group"
            >
              <Card className="transition hover:shadow-hover">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{s.class_name} — সেকশন {s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">স্ট্রিম: {s.stream}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
