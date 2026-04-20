import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
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

  const supabase = await supabaseServer();
  // Independent — both keyed off school_id.
  const [classesRes, branchesRes] = await Promise.all([
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
  ]);
  const { data: classes } = classesRes;
  const { data: branches } = branchesRes;

  const classList = (classes ?? []) as {
    id: string;
    name_bn: string;
    name_en: string | null;
    stream: string;
    display_order: number;
    branch_id: string | null;
    sections: { id: string; name: string; capacity: number | null; room: string | null }[];
  }[];

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
            <ClassSectionList classes={classList} schoolSlug={schoolSlug} />
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
