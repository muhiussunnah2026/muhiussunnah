"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHostelAction, addRoomAction, allocateHostelAction } from "@/server/actions/operations";

export function AddHostelForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState(addHostelAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "হোস্টেল যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>হোস্টেলের নাম *</Label>
        <Input name="name" placeholder="যেমন: ছাত্র আবাসিক ভবন ক" required />
      </div>
      <div>
        <Label>ধরন</Label>
        <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="boys">ছেলেদের</option>
          <option value="girls">মেয়েদের</option>
          <option value="mixed">মিশ্র</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>তত্ত্বাবধায়ক</Label>
          <Input name="warden_name" placeholder="নাম" />
        </div>
        <div>
          <Label>মোবাইল</Label>
          <Input name="warden_phone" placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div>
        <Label>মোট ধারণক্ষমতা</Label>
        <Input name="capacity" type="number" min={1} placeholder="100" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "হোস্টেল যোগ করুন"}
      </Button>
    </form>
  );
}

type Hostel = { id: string; name: string };

export function AddRoomForm({ schoolSlug, hostels }: { schoolSlug: string; hostels: Hostel[] }) {
  const [state, action, pending] = useActionState(addRoomAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "রুম যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>হোস্টেল *</Label>
        <select name="hostel_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">বেছে নিন</option>
          {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>রুম নম্বর *</Label>
          <Input name="room_no" placeholder="101" required />
        </div>
        <div>
          <Label>ধারণক্ষমতা</Label>
          <Input name="capacity" type="number" min={1} defaultValue={4} />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "রুম যোগ করুন"}
      </Button>
    </form>
  );
}

type Room = { id: string; room_no: string; hostel_name: string };
type Student = { id: string; name_bn: string | null; name_en: string | null };

export function AllocateForm({ schoolSlug, rooms, students }: { schoolSlug: string; rooms: Room[]; students: Student[] }) {
  const [state, action, pending] = useActionState(allocateHostelAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "বরাদ্দ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="from_date" value={new Date().toISOString().split("T")[0]} />
      <div>
        <Label>রুম *</Label>
        <select name="room_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">রুম বেছে নিন</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.hostel_name} — রুম {r.room_no}</option>)}
        </select>
      </div>
      <div>
        <Label>ছাত্র *</Label>
        <select name="student_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">ছাত্র বেছে নিন</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name_bn ?? s.name_en ?? s.id}</option>)}
        </select>
      </div>
      <div>
        <Label>বেড নম্বর</Label>
        <Input name="bed_no" placeholder="B-1" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "বরাদ্দ হচ্ছে..." : "বরাদ্দ করুন"}
      </Button>
    </form>
  );
}
