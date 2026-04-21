import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export default async function StudentEnrollmentPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, gender, is_active, sections ( name_bn, classes ( name_bn, display_order ) )")
    .eq("school_id", membership.school_id);

  type Student = { id: string; gender: string | null; is_active: boolean; sections: { name_bn: string; classes: { name_bn: string; display_order: number } } | null };
  const list = (students ?? []) as Student[];

  const t = await getTranslations("reports");
  const noClass = t("se_no_class");

  const active = list.filter((s) => s.is_active);
  const classMap = new Map<string, { class_bn: string; order: number; total: number; boys: number; girls: number; inactive: number }>();

  for (const s of list) {
    const key = s.sections?.classes?.name_bn ?? noClass;
    const order = s.sections?.classes?.display_order ?? 99;
    const existing = classMap.get(key) ?? { class_bn: key, order, total: 0, boys: 0, girls: 0, inactive: 0 };
    if (s.is_active) {
      existing.total++;
      if (s.gender === "male") existing.boys++;
      else if (s.gender === "female") existing.girls++;
    } else {
      existing.inactive++;
    }
    classMap.set(key, existing);
  }

  const rows = Array.from(classMap.values()).sort((a, b) => a.order - b.order);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("index_title")}
          </Link>
        }
        title={t("se_title")}
        subtitle={t("se_subtitle")}
        impact={[
          { label: <>{t("se_impact_total_active")} · <BanglaDigit value={active.length} /></>, tone: "success" },
          { label: <>{t("se_impact_male")} · <BanglaDigit value={active.filter((s) => s.gender === "male").length} /></>, tone: "accent" },
          { label: <>{t("se_impact_female")} · <BanglaDigit value={active.filter((s) => s.gender === "female").length} /></>, tone: "accent" },
          { label: <>{t("se_impact_dropped")} · <BanglaDigit value={list.filter((s) => !s.is_active).length} /></>, tone: "default" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common_col_class")}</TableHead>
                <TableHead className="text-right">{t("se_col_total_active")}</TableHead>
                <TableHead className="text-right">{t("se_col_male")}</TableHead>
                <TableHead className="text-right">{t("se_col_female")}</TableHead>
                <TableHead className="text-right">{t("se_col_dropped")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.class_bn}>
                  <TableCell className="font-medium">{r.class_bn}</TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.total} /></TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.boys} /></TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.girls} /></TableCell>
                  <TableCell className="text-right text-muted-foreground"><BanglaDigit value={r.inactive} /></TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>{t("se_row_total")}</TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.total, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.boys, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.girls, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.inactive, 0)} /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
