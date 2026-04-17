"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scheduleOnlineClassAction } from "@/server/actions/lms";

type Section = { id: string; name_bn: string; class_bn: string };
type Subject = { id: string; name_bn: string };

export function ScheduleClassForm({ schoolSlug, sections, subjects }: { schoolSlug: string; sections: Section[]; subjects: Subject[] }) {
  const [state, action, pending] = useActionState(scheduleOnlineClassAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "শিডিউল হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>শিরোনাম</Label>
        <Input name="title" placeholder="যেমন: গণিত ক্লাস — অধ্যায় ২" />
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
          <Label>শুরুর সময় *</Label>
          <Input name="scheduled_at" type="datetime-local" required />
        </div>
        <div>
          <Label>সময়কাল (মিনিট)</Label>
          <Input name="duration_mins" type="number" min={1} defaultValue={60} />
        </div>
      </div>
      <div>
        <Label>মিট লিংক *</Label>
        <Input name="meet_url" type="url" placeholder="https://meet.google.com/..." required />
      </div>
      <div>
        <Label>প্রোভাইডার</Label>
        <select name="provider" defaultValue="zoom" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="zoom">Zoom</option>
          <option value="google_meet">Google Meet</option>
          <option value="teams">Microsoft Teams</option>
          <option value="other">অন্যান্য</option>
        </select>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "শিডিউল হচ্ছে..." : "ক্লাস শিডিউল করুন"}
      </Button>
    </form>
  );
}
