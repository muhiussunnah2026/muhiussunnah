"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addInventoryItemAction, addInventoryMovementAction } from "@/server/actions/operations";

export function AddItemForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("inventory");
  const [state, action, pending] = useActionState(addInventoryItemAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("item_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("item_name_label")}</Label>
        <Input name="name" placeholder={t("item_name_placeholder")} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("item_category_label")}</Label>
          <Input name="category" placeholder={t("item_category_placeholder")} />
        </div>
        <div>
          <Label>{t("item_unit_label")}</Label>
          <Input name="unit" placeholder={t("item_unit_placeholder")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("item_reorder_label")}</Label>
          <Input name="reorder_level" type="number" min={0} placeholder="10" />
        </div>
        <div>
          <Label>{t("item_unit_price_label")}</Label>
          <Input name="unit_price" type="number" min={0} placeholder="0" />
        </div>
      </div>
      <div>
        <Label>{t("item_supplier_label")}</Label>
        <Input name="supplier" placeholder={t("item_supplier_placeholder")} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("item_adding") : t("item_cta")}
      </Button>
    </form>
  );
}

type Item = { id: string; name: string };

export function StockMovementForm({ schoolSlug, items }: { schoolSlug: string; items: Item[] }) {
  const t = useTranslations("inventory");
  const [state, action, pending] = useActionState(addInventoryMovementAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("mv_updated")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("mv_item_label")}</Label>
        <select name="item_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("mv_item_placeholder")}</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
      <div>
        <Label>{t("mv_type_label")}</Label>
        <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="in">{t("mv_type_in")}</option>
          <option value="out">{t("mv_type_out")}</option>
          <option value="adjustment">{t("mv_type_adjustment")}</option>
          <option value="waste">{t("mv_type_waste")}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("mv_qty_label")}</Label>
          <Input name="qty" type="number" min={0.01} step={0.01} placeholder="1" required />
        </div>
        <div>
          <Label>{t("mv_date_label")}</Label>
          <Input name="date" type="date" defaultValue={today} required />
        </div>
      </div>
      <div>
        <Label>{t("mv_notes_label")}</Label>
        <Input name="notes" placeholder={t("mv_notes_placeholder")} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("mv_updating") : t("mv_cta")}
      </Button>
    </form>
  );
}
