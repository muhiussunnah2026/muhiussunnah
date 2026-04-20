import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddItemForm, StockMovementForm } from "./inventory-forms";

export default async function InventoryPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from("inventory_items")
    .select("id, name, category, unit, stock, reorder_level, unit_price, supplier")
    .eq("school_id", membership.school_id)
    .order("name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentMovements } = await (supabase as any)
    .from("inventory_movements")
    .select("id, type, qty, date, notes, inventory_items ( name, unit )")
    .in("item_id", (items ?? []).map((i: { id: string }) => i.id))
    .order("date", { ascending: false })
    .limit(20);

  type Item = { id: string; name: string; category: string | null; unit: string | null; stock: number; reorder_level: number | null; unit_price: number | null; supplier: string | null };
  const itemList = (items ?? []) as Item[];
  const lowStock = itemList.filter((i) => i.reorder_level !== null && i.stock <= i.reorder_level);
  const totalValue = itemList.reduce((s, i) => s + Number(i.stock) * Number(i.unit_price ?? 0), 0);

  const mvTypeLabel = (t: string) => ({ in: "স্টক ইন", out: "স্টক আউট", adjustment: "সমন্বয়", waste: "নষ্ট", transfer: "ট্রান্সফার" }[t] ?? t);
  const mvBadgeVariant = (t: string): "default" | "secondary" | "destructive" | "outline" =>
    t === "in" ? "default" : t === "out" ? "secondary" : t === "waste" ? "destructive" : "outline";

  return (
    <>
      <PageHeader
        title="ইনভেন্টরি"
        subtitle="স্টেশনারি, আসবাব ও অন্যান্য সম্পদের স্টক ব্যবস্থাপনা।"
        impact={[
          { label: <><BanglaDigit value={itemList.length} /> আইটেম</>, tone: "default" },
          { label: <>মূল্য · ৳ <BanglaDigit value={Math.round(totalValue).toLocaleString("en-IN")} /></>, tone: "accent" },
          ...(lowStock.length > 0 ? [{ label: <><BanglaDigit value={lowStock.length} /> কম স্টক</>, tone: "warning" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {itemList.length === 0 ? (
            <EmptyState
              icon={<Package className="size-8" />}
              title="কোন আইটেম নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম আইটেম যোগ করুন।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>আইটেম</TableHead>
                      <TableHead>বিভাগ</TableHead>
                      <TableHead className="text-right">স্টক</TableHead>
                      <TableHead className="text-right">একক মূল্য</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemList.map((i) => {
                      const isLow = i.reorder_level !== null && i.stock <= i.reorder_level;
                      return (
                        <TableRow key={i.id}>
                          <TableCell>
                            <div className="font-medium">{i.name}</div>
                            {i.supplier && <div className="text-xs text-muted-foreground">{i.supplier}</div>}
                          </TableCell>
                          <TableCell className="text-xs">{i.category ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <BanglaDigit value={Number(i.stock)} /> {i.unit ?? ""}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {i.unit_price ? <>৳ <BanglaDigit value={Number(i.unit_price)} /></> : "—"}
                          </TableCell>
                          <TableCell>
                            {isLow
                              ? <Badge variant="destructive">কম স্টক</Badge>
                              : <Badge variant="secondary">স্বাভাবিক</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {(recentMovements ?? []).length > 0 && (
            <>
              <h2 className="text-base font-semibold">সাম্প্রতিক লেনদেন</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>আইটেম</TableHead>
                        <TableHead>ধরন</TableHead>
                        <TableHead className="text-right">পরিমাণ</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>নোট</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentMovements as Array<{ id: string; type: string; qty: number; date: string; notes: string | null; inventory_items: { name: string; unit: string | null } | null }>).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm">{m.inventory_items?.name ?? "—"}</TableCell>
                          <TableCell><Badge variant={mvBadgeVariant(m.type)}>{mvTypeLabel(m.type)}</Badge></TableCell>
                          <TableCell className="text-right"><BanglaDigit value={Number(m.qty)} /> {m.inventory_items?.unit ?? ""}</TableCell>
                          <TableCell className="text-xs">{m.date}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{m.notes ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">নতুন আইটেম</h2>
              <AddItemForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">স্টক আপডেট</h2>
              <StockMovementForm items={itemList} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
