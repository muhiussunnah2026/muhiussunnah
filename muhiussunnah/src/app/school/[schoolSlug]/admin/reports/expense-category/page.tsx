import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<{ year?: string }>;
};

export default async function ExpenseCategoryPage({ params, searchParams }: PageProps) {
  const { schoolSlug } = await params;
  const search = await searchParams;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

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

  // Group by category first, then by head
  const catMap = new Map<string, Map<string, number>>();
  for (const e of list) {
    const cat = e.expense_heads?.category ?? "অন্যান্য";
    const head = e.expense_heads?.name_bn ?? "অজানা";
    if (!catMap.has(cat)) catMap.set(cat, new Map());
    const headMap = catMap.get(cat)!;
    headMap.set(head, (headMap.get(head) ?? 0) + Number(e.amount));
  }

  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title={<>খরচ ক্যাটাগরি রিপোর্ট — <BanglaDigit value={year} /></>}
        subtitle="হেড ও ক্যাটাগরি অনুযায়ী বার্ষিক খরচের ভাঙন।"
        impact={[
          { label: <>মোট · ৳ <BanglaDigit value={total.toLocaleString("en-IN")} /></>, tone: "warning" },
          { label: <><BanglaDigit value={catMap.size} /> ক্যাটাগরি</>, tone: "default" },
        ]}
      />

      {catMap.size === 0 ? (
        <p className="text-muted-foreground text-sm">এই বছরে কোন খরচ নেই।</p>
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
