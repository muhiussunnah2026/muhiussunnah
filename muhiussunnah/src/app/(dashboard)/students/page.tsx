import Link from "next/link";
import { FileSpreadsheet, UserPlus, Users2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
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

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("students")
    .select(`
      id, student_code, name_bn, name_en, roll, gender, photo_url, status, guardian_phone,
      section_id, sections ( id, name, class_id, classes ( id, name_bn ) )
    `)
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (search.status) query = query.eq("status", search.status);
  if (search.section_id) {
    query = query.eq("section_id", search.section_id);
  } else if (search.class_id) {
    // Filter by class: find all sections under this class, then match any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: classSections } = await (supabase as any)
      .from("sections")
      .select("id")
      .eq("class_id", search.class_id);
    const sectionIds = (classSections ?? []).map((s: { id: string }) => s.id);
    if (sectionIds.length > 0) query = query.in("section_id", sectionIds);
    else query = query.eq("id", "00000000-0000-0000-0000-000000000000"); // no match
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

  const students = (data ?? []) as Array<{
    id: string; student_code: string; name_bn: string; name_en: string | null;
    roll: number | null; gender: string | null; photo_url: string | null; status: string;
    guardian_phone: string | null; section_id: string | null;
    sections: { id: string; name: string; classes: { name_bn: string } } | null;
  }>;

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
  };

  return (
    <>
      <PageHeader
        title="ছাত্র-ছাত্রী ব্যবস্থাপনা"
        subtitle={
          stats.total > 0
            ? `${stats.total.toString()} জনের মধ্যে ${stats.active.toString()} সক্রিয়`
            : "এখনই প্রথম শিক্ষার্থী ভর্তি করুন — ৩০ সেকেন্ডে হয়ে যাবে।"
        }
        impact={[
          { label: <>মোট · <BanglaDigit value={stats.total} /></>, tone: "accent" },
          { label: <>সক্রিয় · <BanglaDigit value={stats.active} /></>, tone: "success" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/students/bulk-import`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileSpreadsheet className="me-1 size-3.5" />
              Excel Import
            </Link>
            <Link
              href={`/students/new`}
              className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
            >
              <UserPlus className="me-1 size-3.5" />
              নতুন ভর্তি
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
          title="🎓 প্রথম শিক্ষার্থী ভর্তি করুন"
          body="একজন ছাত্র যোগ করতে মাত্র ৩০ সেকেন্ড লাগবে। বাল্ক import করলে ১০০+ ছাত্র একসাথে ১ মিনিটে!"
          primaryAction={
            <Link href={`/students/new`} className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
              নতুন ভর্তি
            </Link>
          }
          secondaryAction={
            <Link href={`/students/bulk-import`} className={buttonVariants({ variant: "outline" })}>
              Excel থেকে import
            </Link>
          }
          proTip="Excel template ডাউনলোড করে পূরণ করে upload করলে পুর ো ক্লাসের ডেটা মুহূর্তে ঢুকে যাবে।"
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
