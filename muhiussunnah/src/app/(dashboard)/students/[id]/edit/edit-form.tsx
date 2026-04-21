"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateStudentAction } from "@/server/actions/students";
import type { ActionResult } from "@/server/actions/_helpers";

type Student = {
  id: string;
  student_code: string;
  name_bn: string;
  name_en: string | null;
  name_ar: string | null;
  roll: number | null;
  gender: string | null;
  blood_group: string | null;
  religion: string | null;
  date_of_birth: string | null;
  admission_date: string | null;
  guardian_phone: string | null;
  address_present: string | null;
  address_permanent: string | null;
  previous_school: string | null;
  status: string;
  admission_fee: number | null;
  tuition_fee: number | null;
  transport_fee: number | null;
  rf_id_card: string | null;
};

export function EditStudentForm({
  schoolSlug,
  student,
}: {
  schoolSlug: string;
  student: Student;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateStudentAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "আপডেট হয়েছে");
      router.push(`/students/${student.id}`);
    } else {
      toast.error(state.error);
    }
  }, [state, router, student.id]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="student_id" value={student.id} />

      {/* Identity */}
      <FieldGroup title="ব্যক্তিগত তথ্য">
        <Field label="নাম (বাংলা)" required>
          <Input name="name_bn" defaultValue={student.name_bn} required minLength={2} />
        </Field>
        <Field label="Name (English)">
          <Input name="name_en" defaultValue={student.name_en ?? ""} />
        </Field>
        <Field label="নাম (عربي)">
          <Input name="name_ar" defaultValue={student.name_ar ?? ""} dir="rtl" />
        </Field>
        <Field label="রোল">
          <Input name="roll" type="number" min={0} defaultValue={student.roll ?? ""} />
        </Field>
        <Field label="লিঙ্গ">
          <select
            name="gender"
            defaultValue={student.gender ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— নির্বাচন করুন —</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
            <option value="other">অন্যান্য</option>
          </select>
        </Field>
        <Field label="ধর্ম">
          <Input name="religion" defaultValue={student.religion ?? ""} />
        </Field>
        <Field label="রক্তের গ্রুপ">
          <Input name="blood_group" defaultValue={student.blood_group ?? ""} />
        </Field>
        <Field label="জন্ম তারিখ">
          <Input name="date_of_birth" type="date" defaultValue={student.date_of_birth ?? ""} />
        </Field>
        <Field label="ভর্তির তারিখ">
          <Input name="admission_date" type="date" defaultValue={student.admission_date ?? ""} />
        </Field>
        <Field label="RF আইডি কার্ড">
          <Input name="rf_id_card" defaultValue={student.rf_id_card ?? ""} placeholder="Optional" />
        </Field>
      </FieldGroup>

      {/* Contact + guardian */}
      <FieldGroup title="যোগাযোগ">
        <Field label="অভিভাবক ফোন">
          <Input name="guardian_phone" defaultValue={student.guardian_phone ?? ""} inputMode="tel" />
        </Field>
        <Field label="পূর্ববর্তী বিদ্যালয়">
          <Input name="previous_school" defaultValue={student.previous_school ?? ""} />
        </Field>
        <Field label="বর্তমান ঠিকানা" full>
          <Textarea name="address_present" defaultValue={student.address_present ?? ""} rows={2} />
        </Field>
        <Field label="স্থায়ী ঠিকানা" full>
          <Textarea name="address_permanent" defaultValue={student.address_permanent ?? ""} rows={2} />
        </Field>
      </FieldGroup>

      {/* Fees */}
      <FieldGroup title="ফি তথ্য">
        <Field label="ভর্তি ফি (৳)">
          <Input name="admission_fee" type="number" min={0} step="any" defaultValue={student.admission_fee ?? ""} />
        </Field>
        <Field label="মাসিক টিউশন ফি (৳)">
          <Input name="tuition_fee" type="number" min={0} step="any" defaultValue={student.tuition_fee ?? ""} />
        </Field>
        <Field label="পরিবহন ফি (৳)">
          <Input name="transport_fee" type="number" min={0} step="any" defaultValue={student.transport_fee ?? ""} />
        </Field>
      </FieldGroup>

      {/* Status */}
      <FieldGroup title="স্ট্যাটাস">
        <Field label="বর্তমান স্ট্যাটাস" full>
          <select
            name="status"
            defaultValue={student.status}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="active">সক্রিয়</option>
            <option value="transferred">বদলি হয়েছে</option>
            <option value="passed_out">পাশ করেছে</option>
            <option value="dropped">বাদ</option>
            <option value="suspended">স্থগিত</option>
          </select>
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
        <Button
          type="submit"
          disabled={pending}
          className="bg-gradient-primary text-white shadow-lg shadow-primary/25"
        >
          <Save className="me-1 size-4" />
          {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/students/${student.id}`)}
          disabled={pending}
        >
          বাতিল
        </Button>
        <p className="text-xs text-muted-foreground ms-auto">
          💡 ক্লাস / সেকশন পরিবর্তন করতে, বিস্তারিত পেজ থেকে "স্থানান্তর" ফরম ব্যবহার করুন।
        </p>
      </div>
    </form>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <Label>
        {label}
        {required ? <span className="text-destructive ms-1">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
