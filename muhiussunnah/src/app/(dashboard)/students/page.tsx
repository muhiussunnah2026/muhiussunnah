import Link from "next/link";
import { FileSpreadsheet, UserPlus, Users2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ensureDefaultSections } from "@/lib/schools/self-heal";
import { StudentsFilters } from "./filters";
import { StudentsTable } from "./students-table";

type PageProps = {
  searchParams: Promise<{ class_id?: string; section_id?: string; status?: string; q?: string }>;
};

export default async function StudentsListPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  // Self-heal any classes missing sections so the filter shows everything.
  await ensureDefaultSections(membership.school_id);

  // Admin client: requireActiveRole() already authorized the user, and every
  // query below is constrained by school_id — no cross-tenant leak possible.
  // We need admin here because RLS on `sections` blocks nested PostgREST joins
  // from user-session clients, which made class name come back null.
  const supabase = supabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("students")
    .select(`
      id, student_code, name_bn, name_en, roll, gender, photo_url, status, guardian_phone,
      admission_date,
      section_id, class_id,
      sections ( id, name, class_id, classes ( id, name_bn ) )
    `)
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (search.status) query = query.eq("status", search.status);
  if (search.section_id) {
    query = query.eq("section_id", search.section_id);
  } else if (search.class_id) {
    // Filter by class directly on students.class_id (migration 0022).
    // The old path went through sections → section_ids → students and
    // dropped every student with a null section_id (common when a
    // school runs without sections). Those students correctly showed up
    // on the /classes card count but vanished on the students list —
    // because the two reads used different keys.
    query = query.eq("class_id", search.class_id);
  }
  if (search.q) query = query.ilike("name_bn", `%${search.q}%`);

  // Independent queries — built student query + class/section reference list for filter.
  const [dataRes, classesRes] = await Promise.all([
    query,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn, sections(id, name)")
      .eq("school_id", membership.school_id)
      .order("display_order"),
  ]);
  const { data } = dataRes;
  const { data: classes } = classesRes;

  const rawStudents = (data ?? []) as Array<{
    id: string; student_code: string; name_bn: string; name_en: string | null;
    roll: number | null; gender: string | null; photo_url: string | null; status: string;
    guardian_phone: string | null; admission_date: string | null;
    section_id: string | null; class_id: string | null;
    sections: { id: string; name: string; classes: { name_bn: string } } | null;
  }>;

  // Class lookup for students that have class_id but no section (migration
  // 0022 — section is optional). Hydrates s.sections.classes.name_bn so
  // the table doesn't have to special-case two data shapes.
  type ClassRow = { id: string; name_bn: string; sections: { id: string; name: string }[] };
  const classById = new Map<string, ClassRow>();
  for (const c of (classes ?? []) as ClassRow[]) classById.set(c.id, c);

  const students = rawStudents.map((s) => {
    if (s.sections) return s;
    if (!s.class_id) return s;
    const cls = classById.get(s.class_id);
    if (!cls) return s;
    // Synthesize a sections object so existing UI / export paths work.
    // name="" + class.name_bn — the table hides "ক" + "" fallbacks.
    return { ...s, sections: { id: "", name: "", classes: { name_bn: cls.name_bn } } };
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
  };

  const t = await getTranslations("studentsTable");

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={
          stats.total > 0
            ? t("page_subtitle_with_counts", { total: stats.total, active: stats.active })
            : t("page_subtitle_empty")
        }
        impact={[
          { label: <>{t("impact_total")} · <BanglaDigit value={stats.total} /></>, tone: "accent" },
          { label: <>{t("impact_active")} · <BanglaDigit value={stats.active} /></>, tone: "success" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* Excel Import — secondary. Outlined, gentle primary tint on
                hover so it reads as "available but not the primary CTA". */}
            <Link
              href={`/students/bulk-import`}
              className={buttonVariants({
                variant: "outline",
                size: "default",
                className:
                  "h-10 gap-2 rounded-xl border-primary/30 bg-card/60 px-4 font-semibold shadow-sm shadow-primary/5 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/60 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/15",
              })}
            >
              <FileSpreadsheet className="size-4 text-primary" />
              {t("btn_excel_import")}
            </Link>
            {/* New admission — primary CTA. Gradient + lift + glow shadow
                to match the hero buttons elsewhere on the site. */}
            <Link
              href={`/students/new`}
              className={buttonVariants({
                size: "default",
                className:
                  "h-10 gap-2 rounded-xl bg-gradient-primary animate-gradient px-5 font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-primary/40",
              })}
            >
              <UserPlus className="size-4" />
              {t("btn_new_admission")}
            </Link>
          </div>
        }
      />

      <StudentsFilters
        classes={classes ?? []}
        initial={search} schoolSlug={schoolSlug}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={<Users2 className="size-8" />}
          title={t("empty_title")}
          body={t("empty_body")}
          primaryAction={
            <Link href={`/students/new`} className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
              {t("empty_cta_new")}
            </Link>
          }
          secondaryAction={
            <Link href={`/students/bulk-import`} className={buttonVariants({ variant: "outline" })}>
              {t("empty_cta_bulk")}
            </Link>
          }
          proTip={t("empty_pro_tip")}
        />
      ) : (
        <StudentsTable
          students={students}
          schoolSlug={schoolSlug}
          schoolName={membership.school_name_bn}
        />
      )}
    </>
  );
}
