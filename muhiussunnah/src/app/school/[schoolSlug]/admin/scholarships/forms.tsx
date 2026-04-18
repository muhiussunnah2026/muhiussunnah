"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addScholarshipAction, assignScholarshipAction } from "@/server/actions/scholarships";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddScholarshipForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addScholarshipAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">নাম</Label>
        <Input id="name" name="name" required placeholder="যেমন: মেধাবৃত্তি" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">বিবরণ</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount_type">ধরন</Label>
          <Select name="amount_type" defaultValue="fixed">
            <SelectTrigger id="amount_type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem>
              <SelectItem value="percentage">শতকরা (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">amount</Label>
          <Input id="amount" name="amount" type="number" min={0} step="0.01" required />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "যোগ করুন"}
      </Button>
    </form>
  );
}

export function AssignScholarshipForm({ schoolSlug, scholarships, students }: {
  schoolSlug: string;
  scholarships: { id: string; name: string }[];
  students: { id: string; name_bn: string; student_code: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(assignScholarshipAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "প্রদান সম্পন্ন"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scholarship_id">বৃত্তি</Label>
        <Select name="scholarship_id" required>
          <SelectTrigger id="scholarship_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
          <SelectContent>
            {scholarships.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="student_id">ছাত্র</Label>
        <Select name="student_id" required>
          <SelectTrigger id="student_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
          <SelectContent>
            {students.slice(0, 200).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name_bn} ({s.student_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valid_until">মেয়াদ শেষ (ঐচ্ছিক)</Label>
        <Input id="valid_until" name="valid_until" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "বৃত্তি প্রদান"}
      </Button>
    </form>
  );
}
