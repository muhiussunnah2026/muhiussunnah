"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  section_id: string | null;
  sections: { id: string; name: string; classes: { id: string; name_bn: string } } | null;
};

type ClassWithSections = {
  id: string;
  name_bn: string;
  sections: { id: string; name: string }[];
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
  classes,
}: {
  schoolSlug: string;
  student: Student;
  father: Guardian;
  mother: Guardian;
  extra: Guardian;
  classes: ClassWithSections[];
}) {
  const router = useRouter();
  const t = useTranslations("editStudent");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateStudentAction,
    null,
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo_url);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(""); // "" | dataURL | __REMOVE__
  const fileRef = useRef<HTMLInputElement>(null);

  // Class / section — controlled selects so changing class resets the
  // section list to that class's sections. Section is optional for 90% of
  // institutes, so we hide it behind an "Advanced" toggle unless the student
  // is already in a non-default section or the class actually has multiple.
  const [classId, setClassId] = useState<string>(student.sections?.classes?.id ?? "");
  const [sectionId, setSectionId] = useState<string>(student.section_id ?? "");
  const availableSections =
    classes.find((c) => c.id === classId)?.sections ?? [];
  // Show section only if >1 section exists OR the current name isn't the
  // auto-default "ক". Otherwise keep it collapsed — principal never sees it.
  const hasMeaningfulSection =
    availableSections.length > 1 ||
    (student.sections && student.sections.name !== "ক");
  const [showSection, setShowSection] = useState<boolean>(!!hasMeaningfulSection);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("toast_updated"));
      router.push(`/students/${student.id}`);
    } else {
      toast.error(state.error);
    }
  }, [state, router, student.id, t]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("image_only_error"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t("image_max_size"));
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
      <FieldGroup title={t("group_photo")}>
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
                {t("photo_upload")}
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
                  {t("photo_remove")}
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{t("photo_hint")}</p>
          </div>
        </div>
      </FieldGroup>

      {/* Class / Section */}
      <FieldGroup title={t("group_academic")}>
        <input type="hidden" name="class_id" value={classId} />
        <input type="hidden" name="section_id" value={sectionId} />
        <Field label={t("label_class")} required>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId(""); // reset section when class changes
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("class_placeholder")}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name_bn}</option>
            ))}
          </select>
          {!showSection ? (
            <button
              type="button"
              onClick={() => setShowSection(true)}
              className="mt-1 text-left text-xs text-primary hover:underline"
            >
              {t("add_section_link")}
            </button>
          ) : null}
        </Field>
        {showSection ? (
          <Field label={t("label_section")}>
            <div className="flex items-center gap-2">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId || availableSections.length === 0}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">
                  {classId && availableSections.length === 0
                    ? t("section_empty")
                    : t("section_placeholder")}
                </option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setSectionId("");
                  setShowSection(false);
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
                title={t("remove_section_title")}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("section_auto_hint")}
            </p>
          </Field>
        ) : null}
      </FieldGroup>

      {/* Identity */}
      <FieldGroup title={t("group_personal")}>
        <Field label={t("label_student_code")}>
          <Input name="student_code" defaultValue={student.student_code} placeholder={t("student_code_placeholder")} />
        </Field>
        <Field label={t("label_name_bn")} required>
          <Input name="name_bn" defaultValue={student.name_bn} required minLength={2} />
        </Field>
        <Field label={t("label_name_en")}>
          <Input name="name_en" defaultValue={student.name_en ?? ""} />
        </Field>
        <Field label={t("label_name_ar")}>
          <Input name="name_ar" defaultValue={student.name_ar ?? ""} dir="rtl" />
        </Field>
        <Field label={t("label_roll")}>
          <Input name="roll" type="number" min={0} defaultValue={student.roll ?? ""} />
        </Field>
        <Field label={t("label_gender")}>
          <select
            name="gender"
            defaultValue={student.gender ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("gender_placeholder")}</option>
            <option value="male">{t("gender_male")}</option>
            <option value="female">{t("gender_female")}</option>
          </select>
        </Field>
        <Field label={t("label_religion")}>
          <Input name="religion" defaultValue={student.religion ?? ""} />
        </Field>
        <Field label={t("label_blood_group")}>
          <Input name="blood_group" defaultValue={student.blood_group ?? ""} />
        </Field>
        <Field label={t("label_dob")}>
          <Input name="date_of_birth" type="date" defaultValue={student.date_of_birth ?? ""} />
        </Field>
        <Field label={t("label_admission_date")}>
          <Input name="admission_date" type="date" defaultValue={student.admission_date ?? ""} />
        </Field>
        <Field label={t("label_nid")}>
          <Input name="nid_birth_cert" defaultValue={student.nid_birth_cert ?? ""} />
        </Field>
        <Field label={t("label_rf_id")}>
          <Input name="rf_id_card" defaultValue={student.rf_id_card ?? ""} placeholder={t("rf_id_placeholder")} />
        </Field>
      </FieldGroup>

      {/* Guardians */}
      <FieldGroup title={t("group_father")}>
        <Field label={t("label_father_name")}>
          <Input name="guardian_name" defaultValue={father?.name_bn ?? ""} placeholder={t("father_name_placeholder")} />
        </Field>
        <Field label={t("label_father_phone")}>
          <Input
            name="guardian_phone"
            defaultValue={father?.phone ?? student.guardian_phone ?? ""}
            inputMode="tel"
          />
        </Field>
        <Field label={t("label_relation")}>
          <select
            name="guardian_relation"
            defaultValue={father ? "father" : mother && mother.is_primary ? "mother" : "father"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="father">{t("relation_father")}</option>
            <option value="mother">{t("relation_mother")}</option>
          </select>
        </Field>
      </FieldGroup>

      <FieldGroup title={t("group_mother")}>
        <Field label={t("label_mother_name")}>
          <Input name="mother_name" defaultValue={mother?.name_bn ?? ""} />
        </Field>
        <Field label={t("label_mother_phone")}>
          <Input name="mother_phone" defaultValue={mother?.phone ?? ""} inputMode="tel" />
        </Field>
      </FieldGroup>

      <FieldGroup title={t("group_extra")}>
        <Field label={t("label_extra_name")}>
          <Input name="extra_guardian_name" defaultValue={extra?.name_bn ?? ""} />
        </Field>
        <Field label={t("label_extra_phone")}>
          <Input name="extra_guardian_phone" defaultValue={extra?.phone ?? ""} inputMode="tel" />
        </Field>
        <Field label={t("label_extra_relation")}>
          <Input
            name="extra_guardian_relation"
            defaultValue={extra?.relation && extra.relation !== "father" && extra.relation !== "mother" ? extra.relation : ""}
            placeholder={t("extra_relation_placeholder")}
          />
        </Field>
      </FieldGroup>

      {/* Addresses */}
      <FieldGroup title={t("group_address")}>
        <Field label={t("label_current_address")} full>
          <Textarea name="address_present" defaultValue={student.address_present ?? ""} rows={2} />
        </Field>
        <Field label={t("label_permanent_address")} full>
          <Textarea name="address_permanent" defaultValue={student.address_permanent ?? ""} rows={2} />
        </Field>
        <Field label={t("label_prev_school")} full>
          <Input name="previous_school" defaultValue={student.previous_school ?? ""} />
        </Field>
      </FieldGroup>

      {/* Fees */}
      <FieldGroup title={t("group_fees")}>
        <Field label={t("label_admission_fee")}>
          <Input name="admission_fee" type="number" min={0} step="any" defaultValue={student.admission_fee ?? ""} />
        </Field>
        <Field label={t("label_tuition_fee")}>
          <Input name="tuition_fee" type="number" min={0} step="any" defaultValue={student.tuition_fee ?? ""} />
        </Field>
        <Field label={t("label_transport_fee")}>
          <Input name="transport_fee" type="number" min={0} step="any" defaultValue={student.transport_fee ?? ""} />
        </Field>
      </FieldGroup>

      {/* Status */}
      <FieldGroup title={t("group_status")}>
        <Field label={t("label_current_status")} full>
          <select
            name="status"
            defaultValue={student.status}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="active">{t("status_active")}</option>
            <option value="transferred">{t("status_transferred")}</option>
            <option value="passed_out">{t("status_passed_out")}</option>
            <option value="dropped">{t("status_dropped")}</option>
            <option value="suspended">{t("status_suspended")}</option>
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
          {pending ? t("btn_saving") : t("btn_save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/students/${student.id}`)}
          disabled={pending}
        >
          {t("btn_cancel")}
        </Button>
        <p className="text-xs text-muted-foreground ms-auto">
          {t("footer_hint")}
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
