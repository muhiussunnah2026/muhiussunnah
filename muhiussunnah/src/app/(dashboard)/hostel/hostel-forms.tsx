"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHostelAction, addRoomAction, allocateHostelAction } from "@/server/actions/operations";

export function AddHostelForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("hostel");
  const [state, action, pending] = useActionState(addHostelAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("add_hostel_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("add_hostel_name_label")}</Label>
        <Input name="name" placeholder={t("add_hostel_name_placeholder")} required />
      </div>
      <div>
        <Label>{t("add_type_label")}</Label>
        <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="boys">{t("type_boys")}</option>
          <option value="girls">{t("type_girls")}</option>
          <option value="mixed">{t("type_mixed")}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("add_warden_label")}</Label>
          <Input name="warden_name" placeholder={t("add_warden_placeholder")} />
        </div>
        <div>
          <Label>{t("add_phone_label")}</Label>
          <Input name="warden_phone" placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div>
        <Label>{t("add_capacity_label")}</Label>
        <Input name="capacity" type="number" min={1} placeholder="100" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("add_adding") : t("add_hostel_cta")}
      </Button>
    </form>
  );
}

type Hostel = { id: string; name: string };

export function AddRoomForm({ schoolSlug, hostels }: { schoolSlug: string; hostels: Hostel[] }) {
  const t = useTranslations("hostel");
  const [state, action, pending] = useActionState(addRoomAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("add_room_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("add_room_hostel_label")}</Label>
        <select name="hostel_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("add_room_select")}</option>
          {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("add_room_no_label")}</Label>
          <Input name="room_no" placeholder="101" required />
        </div>
        <div>
          <Label>{t("add_room_capacity_label")}</Label>
          <Input name="capacity" type="number" min={1} defaultValue={4} />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("add_adding") : t("add_room_cta")}
      </Button>
    </form>
  );
}

type Room = { id: string; room_no: string; hostel_name: string };
type Student = { id: string; name_bn: string | null; name_en: string | null };

export function AllocateForm({ schoolSlug, rooms, students }: { schoolSlug: string; rooms: Room[]; students: Student[] }) {
  const t = useTranslations("hostel");
  const [state, action, pending] = useActionState(allocateHostelAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("allocate_allocated")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="from_date" value={new Date().toISOString().split("T")[0]} />
      <div>
        <Label>{t("allocate_room_label")}</Label>
        <select name="room_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("allocate_room_placeholder")}</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.hostel_name} — {t("room_prefix")} {r.room_no}</option>)}
        </select>
      </div>
      <div>
        <Label>{t("allocate_student_label")}</Label>
        <select name="student_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("allocate_student_placeholder")}</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name_bn ?? s.name_en ?? s.id}</option>)}
        </select>
      </div>
      <div>
        <Label>{t("allocate_bed_label")}</Label>
        <Input name="bed_no" placeholder="B-1" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("allocating") : t("allocate_cta")}
      </Button>
    </form>
  );
}
