"use client";

import { useActionState, useEffect, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addExpenseAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="head_id">হেড</Label>
        <Select name="head_id" required>
          <SelectTrigger id="head_id"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>
            {heads.map((h) => (<SelectItem key={h.id} value={h.id}>{h.name_bn}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">তারিখ</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">amount (৳)</Label>
          <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paid_to">কাকে পরিশোধ</Label>
        <Input id="paid_to" name="paid_to" placeholder="ঐচ্ছিক" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payment_method">পদ্ধতি</Label>
        <Select name="payment_method" defaultValue="cash">
          <SelectTrigger id="payment_method"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">ক্যাশ</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
            <SelectItem value="cheque">চেক</SelectItem>
            <SelectItem value="card">কার্ড</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reference_no">রেফারেন্স</Label>
        <Input id="reference_no" name="reference_no" placeholder="চেক নম্বর / TXN" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">বিবরণ</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "সংরক্ষণ হচ্ছে..." : "রেকর্ড করুন"}
      </Button>
    </form>
  );
}
