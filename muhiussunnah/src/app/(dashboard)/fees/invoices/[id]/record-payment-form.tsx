"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordCashPaymentAction } from "@/server/actions/fees";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; invoiceId: string; maxAmount: number };

export function RecordPaymentForm({ schoolSlug, invoiceId, maxAmount }: Props) {
  const t = useTranslations("fees");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(recordCashPaymentAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("record_payment_saved"));
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="invoice_id" value={invoiceId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">{t("record_payment_amount")}</Label>
        <Input id="amount" name="amount" type="number" min={0.01} max={maxAmount} step="0.01" defaultValue={maxAmount} required />
        <p className="text-xs text-muted-foreground">
          {t("record_payment_max", { max: maxAmount.toLocaleString("en-IN") })}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">{t("record_payment_method")}</Label>
        <Select name="method" defaultValue="cash">
          <SelectTrigger id="method">
            <SelectValue>
              {(v: unknown) => {
                const key = typeof v === "string" ? v : "cash";
                const labelKey = key === "bkash" ? "method_bkash_manual" : `method_${key}`;
                try { return t(labelKey); } catch { return key; }
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">{t("method_cash")}</SelectItem>
            <SelectItem value="bkash">{t("method_bkash_manual")}</SelectItem>
            <SelectItem value="nagad">{t("method_nagad")}</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
            <SelectItem value="bank_transfer">{t("method_bank_transfer")}</SelectItem>
            <SelectItem value="cheque">{t("method_cheque")}</SelectItem>
            <SelectItem value="other">{t("method_other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transaction_id">{t("record_payment_txn")}</Label>
        <Input id="transaction_id" name="transaction_id" placeholder={t("record_payment_txn_placeholder")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">{t("record_payment_notes")}</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("record_payment_pending") : t("record_payment_submit")}
      </Button>
    </form>
  );
}
