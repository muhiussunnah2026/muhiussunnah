"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAssignmentAction } from "@/server/actions/lms";

type Section = { id: string; name_bn: string; class_bn: string };
type Subject = { id: string; name_bn: string };

export function AssignmentForm({ schoolSlug, sections, subjects }: { schoolSlug: string; sections: Section[]; subjects: Subject[] }) {
  const [state, action, pending] = useActionState(createAssignmentAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "তৈরি হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>শিরোনাম *</Label>
        <Input name="title" placeholder="যেমন: অধ্যায় ৩ — অনুশীলনী প্রশ্ন" required />
      </div>
      <div>
        <Label>বিবরণ</Label>
        <Textarea name="description" placeholder="কি করতে হবে বিস্তারিত লিখুন" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>শ্রেণি/সেকশন *</Label>
          <select name="section_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">বেছে নিন</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.class_bn} — {s.name_bn}</option>)}
          </select>
        </div>
        <div>
          <Label>বিষয় *</Label>
          <select name="subject_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">বেছে নিন</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name_bn}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>শেষ তারিখ</Label>
          <Input name="due_date" type="datetime-local" />
        </div>
        <div>
          <Label>সর্বোচ্চ মার্কস</Label>
          <Input name="max_marks" type="number" min={0} placeholder="100" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "তৈরি হচ্ছে..." : "অ্যাসাইনমেন্ট তৈরি করুন"}
      </Button>
    </form>
  );
}
