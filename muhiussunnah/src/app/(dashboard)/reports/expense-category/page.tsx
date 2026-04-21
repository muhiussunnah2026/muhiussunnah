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

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function ExpenseCategoryPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const year = Number(search.year ?? new Date().getFullYear());

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: expenses } = await (supabase as any)
    .from("expenses")
    .select("amount, expense_heads ( name_bn, category )")
    .eq("school_id", membership.school_id)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`);

  type Expense = { amount: number; expense_heads: { name_bn: string; category: string } | null };
  const list = (expenses ?? []) as Expense[];

  const t = await getTranslations("reports");
  const defaultCat = t("ec_default_cat");
  const unknownHead = t("ec_unknown_head");

  // Group by category first, then by head
  const catMap = new Map<string, Map<string, number>>();
  for (const e of list) {
    const cat = e.expense_heads?.category ?? defaultCat;
    const head = e.expense_heads?.name_bn ?? unknownHead;
    if (!catMap.has(cat)) catMap.set(cat, new Map());
    const headMap = catMap.get(cat)!;
    headMap.set(head, (headMap.get(head) ?? 0) + Number(e.amount));
  }

  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("index_title")}
          </Link>
        }
        title={<>{t("ec_title")} <BanglaDigit value={year} /></>}
        subtitle={t("ec_subtitle")}
        impact={[
          { label: <>{t("ec_total")} · ৳ <BanglaDigit value={total.toLocaleString("en-IN")} /></>, tone: "warning" },
          { label: <><BanglaDigit value={catMap.size} /> {t("ec_categories_suffix")}</>, tone: "default" },
        ]}
      />

      {catMap.size === 0 ? (
        <p className="text-muted-foreground text-sm">{t("ec_empty")}</p>
      ) : (
        <div className="space-y-4">
          {Array.from(catMap.entries()).map(([cat, headMap]) => {
            const catTotal = Array.from(headMap.values()).reduce((s, v) => s + v, 0);
            return (
              <Card key={cat}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold">{cat}</h3>
                    <span className="text-sm font-medium">৳ <BanglaDigit value={catTotal.toLocaleString("en-IN")} /></span>
                  </div>
                  <Table>
                    <TableBody>
                      {Array.from(headMap.entries()).sort((a, b) => b[1] - a[1]).map(([head, amount]) => (
                        <TableRow key={head}>
                          <TableCell className="text-sm">{head}</TableCell>
                          <TableCell className="text-right">৳ <BanglaDigit value={amount.toLocaleString("en-IN")} /></TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            <BanglaDigit value={Math.round((amount / total) * 100)} />%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
