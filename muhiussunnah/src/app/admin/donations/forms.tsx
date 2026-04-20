"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCampaignAction, addDonationAction } from "@/server/actions/donations";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddCampaignForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addCampaignAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">শিরোনাম</Label>
        <Input id="title" name="title" required placeholder="যেমন: মসজিদ নির্মাণ ফান্ড" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">বিবরণ</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target_amount">লক্ষ্যমাত্রা (৳)</Label>
        <Input id="target_amount" name="target_amount" type="number" min={0} step="0.01" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">শুরু</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">শেষ</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "ক্যাম্পেইন তৈরি"}
      </Button>
    </form>
  );
}

export function AddDonationForm({ schoolSlug, campaigns }: { schoolSlug: string; campaigns: { id: string; title: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addDonationAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "গৃহীত হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      {campaigns.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campaign_id">ক্যাম্পেইন</Label>
          <Select name="campaign_id">
            <SelectTrigger id="campaign_id"><SelectValue placeholder="সাধারণ (ক্যাম্পেইন ছাড়া)" /></SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="donor_name">দাতার নাম</Label>
        <Input id="donor_name" name="donor_name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="donor_phone">ফোন</Label>
        <Input id="donor_phone" name="donor_phone" type="tel" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">amount (৳) *</Label>
        <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">পদ্ধতি</Label>
        <Select name="method" defaultValue="cash">
          <SelectTrigger id="method"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">ক্যাশ</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
            <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
            <SelectItem value="cheque">চেক</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_anonymous" /> নামহীন দাতা
      </label>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "চাঁদা গ্রহণ"}
      </Button>
    </form>
  );
}
