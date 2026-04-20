"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Upload, X, Printer, FileDown, Sparkles, CreditCard } from "lucide-react";
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
  nameSuggestionsBn: string[];
  nameSuggestionsEn: string[];
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
  return (
    <Label htmlFor={htmlFor} className="flex items-baseline gap-1.5">
      <span>{children}</span>
      {required ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">আবশ্যক</span>
      ) : (
        <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground/70">ঐচ্ছিক</span>
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
  nameSuggestionsBn,
  nameSuggestionsEn,
  fatherSuggestions,
  motherSuggestions,
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addStudentAction,
    null,
  );

  const [values, setValues] = useState<FormValues>(makeEmpty());
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  // Session is captured as a name-string. We convert it into an existing
  // academic_year id on submit (server side) — or ask the server to create
  // one if the name is new.
  const initialYear = years.find((y) => y.is_active) ?? years[0];
  const [sessionName, setSessionName] = useState<string>(initialYear?.name ?? "");

  const resolvedSession = useMemo(() => {
    const typed = sessionName.trim();
    if (!typed) return { id: "", name: "" };
    const existing = years.find(
      (y) => y.name.trim().toLowerCase() === typed.toLowerCase(),
    );
    return existing
      ? { id: existing.id, name: existing.name }
      : { id: "", name: typed };
  }, [sessionName, years]);
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
  const multipleSections = (selectedClass?.sections.length ?? 0) > 1;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "ভর্তি সম্পন্ন!");
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

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
      toast.error("ক্যামেরা অনুমতি দিন অথবা ফাইল আপলোড ব্যবহার করুন।");
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
      toast.error("ছবির আকার ৩ MB এর বেশি হতে পারে না।");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }
  useEffect(() => () => closeCamera(), []);

  // -------------------- print / export --------------------
  function printForm() {
    window.print();
  }
  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ ...values, classId, sectionId: resolvedSectionId, session: resolvedSession }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-${values.name_bn || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          প্রিন্ট
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={exportJson}>
          <FileDown className="size-3.5" />
          এক্সপোর্ট
        </Button>
      </div>

      {/* Shared datalists — used by the name inputs below for autocomplete */}
      <datalist id="datalist-names-bn">
        {nameSuggestionsBn.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <datalist id="datalist-names-en">
        {nameSuggestionsEn.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
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
            📷 ছাত্র/ছাত্রীর ছবি <span className="text-[10px] font-normal text-muted-foreground/70">(ঐচ্ছিক)</span>
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
                  ফাইল আপলোড
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={openCamera}>
                  <Camera className="size-3.5" />
                  ক্যামেরা চালু
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
                    সরান
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG / PNG, সর্বোচ্চ ৩ MB। মোবাইলে &ldquo;ফাইল&rdquo; বাটন ট্যাপ করলে ক্যামেরা open হবে।
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
                <h4 className="text-center text-sm font-semibold">ছবি তুলুন</h4>
                <video ref={videoRef} className="aspect-square w-full rounded-xl bg-black object-cover" />
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" size="sm" onClick={capture}>
                    <Camera className="size-3.5" />
                    ক্যাপচার
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={closeCamera}>
                    বাতিল
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
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">📅 শিক্ষাবর্ষ</h3>
          <div className="max-w-sm">
            <FieldLabel htmlFor="session_picker">
              ভর্তির সেশন
            </FieldLabel>
            <Input
              id="session_picker"
              list="datalist-sessions"
              placeholder="যেমন: ২০২৬-২০২৭"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              autoComplete="off"
            />
            <datalist id="datalist-sessions">
              {/* Existing years take priority — marked with "সক্রিয়" for active */}
              {years.map((y) => (
                <option key={y.id} value={y.name}>
                  {y.is_active ? "সক্রিয় সেশন" : "সংরক্ষিত সেশন"}
                </option>
              ))}
              {/* Common next-year suggestions in BD format */}
              {(() => {
                const now = new Date().getFullYear();
                const existing = new Set(years.map((y) => y.name));
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
                ? "💡 বিদ্যমান সেশন বাছাই করা হয়েছে।"
                : sessionName.trim()
                  ? "✨ নতুন সেশন হিসেবে তৈরি হবে।"
                  : "সাজেশন থেকে বাছাই বা নিজে লিখুন (যেমন 2026-2027)।"}
            </p>
          </div>
        </div>

        {/* ========== Student info ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            🎓 শিক্ষার্থীর তথ্য
          </legend>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name_bn" required>
              নাম (বাংলা)
            </FieldLabel>
            <Input
              id="name_bn"
              name="name_bn"
              list="datalist-names-bn"
              value={values.name_bn}
              onChange={(e) => set("name_bn", e.target.value)}
              className={cn(hasError("name_bn") && "border-destructive")}
              required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name_en">Name (English)</FieldLabel>
            <Input
              id="name_en"
              name="name_en"
              list="datalist-names-en"
              value={values.name_en}
              onChange={(e) => set("name_en", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="class_id" required>ক্লাস</FieldLabel>
            <Select value={classId} onValueChange={(v) => { setClassId(v ?? ""); setSectionId(""); }}>
              <SelectTrigger id="class_id" className={cn(hasError("section_id") && !classId && "border-destructive")}>
                <SelectValue placeholder="ক্লাস বাছাই করুন">
                  {(v: unknown) => {
                    const id = typeof v === "string" ? v : "";
                    const c = classes.find((x) => x.id === id);
                    if (!c) return "ক্লাস বাছাই করুন";
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
            <FieldLabel htmlFor="roll">রোল নম্বর</FieldLabel>
            <Input
              id="roll"
              name="roll"
              type="number"
              min={0}
              value={values.roll}
              onChange={(e) => set("roll", e.target.value)}
            />
          </div>

          {multipleSections ? (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <FieldLabel htmlFor="section_picker">সেকশন</FieldLabel>
              <Select value={sectionId} onValueChange={(v) => setSectionId(v ?? "")}>
                <SelectTrigger id="section_picker">
                  <SelectValue placeholder="সেকশন বাছাই করুন">
                    {(v: unknown) => {
                      const id = typeof v === "string" ? v : "";
                      const s = selectedClass?.sections.find((x) => x.id === id);
                      return s?.name ?? "সেকশন বাছাই করুন";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {selectedClass?.sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="gender">লিঙ্গ</FieldLabel>
            <Select value={values.gender} onValueChange={(v) => set("gender", v ?? "")}>
              <SelectTrigger id="gender"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ছেলে</SelectItem>
                <SelectItem value="female">মেয়ে</SelectItem>
                <SelectItem value="other">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="gender" value={values.gender} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="date_of_birth">জন্মতারিখ</FieldLabel>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={values.date_of_birth}
              onChange={(e) => set("date_of_birth", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="blood_group">রক্তের গ্রুপ</FieldLabel>
            <Input id="blood_group" name="blood_group" placeholder="A+" value={values.blood_group} onChange={(e) => set("blood_group", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="religion">ধর্ম</FieldLabel>
            <Input id="religion" name="religion" placeholder="ইসলাম" value={values.religion} onChange={(e) => set("religion", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="nid_birth_cert">NID / জন্মসনদ নম্বর</FieldLabel>
            <Input id="nid_birth_cert" name="nid_birth_cert" value={values.nid_birth_cert} onChange={(e) => set("nid_birth_cert", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="admission_date">ভর্তির তারিখ</FieldLabel>
            <Input id="admission_date" name="admission_date" type="date" value={values.admission_date} onChange={(e) => set("admission_date", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="student_code">ছাত্র কোড</FieldLabel>
            <Input id="student_code" name="student_code" placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে" value={values.student_code} onChange={(e) => set("student_code", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="rf_id_card">
              <CreditCard className="size-3.5 inline-block me-1" />
              RF ID Card নম্বর
            </FieldLabel>
            <Input
              id="rf_id_card"
              name="rf_id_card"
              placeholder="স্মার্ট কার্ড থাকলে এখানে লিখুন"
              value={values.rf_id_card}
              onChange={(e) => set("rf_id_card", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              💡 গেট অ্যাটেনডেন্স ও ক্যান্টিন ওয়ালেটের জন্য।
            </p>
          </div>
        </fieldset>

        {/* ========== Fees ========== */}
        <fieldset className="grid gap-4 md:grid-cols-3 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            💳 ফি বিবরণ
          </legend>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="admission_fee">ভর্তি ফি (৳)</FieldLabel>
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
            <FieldLabel htmlFor="tuition_fee">টিউশন ফি (৳/মাস)</FieldLabel>
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
            <FieldLabel htmlFor="transport_fee">ট্রান্সপোর্ট ফি (৳/মাস)</FieldLabel>
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
            👨‍👩‍👧 অভিভাবকের তথ্য
          </legend>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="guardian_name">পিতার নাম</FieldLabel>
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
            <FieldLabel htmlFor="guardian_phone">পিতার মোবাইল</FieldLabel>
            <Input id="guardian_phone" name="guardian_phone" type="tel" inputMode="tel" value={values.guardian_phone} onChange={(e) => set("guardian_phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="mother_name">মাতার নাম</FieldLabel>
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
            <FieldLabel htmlFor="mother_phone">মাতার মোবাইল</FieldLabel>
            <Input id="mother_phone" name="mother_phone" type="tel" inputMode="tel" value={values.mother_phone} onChange={(e) => set("mother_phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="guardian_relation">যোগাযোগের প্রাথমিক সম্পর্ক</FieldLabel>
            <Select value={values.guardian_relation} onValueChange={(v) => set("guardian_relation", v ?? "")}>
              <SelectTrigger id="guardian_relation"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="father">বাবা</SelectItem>
                <SelectItem value="mother">মা</SelectItem>
                <SelectItem value="guardian">অভিভাবক</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="guardian_relation" value={values.guardian_relation} />
          </div>
        </fieldset>

        {/* ========== Extra Guardian (when child lives with uncle/aunt/grandparent) ========== */}
        <fieldset className="grid gap-4 md:grid-cols-3 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            🤝 অতিরিক্ত অভিভাবক <span className="text-[10px] font-normal text-muted-foreground/70">(ঐচ্ছিক)</span>
          </legend>
          <p className="col-span-full text-xs text-muted-foreground -mt-2">
            💡 ছাত্র যদি মা-বাবার সাথে না থেকে অন্য কারো (চাচা / মামা / দাদা / খালা) কাছে থাকে, তাহলে এখানে যোগ করুন।
          </p>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="extra_guardian_name">অভিভাবকের নাম</FieldLabel>
            <Input
              id="extra_guardian_name"
              name="extra_guardian_name"
              value={values.extra_guardian_name}
              onChange={(e) => set("extra_guardian_name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="extra_guardian_phone">মোবাইল</FieldLabel>
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
            <FieldLabel htmlFor="extra_guardian_relation">সম্পর্ক</FieldLabel>
            <Input
              id="extra_guardian_relation"
              name="extra_guardian_relation"
              list="datalist-relations"
              placeholder="যেমন: চাচা, মামা, অথবা লিখুন"
              value={values.extra_guardian_relation}
              onChange={(e) => set("extra_guardian_relation", e.target.value)}
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              সাজেশন থেকে বাছাই বা নিজে লিখুন (যেকোনো সম্পর্ক)।
            </p>
          </div>
        </fieldset>

        {/* ========== Address ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            🏠 ঠিকানা
          </legend>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_present">বর্তমান ঠিকানা</FieldLabel>
            <Textarea id="address_present" name="address_present" rows={2} value={values.address_present} onChange={(e) => set("address_present", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_permanent">স্থায়ী ঠিকানা</FieldLabel>
            <Textarea id="address_permanent" name="address_permanent" rows={2} value={values.address_permanent} onChange={(e) => set("address_permanent", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="previous_school">পূর্ববর্তী স্কুল</FieldLabel>
            <Input id="previous_school" name="previous_school" value={values.previous_school} onChange={(e) => set("previous_school", e.target.value)} />
          </div>
        </fieldset>

        {state && !state.ok ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            ⚠️ {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 print:hidden">
          <Button type="submit" disabled={pending || !canSubmit} className={cn("bg-gradient-primary text-white min-w-36", !canSubmit && "opacity-60")}>
            {pending ? "ভর্তি হচ্ছে..." : "ভর্তি করুন"}
          </Button>
          {!canSubmit ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3" />
              নাম ও ক্লাস পূরণ করলেই বাটন সক্রিয় হবে
            </span>
          ) : null}
        </div>
      </form>
    </>
  );
}
