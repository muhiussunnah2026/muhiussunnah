"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Save, Upload, X } from "lucide-react";
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
  photo_url: string | null;
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
  nid_birth_cert: string | null;
};

type Guardian = {
  id: string;
  name_bn: string;
  phone: string | null;
  relation: string;
  is_primary: boolean;
} | null;

export function EditStudentForm({
  schoolSlug,
  student,
  father,
  mother,
  extra,
}: {
  schoolSlug: string;
  student: Student;
  father: Guardian;
  mother: Guardian;
  extra: Guardian;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateStudentAction,
    null,
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo_url);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(""); // "" | dataURL | __REMOVE__
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "আপডেট হয়েছে");
      router.push(`/students/${student.id}`);
    } else {
      toast.error(state.error);
    }
  }, [state, router, student.id]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি নির্বাচন করুন।");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("ছবি ৩ MB এর বেশি হতে পারে না।");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const url = r.result as string;
      setPhotoPreview(url);
      setPhotoDataUrl(url);
    };
    r.readAsDataURL(file);
  }
  function removePhoto() {
    setPhotoPreview(null);
    setPhotoDataUrl("__REMOVE__");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="student_id" value={student.id} />
      <input type="hidden" name="photo_data_url" value={photoDataUrl} />

      {/* Photo */}
      <FieldGroup title="ছবি">
        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-5">
          <div className="size-28 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt={student.name_bn}
                width={112}
                height={112}
                className="size-full object-cover"
                unoptimized
              />
            ) : (
              <Camera className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onPickPhoto}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="me-1 size-3.5" />
                আপলোড
              </Button>
              {photoPreview ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={removePhoto}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="me-1 size-3.5" />
                  সরান
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">PNG / JPG / WebP · সর্বোচ্চ ৩ MB</p>
          </div>
        </div>
      </FieldGroup>

      {/* Identity */}
      <FieldGroup title="ব্যক্তিগত তথ্য">
        <Field label="শিক্ষার্থী কোড">
          <Input name="student_code" defaultValue={student.student_code} placeholder="স্বয়ংক্রিয়" />
        </Field>
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
        <Field label="জন্ম নিবন্ধন নম্বর / NID">
          <Input name="nid_birth_cert" defaultValue={student.nid_birth_cert ?? ""} />
        </Field>
        <Field label="RF আইডি কার্ড">
          <Input name="rf_id_card" defaultValue={student.rf_id_card ?? ""} placeholder="Optional" />
        </Field>
      </FieldGroup>

      {/* Guardians */}
      <FieldGroup title="পিতা / অভিভাবক ১">
        <Field label="পিতার নাম">
          <Input name="guardian_name" defaultValue={father?.name_bn ?? ""} placeholder="পুরা নাম" />
        </Field>
        <Field label="পিতার ফোন">
          <Input
            name="guardian_phone"
            defaultValue={father?.phone ?? student.guardian_phone ?? ""}
            inputMode="tel"
          />
        </Field>
        <Field label="সম্পর্ক">
          <select
            name="guardian_relation"
            defaultValue={father ? "father" : mother && mother.is_primary ? "mother" : "father"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="father">পিতা (প্রাথমিক)</option>
            <option value="mother">মাতা (প্রাথমিক)</option>
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title="মাতা">
        <Field label="মাতার নাম">
          <Input name="mother_name" defaultValue={mother?.name_bn ?? ""} />
        </Field>
        <Field label="মাতার ফোন">
          <Input name="mother_phone" defaultValue={mother?.phone ?? ""} inputMode="tel" />
        </Field>
      </FieldGroup>

      <FieldGroup title="অতিরিক্ত অভিভাবক (ঐচ্ছিক)">
        <Field label="নাম">
          <Input name="extra_guardian_name" defaultValue={extra?.name_bn ?? ""} />
        </Field>
        <Field label="ফোন">
          <Input name="extra_guardian_phone" defaultValue={extra?.phone ?? ""} inputMode="tel" />
        </Field>
        <Field label="সম্পর্ক">
          <Input
            name="extra_guardian_relation"
            defaultValue={extra?.relation && extra.relation !== "father" && extra.relation !== "mother" ? extra.relation : ""}
            placeholder="যেমন: চাচা, মামা, দাদা"
            list="extra-relation-suggestions"
          />
          <datalist id="extra-relation-suggestions">
            <option value="চাচা" />
            <option value="মামা" />
            <option value="ফুপা" />
            <option value="খালু" />
            <option value="দাদা" />
            <option value="নানা" />
            <option value="দাদী" />
            <option value="নানী" />
            <option value="ভাই" />
            <option value="বোন" />
            <option value="স্বামী" />
            <option value="স্ত্রী" />
            <option value="অভিভাবক" />
          </datalist>
        </Field>
      </FieldGroup>

      {/* Addresses */}
      <FieldGroup title="যোগাযোগ / ঠিকানা">
        <Field label="বর্তমান ঠিকানা" full>
          <Textarea name="address_present" defaultValue={student.address_present ?? ""} rows={2} />
        </Field>
        <Field label="স্থায়ী ঠিকানা" full>
          <Textarea name="address_permanent" defaultValue={student.address_permanent ?? ""} rows={2} />
        </Field>
        <Field label="পূর্ববর্তী বিদ্যালয়" full>
          <Input name="previous_school" defaultValue={student.previous_school ?? ""} />
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
