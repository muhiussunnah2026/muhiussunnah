import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ensureDefaultSections } from "@/lib/schools/self-heal";
import { AddClassForm } from "./add-class-form";
import { ClassSectionList } from "./class-section-list";

export default async function ClassesPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  // Heal legacy classes so the dropdowns on student pages always work.
  await ensureDefaultSections(membership.school_id);

  // Admin client: requireActiveRole() already authorized the user, all queries
  // scoped by school_id. Needed because RLS on `sections` blocks the nested
  // join in the classes query — without this, per-class student counts come
  // back as zero because the sections list on each class is empty.
  const supabase = supabaseAdmin();
  // Independent — all three keyed off school_id.
  const [classesRes, branchesRes, studentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select(`
        id, name_bn, name_en, stream, display_order, branch_id,
        sections ( id, name, capacity, room )
      `)
      .eq("school_id", membership.school_id)
      .order("display_order", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("school_branches")
      .select("id, name")
      .eq("school_id", membership.school_id)
      .order("is_primary", { ascending: false }),
    // Pull all active students with just the section_id — we'll
    // aggregate into per-class + per-section counts client-side so the
    // card can show "15 ছাত্র · 3 সেকশন" at a glance.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, section_id")
      .eq("school_id", membership.school_id)
      .eq("status", "active")
      .limit(10000),
  ]);
  const { data: classes } = classesRes;
  const { data: branches } = branchesRes;
  const { data: students } = studentsRes;

  const classList = (classes ?? []) as {
    id: string;
    name_bn: string;
    name_en: string | null;
    stream: string;
    display_order: number;
    branch_id: string | null;
    sections: { id: string; name: string; capacity: number | null; room: string | null }[];
  }[];

  // Build { sectionId → studentCount } and { classId → totalStudentCount }
  const sectionCounts = new Map<string, number>();
  for (const s of (students ?? []) as { id: string; section_id: string | null }[]) {
    if (!s.section_id) continue;
    sectionCounts.set(s.section_id, (sectionCounts.get(s.section_id) ?? 0) + 1);
  }
  const classStudentCounts: Record<string, number> = {};
  const sectionStudentCounts: Record<string, number> = {};
  for (const c of classList) {
    let classTotal = 0;
    for (const sec of c.sections) {
      const n = sectionCounts.get(sec.id) ?? 0;
      sectionStudentCounts[sec.id] = n;
      classTotal += n;
    }
    classStudentCounts[c.id] = classTotal;
  }

  return (
    <>
      <PageHeader
        title="শ্রেণি ব্যবস্থাপনা"
        subtitle="আপনার স্কুলের একাডেমিক কাঠামো সেট করুন — ক্লাস, সেকশন, স্ট্রিম। শিক্ষার্থী ভর্তির আগে এগুলো তৈরি করতে হবে।"
        impact={[
          { label: <>মোট ক্লাস · <BanglaDigit value={classList.length} /></>, tone: "accent" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-4">
          {classList.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" />}
              title="এখনও কোন ক্লাস নেই"
              body="আপনার স্কুলের যেকোন একটা ক্লাস দিয়ে শুরু করুন। পরে সহজেই সেকশন, বিষয় যোগ করতে পারবেন।"
              proTip="Play / Nursery / KG থেকে শুরু করে Class 10 পর্যন্ত সব একসাথে যোগ করে ফেলুন, সময় বাঁচবে।"
            />
          ) : (
            <ClassSectionList
              classes={classList}
              schoolSlug={schoolSlug}
              classStudentCounts={classStudentCounts}
              sectionStudentCounts={sectionStudentCounts}
            />
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন ক্লাস</h2>
              <AddClassForm branches={branches ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
