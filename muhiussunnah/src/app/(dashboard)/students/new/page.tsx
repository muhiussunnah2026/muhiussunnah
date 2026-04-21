import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ensureDefaultSections } from "@/lib/schools/self-heal";
import { NewStudentForm } from "./new-student-form";

export default async function NewStudentPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
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

  // Guardian-name suggestions for father/mother inputs. Student-name
  // suggestions were removed — see new-student-form.tsx for rationale.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guardianRes = await (supabase as any)
    .from("student_guardians")
    .select("name_bn, relation, students!inner(school_id)")
    .eq("students.school_id", membership.school_id)
    .limit(300);

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

  const t = await getTranslations("newStudent");

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("breadcrumb_back")}
          </Link>
        }
        title={t("page_title_new")}
        subtitle={t("page_subtitle_new")}
        impact={[
          { label: t("impact_time"), tone: "accent" },
          { label: t("impact_auto_code"), tone: "default" },
        ]}
      />

      <Card>
        <CardContent className="p-5 md:p-6">
          {classList.length > 0 ? (
            <NewStudentForm
              classes={classList}
              years={academicYears}
              fatherSuggestions={[...fatherNames]}
              motherSuggestions={[...motherNames]} schoolSlug={schoolSlug}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-6 text-center">
              <p className="text-base font-semibold mb-2">{t("no_class_title")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("no_class_body")}
              </p>
              <Link
                href={`/classes`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25"
              >
                {t("no_class_cta")}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
