import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ensureDefaultSections } from "@/lib/schools/self-heal";
import { NewStudentForm } from "./new-student-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function NewStudentPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  await ensureDefaultSections(membership.school_id);

  const supabase = await supabaseServer();

  // Fetch classes + years in parallel — they're independent queries.
  const [classesRes, yearsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn, name_en, display_order, sections(id, name)")
      .eq("school_id", membership.school_id)
      .order("display_order", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("academic_years")
      .select("id, name, is_active")
      .eq("school_id", membership.school_id)
      .order("start_date", { ascending: false }),
  ]);
  const classes = classesRes.data;
  const years = yearsRes.data;

  // Existing student + guardian names — fuel for the autocomplete datalists.
  // Run both queries in parallel and cap at 150 rows each; that's plenty of
  // suggestions for any realistic school and keeps the page snappy.
  const [existingRes, guardianRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("name_bn, name_en")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false })
      .limit(150),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("student_guardians")
      .select("name_bn, relation, students!inner(school_id)")
      .eq("students.school_id", membership.school_id)
      .limit(300),
  ]);

  const nameSetBn = new Set<string>();
  const nameSetEn = new Set<string>();
  for (const row of (existingRes.data ?? []) as { name_bn: string | null; name_en: string | null }[]) {
    if (row.name_bn) nameSetBn.add(row.name_bn);
    if (row.name_en) nameSetEn.add(row.name_en);
  }

  const fatherNames = new Set<string>();
  const motherNames = new Set<string>();
  for (const g of (guardianRes.data ?? []) as { name_bn: string | null; relation: string | null }[]) {
    if (!g.name_bn) continue;
    if (g.relation === "mother") motherNames.add(g.name_bn);
    else fatherNames.add(g.name_bn);
  }

  const classList = (classes ?? []) as Array<{
    id: string;
    name_bn: string;
    name_en: string | null;
    display_order: number;
    sections: { id: string; name: string }[];
  }>;

  const academicYears = (years ?? []) as Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> ছাত্র তালিকা
          </Link>
        }
        title="নতুন শিক্ষার্থী ভর্তি"
        subtitle="ফর্ম পূরণ করতে প্রায় ২ মিনিট লাগবে। পরে সকল তথ্য edit করা যাবে।"
        impact={[
          { label: "⏱️ ~২ মিনিট", tone: "accent" },
          { label: "💾 ছাত্র কোড স্বয়ংক্রিয়ভাবে তৈরি হবে", tone: "default" },
        ]}
      />

      <Card>
        <CardContent className="p-5 md:p-6">
          {classList.length > 0 ? (
            <NewStudentForm
              schoolSlug={schoolSlug}
              classes={classList}
              years={academicYears}
              nameSuggestionsBn={[...nameSetBn]}
              nameSuggestionsEn={[...nameSetEn]}
              fatherSuggestions={[...fatherNames]}
              motherSuggestions={[...motherNames]}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-6 text-center">
              <p className="text-base font-semibold mb-2">আগে ক্লাস যোগ করুন</p>
              <p className="text-sm text-muted-foreground mb-4">
                ছাত্র ভর্তি করতে হলে কমপক্ষে একটি ক্লাস প্রয়োজন। সেকশন ঐচ্ছিক।
              </p>
              <Link
                href={`/school/${schoolSlug}/admin/classes`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25"
              >
                ক্লাস সেটআপে যান →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
