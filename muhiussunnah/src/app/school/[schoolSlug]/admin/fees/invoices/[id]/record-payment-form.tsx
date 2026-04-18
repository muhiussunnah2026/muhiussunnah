"use client";

import { useActionState, useEffect } from "react";
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
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(recordCashPaymentAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "সংরক্ষিত");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="invoice_id" value={invoiceId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">পরিশোধিত amount (৳)</Label>
        <Input id="amount" name="amount" type="number" min={0.01} max={maxAmount} step="0.01" defaultValue={maxAmount} required />
        <p className="text-xs text-muted-foreground">সর্বাধিক ৳ {maxAmount.toLocaleString("en-IN")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">পদ্ধতি</Label>
        <Select name="method" defaultValue="cash">
          <SelectTrigger id="method"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">ক্যাশ</SelectItem>
            <SelectItem value="bkash">bKash (হাতে-হাতে)</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
            <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
            <SelectItem value="cheque">চেক</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transaction_id">ট্রান্সঅ্যাকশন ID</Label>
        <Input id="transaction_id" name="transaction_id" placeholder="ঐচ্ছিক" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "সংরক্ষণ হচ্ছে..." : "পেমেন্ট রেকর্ড করুন"}
      </Button>
    </form>
  );
}
