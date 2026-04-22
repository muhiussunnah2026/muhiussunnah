"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Camera, Upload, X, Printer, Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addStudentAction } from "@/server/actions/students";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = {
  id: string;
  name_bn: string;
  name_en: string | null;
  sections: { id: string; name: string }[];
};

type YearOption = { id: string; name: string; is_active: boolean };

type Props = {
  schoolSlug: string;
  classes: ClassOption[];
  years: YearOption[];
  fatherSuggestions: string[];
  motherSuggestions: string[];
};

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  const t = useTranslations("newStudent");
  return (
    <Label htmlFor={htmlFor} className="flex items-baseline gap-1.5">
      <span>{children}</span>
      {required ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">{t("required_badge")}</span>
      ) : (
        <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground/70">{t("optional_badge")}</span>
      )}
    </Label>
  );
}

type FormValues = {
  name_bn: string;
  name_en: string;
  roll: string;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  religion: string;
  nid_birth_cert: string;
  admission_date: string;
  student_code: string;
  rf_id_card: string;
  admission_fee: string;
  tuition_fee: string;
  transport_fee: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_phone: string;
  mother_name: string;
  mother_phone: string;
  extra_guardian_name: string;
  extra_guardian_phone: string;
  extra_guardian_relation: string;
  address_present: string;
  address_permanent: string;
  previous_school: string;
};

const makeEmpty = (): FormValues => ({
  name_bn: "",
  name_en: "",
  roll: "",
  gender: "",
  date_of_birth: "",
  blood_group: "",
  religion: "",
  nid_birth_cert: "",
  admission_date: new Date().toISOString().slice(0, 10),
  student_code: "",
  rf_id_card: "",
  admission_fee: "",
  tuition_fee: "",
  transport_fee: "",
  guardian_name: "",
  guardian_relation: "father",
  guardian_phone: "",
  mother_name: "",
  mother_phone: "",
  extra_guardian_name: "",
  extra_guardian_phone: "",
  extra_guardian_relation: "",
  address_present: "",
  address_permanent: "",
  previous_school: "",
});

