import { getTranslations } from "next-intl/server";
import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddSubjectForm } from "./add-subject-form";

export default async function SubjectsPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const t = await getTranslations("subjects");

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  const [subjectsRes, classesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("subjects")
      .select(`
        id, name_bn, name_en, name_ar, code, full_marks, pass_marks, is_optional, class_id,
        classes ( name_bn, name_en )
      `)
      .eq("school_id", membership.school_id)
      .order("display_order", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn, name_en")
      .eq("school_id", membership.school_id)
      .order("display_order"),
  ]);
  const { data: subjects } = subjectsRes;
  const { data: classes } = classesRes;

  const subjectList = (subjects ?? []) as Array<{
    id: string; name_bn: string; name_en: string | null; name_ar: string | null;
    code: string | null; full_marks: number; pass_marks: number; is_optional: boolean;
    class_id: string | null; classes: { name_bn: string; name_en: string | null } | null;
  }>;

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[{ label: <>{t("tally_total")} · <BanglaDigit value={subjectList.length} /></>, tone: "accent" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {subjectList.length === 0 ? (
            <EmptyState
              icon={<BookOpenText className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
              proTip={t("empty_tip")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_name")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_class")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_code")}</TableHead>
                      <TableHead className="text-right">{t("col_full_marks")}</TableHead>
                      <TableHead className="text-right">{t("col_pass_marks")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_type")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectList.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.name_bn}</div>
                          {s.name_en ? <div className="text-xs text-muted-foreground">{s.name_en}</div> : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {s.classes?.name_bn ?? t("all_classes")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{s.code ?? "—"}</TableCell>
                        <TableCell className="text-right"><BanglaDigit value={s.full_marks} /></TableCell>
                        <TableCell className="text-right"><BanglaDigit value={s.pass_marks} /></TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {s.is_optional ? <span className="rounded-full bg-warning/10 px-2 py-0.5 text-warning">{t("optional_badge")}</span> : <span className="text-muted-foreground">{t("mandatory_label")}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">{t("new_heading")}</h2>
              <AddSubjectForm classes={classes ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
