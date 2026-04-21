import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("inventory");

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

  const mvTypeLabel = (tp: string) => ({ in: t("mv_in"), out: t("mv_out"), adjustment: t("mv_adjustment"), waste: t("mv_waste"), transfer: t("mv_transfer") }[tp] ?? tp);
  const mvBadgeVariant = (tp: string): "default" | "secondary" | "destructive" | "outline" =>
    tp === "in" ? "default" : tp === "out" ? "secondary" : tp === "waste" ? "destructive" : "outline";

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: t("tally_items", { count: itemList.length }), tone: "default" },
          { label: t("tally_value", { amount: Math.round(totalValue).toLocaleString("en-IN") }), tone: "accent" },
          ...(lowStock.length > 0 ? [{ label: t("tally_low", { count: lowStock.length }), tone: "warning" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {itemList.length === 0 ? (
            <EmptyState
              icon={<Package className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_item")}</TableHead>
                      <TableHead>{t("col_category")}</TableHead>
                      <TableHead className="text-right">{t("col_stock")}</TableHead>
                      <TableHead className="text-right">{t("col_unit_price")}</TableHead>
                      <TableHead>{t("col_status")}</TableHead>
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
                              ? <Badge variant="destructive">{t("status_low")}</Badge>
                              : <Badge variant="secondary">{t("status_normal")}</Badge>}
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
              <h2 className="text-base font-semibold">{t("movements_heading")}</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("col_item")}</TableHead>
                        <TableHead>{t("col_type")}</TableHead>
                        <TableHead className="text-right">{t("col_qty")}</TableHead>
                        <TableHead>{t("col_date")}</TableHead>
                        <TableHead>{t("col_notes")}</TableHead>
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
              <h2 className="mb-4 text-base font-semibold">{t("new_item_heading")}</h2>
              <AddItemForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">{t("stock_update_heading")}</h2>
              <StockMovementForm items={itemList} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