export function NewStudentForm({
  schoolSlug,
  classes,
  years,
  fatherSuggestions,
  motherSuggestions,
}: Props) {
  const router = useRouter();
  const t = useTranslations("newStudent");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addStudentAction,
    null,
  );

  const [values, setValues] = useState<FormValues>(makeEmpty());
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  // Session is captured as a name-string. We convert it into an existing
  // academic_year id on submit (server side) — or ask the server to create
  // one if the name is new. `sanitizeYear` repairs any "2025-12026" rows
  // that may linger from before the validation landed.
  const sanitizeYear = (raw: string): string => {
    if (!raw) return raw;
    const m = /^(\d{4})[-–](\d{5})$/.exec(raw);
    if (m && m[2].startsWith("1")) return `${m[1]}-${m[2].slice(1)}`;
    return raw;
  };
  const cleanedYears = useMemo(
    () =>
      years
        .map((y) => ({ ...y, name: sanitizeYear(y.name) }))
        .filter((y) => y.name.length > 0),
    [years],
  );
  const initialYear = cleanedYears.find((y) => y.is_active) ?? cleanedYears[0];
  const [sessionName, setSessionName] = useState<string>(initialYear?.name ?? "");

  const resolvedSession = useMemo(() => {
    const typed = sanitizeYear(sessionName.trim());
    if (!typed) return { id: "", name: "" };
    const existing = cleanedYears.find(
      (y) => y.name.trim().toLowerCase() === typed.toLowerCase(),
    );
    return existing
      ? { id: existing.id, name: existing.name }
      : { id: "", name: typed };
  }, [sessionName, cleanedYears]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");

  const fieldErrors: Record<string, string[]> =
    state && !state.ok && state.fields ? state.fields : {};
  const hasError = (k: string) => Boolean(fieldErrors[k]?.length);

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId),
    [classes, classId],
  );
  const resolvedSectionId = sectionId || selectedClass?.sections[0]?.id || "";

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("submit_success"));
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router, t]);

  // -------------------- photo --------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      toast.error(t("camera_denied"));
    }
  }
  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }
  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const src = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - src) / 2;
    const sy = (video.videoHeight - src) / 2;
    ctx.drawImage(video, sx, sy, src, src, 0, 0, size, size);
    setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.82));
    closeCamera();
  }
  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t("image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }
  useEffect(() => () => closeCamera(), []);

  // -------------------- print --------------------
  function printForm() {
    window.print();
  }

  // Submit only requires name + class. Section_id is auto-resolved on the
  // server: if the class has sections we pick the first one, otherwise we
  // create a default "ক" section on the fly. Admins never have to think
  // about sections unless they actually use multiple.
  const canSubmit = values.name_bn.trim().length >= 2 && classId !== "";

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2 print:hidden">
        <Button type="button" size="sm" variant="outline" onClick={printForm}>
          <Printer className="size-3.5" />
          {t("print_button")}
        </Button>
      </div>

      {/* Shared datalists — guardian-name + relation suggestions only. Student
          name inputs intentionally don't use one: native browser datalist has
          no filter/limit, so with 20+ existing students it rendered a massive
          list. Admins will type fresh names for new admissions anyway. */}
      <datalist id="datalist-fathers">
        {fatherSuggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <datalist id="datalist-mothers">
        {motherSuggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      {/* Relation datalist — common Bangladeshi family roles. Not exhaustive
          on purpose — admins can always type their own. */}
      <datalist id="datalist-relations">
        <option value="বাবা" />
        <option value="মা" />
        <option value="ভাই" />
        <option value="বোন" />
        <option value="চাচা" />
        <option value="মামা" />
        <option value="দাদা" />
        <option value="নানা" />
        <option value="খালা" />
        <option value="ফুপা" />
        <option value="দাদী" />
        <option value="নানী" />
        <option value="অভিভাবক" />
      </datalist>

      <form action={action} className="grid gap-5">
        <input type="hidden" name="schoolSlug" value={schoolSlug} />
        <input type="hidden" name="class_id" value={classId} />
        <input type="hidden" name="section_id" value={resolvedSectionId} />
        <input type="hidden" name="session_id" value={resolvedSession.id} />
        <input type="hidden" name="session_name_new" value={resolvedSession.id ? "" : resolvedSession.name} />
        <input type="hidden" name="photo_data_url" value={photoDataUrl} />

        {/* ========== Photo ========== */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-primary/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            {t("section_photo")} <span className="text-[10px] font-normal text-muted-foreground/70">({t("optional_badge")})</span>
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30">
              {photoDataUrl ? (
                <Image src={photoDataUrl} alt="Photo" width={112} height={112} className="size-full object-cover" unoptimized />
              ) : (
                <span className="text-4xl text-muted-foreground/40">👤</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPickFile}
                  className="hidden"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-3.5" />
                  {t("btn_upload_file")}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={openCamera}>
                  <Camera className="size-3.5" />
                  {t("btn_camera")}
                </Button>
                {photoDataUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPhotoDataUrl("")}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-3.5" />
                    {t("btn_remove_photo")}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("photo_hint")}
              </p>
            </div>
          </div>

          {cameraOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={closeCamera}
            >
              <div
                className="flex w-full max-w-md flex-col gap-3 rounded-2xl bg-card p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-center text-sm font-semibold">{t("photo_capture_title")}</h4>
                <video ref={videoRef} className="aspect-square w-full rounded-xl bg-black object-cover" />
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" size="sm" onClick={capture}>
                    <Camera className="size-3.5" />
                    {t("btn_capture")}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={closeCamera}>
                    {t("btn_cancel_capture")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ========== Session (Academic year) ==========
            Combo of existing years + a few sensible BD defaults. Admins can
            also type any custom year ("2026-2027") and the server will
            create the academic_year record on the fly. */}
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("section_year")}</h3>
          <div className="max-w-sm">
            <FieldLabel htmlFor="session_picker">
              {t("admission_session_label")}
            </FieldLabel>
            <Input
              id="session_picker"
              list="datalist-sessions"
              placeholder={t("session_placeholder")}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoComplete="off"
            />
            <datalist id="datalist-sessions">
              {cleanedYears.map((y) => (
                <option key={y.id} value={y.name}>
                  {y.is_active ? t("session_active") : t("session_saved")}
                </option>
              ))}
              {(() => {
                const now = new Date().getFullYear();
                const existing = new Set(cleanedYears.map((y) => y.name));
                const suggestions = [
                  `${now}-${now + 1}`,
                  `${now + 1}-${now + 2}`,
                  `${now - 1}-${now}`,
                ];
                return suggestions
                  .filter((s) => !existing.has(s))
                  .map((s) => <option key={s} value={s} />);
              })()}
            </datalist>
            <p className="mt-1 text-xs text-muted-foreground">
              {resolvedSession.id
                ? t("session_hint_existing")
                : sessionName.trim()
                  ? t("session_hint_new")
                  : t("session_hint_default")}
            </p>
          </div>
        </div>

        {/* ========== Student info ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            {t("section_student_info")}
          </legend>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name_bn" required>
              {t("label_name_bn")}
            </FieldLabel>
            <Input
              id="name_bn"
              name="name_bn"
              value={values.name_bn}
              onChange={(e) => set("name_bn", e.target.value)}
              className={cn(hasError("name_bn") && "border-destructive")}
              required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name_en">{t("label_name_en")}</FieldLabel>
            <Input
              id="name_en"
              name="name_en"
              value={values.name_en}
              onChange={(e) => set("name_en", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="class_id" required>{t("label_class")}</FieldLabel>
            <Select value={classId} onValueChange={(v) => { setClassId(v ?? ""); setSectionId(""); }}>
              <SelectTrigger id="class_id" className={cn(hasError("section_id") && !classId && "border-destructive")}>
                <SelectValue placeholder={t("class_picker_placeholder")}>
                  {(v: unknown) => {
                    const id = typeof v === "string" ? v : "";
                    const c = classes.find((x) => x.id === id);
                    if (!c) return t("class_picker_placeholder");
                    return c.name_bn + (c.name_en ? ` (${c.name_en})` : "");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_bn}
                    {c.name_en ? ` (${c.name_en})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="roll">{t("label_roll")}</FieldLabel>
            <Input
              id="roll"
              name="roll"
              type="number"
              min={0}
              value={values.roll}
              onChange={(e) => set("roll", e.target.value)}
            />
          </div>

          {/* Section picker intentionally hidden. When a class has
              multiple sections, the school is expected to split it
              into separate classes (e.g. "Class Five (A)") so users
              never think about section pickers. The hidden input
              above (`section_id`) resolves to the class's default
              section automatically. */}

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="gender">{t("label_gender")}</FieldLabel>
            <Select value={values.gender} onValueChange={(v) => set("gender", v ?? "")}>
              <SelectTrigger id="gender">
                <SelectValue placeholder={t("gender_placeholder")}>
                  {(v: unknown) => {
                    const key = typeof v === "string" ? v : "";
                    if (key === "male") return t("gender_male");
                    if (key === "female") return t("gender_female");
                    return t("gender_placeholder");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("gender_male")}</SelectItem>
                <SelectItem value="female">{t("gender_female")}</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="gender" value={values.gender} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="date_of_birth">{t("label_dob")}</FieldLabel>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={values.date_of_birth}
              onChange={(e) => set("date_of_birth", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="blood_group">{t("label_blood_group")}</FieldLabel>
            <Input id="blood_group" name="blood_group" placeholder="A+" value={values.blood_group} onChange={(e) => set("blood_group", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="religion">{t("label_religion")}</FieldLabel>
            <Input id="religion" name="religion" placeholder={t("religion_placeholder")} value={values.religion} onChange={(e) => set("religion", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="nid_birth_cert">{t("label_nid")}</FieldLabel>
            <Input id="nid_birth_cert" name="nid_birth_cert" value={values.nid_birth_cert} onChange={(e) => set("nid_birth_cert", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="admission_date">{t("label_admission_date")}</FieldLabel>
            <Input id="admission_date" name="admission_date" type="date" value={values.admission_date} onChange={(e) => set("admission_date", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="student_code">{t("label_student_code")}</FieldLabel>
            <Input id="student_code" name="student_code" placeholder={t("student_code_placeholder")} value={values.student_code} onChange={(e) => set("student_code", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="rf_id_card">
              <CreditCard className="size-3.5 inline-block me-1" />
              {t("label_rf_id")}
            </FieldLabel>
            <Input
              id="rf_id_card"
              name="rf_id_card"
              placeholder={t("rf_id_placeholder")}
              value={values.rf_id_card}
              onChange={(e) => set("rf_id_card", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("rf_id_hint")}
            </p>
          </div>
        </fieldset>

        {/* ========== Fees ========== */}
        <fieldset className="grid gap-4 md:grid-cols-3 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            {t("section_fees")}
          </legend>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="admission_fee">{t("label_admission_fee")}</FieldLabel>
            <Input
              id="admission_fee"
              name="admission_fee"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={values.admission_fee}
              onChange={(e) => set("admission_fee", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="tuition_fee">{t("label_tuition_fee")}</FieldLabel>
            <Input
              id="tuition_fee"
              name="tuition_fee"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={values.tuition_fee}
              onChange={(e) => set("tuition_fee", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="transport_fee">{t("label_transport_fee")}</FieldLabel>
            <Input
              id="transport_fee"
              name="transport_fee"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={values.transport_fee}
              onChange={(e) => set("transport_fee", e.target.value)}
            />
          </div>
        </fieldset>

        {/* ========== Guardian ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            {t("section_guardian")}
          </legend>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="guardian_name">{t("label_father_name")}</FieldLabel>
            <Input
              id="guardian_name"
              name="guardian_name"
              list="datalist-fathers"
              value={values.guardian_name}
              onChange={(e) => set("guardian_name", e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="guardian_phone">{t("label_father_phone")}</FieldLabel>
            <Input id="guardian_phone" name="guardian_phone" type="tel" inputMode="tel" value={values.guardian_phone} onChange={(e) => set("guardian_phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="mother_name">{t("label_mother_name")}</FieldLabel>
            <Input
              id="mother_name"
              name="mother_name"
              list="datalist-mothers"
              value={values.mother_name}
              onChange={(e) => set("mother_name", e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="mother_phone">{t("label_mother_phone")}</FieldLabel>
            <Input id="mother_phone" name="mother_phone" type="tel" inputMode="tel" value={values.mother_phone} onChange={(e) => set("mother_phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="guardian_relation">{t("label_primary_relation")}</FieldLabel>
            <Select value={values.guardian_relation} onValueChange={(v) => set("guardian_relation", v ?? "")}>
              <SelectTrigger id="guardian_relation">
                <SelectValue>
                  {(v: unknown) => {
                    const key = typeof v === "string" ? v : "";
                    if (key === "father") return t("relation_father");
                    if (key === "mother") return t("relation_mother");
                    if (key === "guardian") return t("relation_guardian");
                    return "";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="father">{t("relation_father")}</SelectItem>
                <SelectItem value="mother">{t("relation_mother")}</SelectItem>
                <SelectItem value="guardian">{t("relation_guardian")}</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="guardian_relation" value={values.guardian_relation} />
          </div>
        </fieldset>

        {/* ========== Extra Guardian (when child lives with uncle/aunt/grandparent) ========== */}
        <fieldset className="grid gap-4 md:grid-cols-3 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            {t("section_extra_guardian")} <span className="text-[10px] font-normal text-muted-foreground/70">({t("optional_badge")})</span>
          </legend>
          <p className="col-span-full text-xs text-muted-foreground -mt-2">
            {t("extra_guardian_body")}
          </p>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="extra_guardian_name">{t("label_extra_guardian_name")}</FieldLabel>
            <Input
              id="extra_guardian_name"
              name="extra_guardian_name"
              value={values.extra_guardian_name}
              onChange={(e) => set("extra_guardian_name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="extra_guardian_phone">{t("label_extra_guardian_phone")}</FieldLabel>
            <Input
              id="extra_guardian_phone"
              name="extra_guardian_phone"
              type="tel"
              inputMode="tel"
              value={values.extra_guardian_phone}
              onChange={(e) => set("extra_guardian_phone", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="extra_guardian_relation">{t("label_extra_guardian_relation")}</FieldLabel>
            <Input
              id="extra_guardian_relation"
              name="extra_guardian_relation"
              list="datalist-relations"
              placeholder={t("extra_relation_placeholder")}
              value={values.extra_guardian_relation}
              onChange={(e) => set("extra_guardian_relation", e.target.value)}
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              {t("extra_relation_hint")}
            </p>
          </div>
        </fieldset>

        {/* ========== Address ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            {t("section_address")}
          </legend>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_present">{t("label_address_present")}</FieldLabel>
            <Textarea id="address_present" name="address_present" rows={2} value={values.address_present} onChange={(e) => set("address_present", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_permanent">{t("label_address_permanent")}</FieldLabel>
            <Textarea id="address_permanent" name="address_permanent" rows={2} value={values.address_permanent} onChange={(e) => set("address_permanent", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="previous_school">{t("label_previous_school")}</FieldLabel>
            <Input id="previous_school" name="previous_school" value={values.previous_school} onChange={(e) => set("previous_school", e.target.value)} />
          </div>
        </fieldset>

        {state && !state.ok ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
            <p className="font-semibold mb-1">⚠️ {state.error}</p>
            {Object.keys(fieldErrors).length > 0 ? (
              <ul className="mt-2 ms-5 list-disc space-y-0.5 text-xs">
                {Object.entries(fieldErrors).map(([field, errs]) => (
                  <li key={field}>
                    <strong>{fieldLabel(field, t)}:</strong>{" "}
                    {errs.join(", ")}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-3 print:hidden">
          <Button type="submit" disabled={pending || !canSubmit} className={cn("bg-gradient-primary text-white min-w-36", !canSubmit && "opacity-60")}>
            {pending ? t("submit_pending") : t("submit_button")}
          </Button>
          {!canSubmit ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3" />
              {t("submit_hint")}
            </span>
          ) : null}
        </div>
      </form>
    </>
  );
}

/** Localised label for each form field — shown in the error summary so
 *  admins know exactly which field the server rejected. Looks up a
 *  `field_*` key under the `newStudent` namespace; falls back to raw
 *  field name on miss. */
function fieldLabel(key: string, t: (k: string) => string): string {
  try {
    return t(`field_${key}`);
  } catch {
    return key;
  }
}
