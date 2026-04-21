"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExpenseAction } from "@/server/actions/expenses";
import type { ActionResult } from "@/server/actions/_helpers";

type Head = { id: string; name_bn: string; category: string };
type Props = { schoolSlug: string; heads: Head[] };

export function AddExpenseForm({ schoolSlug, heads }: Props) {
  const t = useTranslations("expenses");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addExpenseAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("form_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="head_id">{t("form_head")}</Label>
        <Select name="head_id" required>
          <SelectTrigger id="head_id"><SelectValue placeholder={t("form_head_placeholder")} /></SelectTrigger>
          <SelectContent>
            {heads.map((h) => (<SelectItem key={h.id} value={h.id}>{h.name_bn}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">{t("form_date")}</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">{t("form_amount")}</Label>
          <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paid_to">{t("form_paid_to")}</Label>
        <Input id="paid_to" name="paid_to" placeholder={t("form_paid_to_placeholder")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payment_method">{t("form_method")}</Label>
        <Select name="payment_method" defaultValue="cash">
          <SelectTrigger id="payment_method">
            <SelectValue>
              {(v: unknown) => {
                const k = typeof v === "string" ? v : "cash";
                try { return t(`method_${k}`); } catch { return k; }
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">{t("method_cash")}</SelectItem>
            <SelectItem value="bkash">{t("method_bkash")}</SelectItem>
            <SelectItem value="nagad">{t("method_nagad")}</SelectItem>
            <SelectItem value="bank_transfer">{t("method_bank_transfer")}</SelectItem>
            <SelectItem value="cheque">{t("method_cheque")}</SelectItem>
            <SelectItem value="card">{t("method_card")}</SelectItem>
            <SelectItem value="other">{t("method_other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reference_no">{t("form_reference")}</Label>
        <Input id="reference_no" name="reference_no" placeholder={t("form_reference_placeholder")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t("form_description")}</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("form_pending") : t("form_submit")}
      </Button>
    </form>
  );
}
