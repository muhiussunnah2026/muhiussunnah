import { CoinsIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddFeeHeadForm } from "./add-head-form";
import { UpdateAmountForm } from "./update-amount-form";
import { FeesSubNav } from "../nav";

export default async function FeeHeadsPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("fee_heads")
    .select("id, name_bn, name_en, type, default_amount, frequency, is_recurring, display_order")
    .eq("school_id", membership.school_id)
    .order("display_order", { ascending: true });

  const heads = (data ?? []) as Array<{
    id: string; name_bn: string; name_en: string | null; type: string;
    default_amount: number; frequency: string | null; is_recurring: boolean; display_order: number;
  }>;

  const t = await getTranslations("fees");
  const typeText = (type: string) => {
    try { return t(`head_type_${type}`); } catch { return type; }
  };
  const freqText = (freq: string) => {
    try { return t(`freq_${freq}`); } catch { return freq; }
  };

  return (
    <>
      <PageHeader
        title={t("heads_page_title")}
        subtitle={t("heads_page_subtitle")}
        impact={[{ label: <>{t("heads_impact_total")} · <BanglaDigit value={heads.length} /></>, tone: "accent" }]}
      />
      <FeesSubNav active="heads" schoolSlug={schoolSlug} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("heads_col_name")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("heads_col_type")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("heads_col_frequency")}</TableHead>
                  <TableHead className="text-right">{t("heads_col_default_amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heads.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="font-medium">{h.name_bn}</div>
                      {h.name_en ? <div className="text-xs text-muted-foreground">{h.name_en}</div> : null}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      <span className="rounded-full bg-muted px-2 py-0.5">{typeText(h.type)}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {h.frequency ? freqText(h.frequency) : "—"}
                    </TableCell>
                    <TableCell>
                      <UpdateAmountForm id={h.id} defaultAmount={Number(h.default_amount)} schoolSlug={schoolSlug} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <CoinsIcon className="size-4" /> {t("heads_new_title")}
              </h2>
              <AddFeeHeadForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
