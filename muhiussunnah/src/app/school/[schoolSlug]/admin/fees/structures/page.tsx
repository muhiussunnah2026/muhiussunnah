import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { FeesSubNav } from "../nav";
import { StructureMatrix } from "./matrix";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function FeeStructuresPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();

  // Independent — all three keyed off school_id.
  const [classesRes, headsRes, structuresRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn")
      .eq("school_id", membership.school_id)
      .order("display_order"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("fee_heads")
      .select("id, name_bn, default_amount, frequency")
      .eq("school_id", membership.school_id)
      .eq("is_active", true)
      .in("frequency", ["monthly", "quarterly", "annual"])
      .order("display_order"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("fee_structures")
      .select("id, class_id, fee_head_id, amount, frequency")
      .eq("school_id", membership.school_id),
  ]);
  const { data: classes } = classesRes;
  const { data: heads } = headsRes;
  const { data: existingStructures } = structuresRes;

  const classList = (classes ?? []) as { id: string; name_bn: string }[];
  const headList = (heads ?? []) as { id: string; name_bn: string; default_amount: number; frequency: string | null }[];
  const structures = (existingStructures ?? []) as { id: string; class_id: string; fee_head_id: string; amount: number; frequency: string }[];

  return (
    <>
      <PageHeader
        title="ফি কাঠামো"
        subtitle="প্রতিটি শ্রেণির জন্য প্রতিটি ফি হেডের amount ও ফ্রিকোয়েন্সি সেট করুন। এই amounts মাসিক invoice generation-এ ব্যবহৃত হবে।"
        impact={[
          { label: "💡 শুধু monthly/quarterly/annual heads দেখানো হচ্ছে", tone: "default" },
        ]}
      />
      <FeesSubNav schoolSlug={schoolSlug} active="structures" />

      <div className="mt-4">
        {classList.length === 0 || headList.length === 0 ? (
          <EmptyState
            title="আগে ক্লাস + ফি হেড সেট করুন"
            body="ফি কাঠামো তৈরি করতে কমপক্ষে একটি ক্লাস ও একটি ফি হেড দরকার।"
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <StructureMatrix schoolSlug={schoolSlug} classes={classList} heads={headList} structures={structures} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
