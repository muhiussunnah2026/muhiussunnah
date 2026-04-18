"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addInquiryAction } from "@/server/actions/admission-inquiry";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = { id: string; name_bn: string };

export function AddInquiryForm({ schoolSlug, classes }: { schoolSlug: string; classes: ClassOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addInquiryAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "যোগ হয়েছে");
      formRef.current?.reset();
    } else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="student_name">ছাত্র/ছাত্রীর নাম</Label>
        <Input id="student_name" name="student_name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guardian_name">অভিভাবকের নাম</Label>
        <Input id="guardian_name" name="guardian_name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guardian_phone">অভিভাবকের ফোন *</Label>
        <Input id="guardian_phone" name="guardian_phone" type="tel" required />
      </div>
      {classes.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="class_interested">আগ্রহী ক্লাস</Label>
          <Select name="class_interested">
            <SelectTrigger id="class_interested"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source">সোর্স</Label>
        <Select name="source" defaultValue="walk_in">
          <SelectTrigger id="source"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="walk_in">ওয়াক-ইন</SelectItem>
            <SelectItem value="phone">ফোন</SelectItem>
            <SelectItem value="online">অনলাইন</SelectItem>
            <SelectItem value="referral">রেফারেল</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="followup_date">ফলোআপ ডেট</Label>
        <Input id="followup_date" name="followup_date" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "যোগ হচ্ছে..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
