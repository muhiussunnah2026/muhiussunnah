import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddBranchForm } from "./add-branch-form";
import { BranchList } from "./branch-list";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function BranchesPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("school_branches")
    .select("id, name, address, phone, is_primary")
    .eq("school_id", membership.school_id)
    .order("is_primary", { ascending: false })
    .order("name");

  const branches = (data ?? []) as { id: string; name: string; address: string | null; phone: string | null; is_primary: boolean }[];

  return (
    <>
      <PageHeader
        title="শাখা ব্যবস্থাপনা"
        subtitle="একাধিক ক্যাম্পাস থাকলে প্রতিটি শাখা আলাদা করে যোগ করুন। প্রধান শাখা ফোল্ডার স্বয়ংক্রিয়ভাবে তৈরি হয়ে গেছে।"
        impact={[{ label: <>মোট শাখা · <BanglaDigit value={branches.length} /></>, tone: "accent" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {branches.length === 0 ? (
            <EmptyState
              icon={<Building2 className="size-8" />}
              title="কোন শাখা পাওয়া যায়নি"
              body="শাখা তৈরি করুন ডান পাশের ফর্ম থেকে।"
            />
          ) : (
            <BranchList schoolSlug={schoolSlug} branches={branches} />
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন শাখা</h2>
              <AddBranchForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
