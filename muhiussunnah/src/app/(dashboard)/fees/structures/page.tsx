import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { FeesSubNav } from "../nav";
import { StructureMatrix } from "./matrix";

export default async function FeeStructuresPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
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

  const t = await getTranslations("fees");

  return (
    <>
      <PageHeader
        title={t("structures_page_title")}
        subtitle={t("structures_page_subtitle")}
        impact={[
          { label: t("structures_impact_hint"), tone: "default" },
        ]}
      />
      <FeesSubNav active="structures" schoolSlug={schoolSlug} />

      <div className="mt-4">
        {classList.length === 0 || headList.length === 0 ? (
          <EmptyState
            title={t("structures_empty_title")}
            body={t("structures_empty_body")}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <StructureMatrix classes={classList} heads={headList} structures={structures} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
