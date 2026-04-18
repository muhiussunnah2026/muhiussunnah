import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { formatDualDate } from "@/lib/utils/date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMadrasaRole } from "@/lib/auth/require-madrasa";
import { ADMIN_ROLES, TEACHER_ROLES } from "@/lib/auth/roles";
import { SabaqGrid } from "./sabaq-grid";

type PageProps = {
  params: Promise<{ schoolSlug: string; sectionId: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function SabaqGridPage({ params, searchParams }: PageProps) {
  const { schoolSlug, sectionId } = await params;
  const { date = new Date().toISOString().slice(0, 10) } = await searchParams;
  const { active } = await requireMadrasaRole(schoolSlug, [...ADMIN_ROLES, ...TEACHER_ROLES, "MADRASA_USTADH"]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: section } = await (supabase as any)
    .from("sections")
    .select("id, name, classes!inner(name_bn, school_id)")
    .eq("id", sectionId)
    .eq("classes.school_id", active.school_id)
    .single();
  if (!section) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, name_bn, roll, student_code")
    .eq("section_id", sectionId)
    .eq("status", "active")
    .order("roll", { ascending: true, nullsFirst: false })
    .order("name_bn");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("daily_sabaq")
    .select("student_id, sabaq_para, sabaq_from, sabaq_to, sabaq_quality, sabqi_para, sabqi_quality, manzil_paras, manzil_quality, tajweed_notes")
    .eq("date", date)
    .in("student_id", ((students ?? []) as { id: string }[]).map((s) => s.id));

  const existingMap: Record<string, {
    sabaq_para: number | null; sabaq_from: string | null; sabaq_to: string | null; sabaq_quality: string | null;
    sabqi_para: number | null; sabqi_quality: string | null;
    manzil_paras: number[]; manzil_quality: string | null;
    tajweed_notes: string | null;
  }> = {};
  for (const e of (existing ?? []) as Array<{ student_id: string; sabaq_para: number | null; sabaq_from: string | null; sabaq_to: string | null; sabaq_quality: string | null; sabqi_para: number | null; sabqi_quality: string | null; manzil_paras: number[]; manzil_quality: string | null; tajweed_notes: string | null }>) {
    existingMap[e.student_id] = {
      sabaq_para: e.sabaq_para, sabaq_from: e.sabaq_from, sabaq_to: e.sabaq_to, sabaq_quality: e.sabaq_quality,
      sabqi_para: e.sabqi_para, sabqi_quality: e.sabqi_quality,
      manzil_paras: e.manzil_paras ?? [], manzil_quality: e.manzil_quality,
      tajweed_notes: e.tajweed_notes,
    };
  }

  const studentList = (students ?? []) as { id: string; name_bn: string; roll: number | null; student_code: string }[];

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/madrasa/daily-sabaq`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> দৈনিক সবক
          </Link>
        }
        title={<>{(section as { classes: { name_bn: string } }).classes.name_bn} — সেকশন {(section as { name: string }).name}</>}
        subtitle={formatDualDate(date, { withWeekday: true, withHijri: true })}
        impact={[{ label: <>ছাত্র · <BanglaDigit value={studentList.length} /></>, tone: "accent" }]}
      />

      {studentList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            এই সেকশনে কোন সক্রিয় শিক্ষার্থী নেই।
          </CardContent>
        </Card>
      ) : (
        <SabaqGrid
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
