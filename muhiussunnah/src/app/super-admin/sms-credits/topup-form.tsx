"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { smsTopupAction } from "@/server/actions/messaging";
import type { ActionResult } from "@/server/actions/_helpers";

type SchoolOption = { id: string; name: string; slug: string };

export function TopupForm({ schools }: { schools: SchoolOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(smsTopupAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "Topup সফল"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="school_id">স্কুল</Label>
        <Select name="school_id" required>
          <SelectTrigger id="school_id"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>
            {schools.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount_bdt">amount (৳)</Label>
        <Input id="amount_bdt" name="amount_bdt" type="number" min={1} step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">পদ্ধতি</Label>
        <Select name="method" defaultValue="manual">
          <SelectTrigger id="method"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="free">Free (trial)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">নোট</Label>
        <Textarea id="note" name="note" rows={2} placeholder="Invoice #, রেফারেন্স..." />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "Topup হচ্ছে..." : "Topup করুন"}
      </Button>
    </form>
  );
}
