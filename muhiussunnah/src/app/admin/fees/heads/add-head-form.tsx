"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addFeeHeadAction } from "@/server/actions/fees";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddFeeHeadForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addFeeHeadAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">নাম (বাংলা)</Label>
        <Input id="name_bn" name="name_bn" required placeholder="যেমন: Gym Fee" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">ধরন</Label>
          <Select name="type" defaultValue="general">
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">সাধারণ</SelectItem>
              <SelectItem value="admission">ভর্তি</SelectItem>
              <SelectItem value="session">সেশন</SelectItem>
              <SelectItem value="exam">পরীক্ষা</SelectItem>
              <SelectItem value="transport">পরিবহন</SelectItem>
              <SelectItem value="hostel">হোস্টেল</SelectItem>
              <SelectItem value="canteen">ক্যান্টিন</SelectItem>
              <SelectItem value="other">অন্যান্য</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="frequency">ফ্রিকোয়েন্সি</Label>
          <Select name="frequency">
            <SelectTrigger id="frequency"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">মাসিক</SelectItem>
              <SelectItem value="quarterly">ত্রৈমাসিক</SelectItem>
              <SelectItem value="annual">বার্ষিক</SelectItem>
              <SelectItem value="one_time">একবার</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="default_amount">ডিফল্ট amount (৳)</Label>
        <Input id="default_amount" name="default_amount" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_recurring" /> পুনরাবৃত্তিমূলক (recurring)
      </label>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "যোগ হচ্ছে..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
