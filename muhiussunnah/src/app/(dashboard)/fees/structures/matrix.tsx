"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertFeeStructureAction } from "@/server/actions/fees";

type ClassRow = { id: string; name_bn: string };
type HeadRow = { id: string; name_bn: string; default_amount: number; frequency: string | null };
type Structure = { id: string; class_id: string; fee_head_id: string; amount: number; frequency: string };

type Props = { schoolSlug: string; classes: ClassRow[]; heads: HeadRow[]; structures: Structure[] };

type Cell = { amount: string; frequency: string };

export function StructureMatrix({ schoolSlug, classes, heads, structures }: Props) {
  const t = useTranslations("fees");
  const [cells, setCells] = useState<Record<string, Cell>>(() => {
    const out: Record<string, Cell> = {};
    for (const s of structures) {
      out[`${s.class_id}|${s.fee_head_id}`] = {
        amount: String(s.amount),
        frequency: s.frequency,
      };
    }
    return out;
  });
  const [pending, startTransition] = useTransition();

  function cellKey(classId: string, headId: string) { return `${classId}|${headId}`; }

  function setCell(classId: string, headId: string, patch: Partial<Cell>) {
    setCells((c) => ({
      ...c,
      [cellKey(classId, headId)]: {
        amount: patch.amount ?? c[cellKey(classId, headId)]?.amount ?? "",
        frequency: patch.frequency ?? c[cellKey(classId, headId)]?.frequency ?? "monthly",
      },
    }));
  }

  function save(classId: string, headId: string) {
    const cell = cells[cellKey(classId, headId)];
    if (!cell || !cell.amount) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("schoolSlug", schoolSlug);
      fd.set("class_id", classId);
      fd.set("fee_head_id", headId);
      fd.set("amount", cell.amount);
      fd.set("frequency", cell.frequency || "monthly");
      const res = await upsertFeeStructureAction(null, fd);
      if (res.ok) toast.success(res.message ?? t("structures_saved"));
      else toast.error(res.error);
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="sticky left-0 z-10 bg-muted/50 p-3 text-left">{t("structures_col_class")}</th>
            {heads.map((h) => (
              <th key={h.id} className="p-3 text-left whitespace-nowrap min-w-44">
                <div>{h.name_bn}</div>
                <div className="text-xs font-normal text-muted-foreground">{t("structures_default_prefix")} {h.default_amount}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id} className="border-t border-border/60">
              <td className="sticky left-0 z-10 bg-background p-3 font-medium whitespace-nowrap">{c.name_bn}</td>
              {heads.map((h) => {
                const key = cellKey(c.id, h.id);
                const cell = cells[key];
                const original = structures.find((s) => s.class_id === c.id && s.fee_head_id === h.id);
                const changed = cell && (
                  (original?.amount ?? 0).toString() !== cell.amount ||
                  original?.frequency !== cell.frequency
                );
                return (
                  <td key={h.id} className="p-2">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="—"
                        value={cell?.amount ?? ""}
                        onChange={(e) => setCell(c.id, h.id, { amount: e.target.value })}
                        className="h-8 w-24"
                      />
                      <Select
                        value={cell?.frequency ?? "monthly"}
                        onValueChange={(v: string | null) => v && setCell(c.id, h.id, { frequency: v })}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t("freq_monthly")}</SelectItem>
                          <SelectItem value="quarterly">{t("freq_quarterly_short")}</SelectItem>
                          <SelectItem value="annual">{t("freq_annual")}</SelectItem>
                          <SelectItem value="one_time">{t("freq_one_time")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {changed ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          disabled={pending}
                          onClick={() => save(c.id, h.id)}
                          aria-label="Save"
                          className="bg-gradient-primary text-white"
                        >
                          <Check className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
