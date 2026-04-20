"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Upload, X, Printer, FileDown, Sparkles } from "lucide-react";
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

/**
 * FieldLabel — small wrapper that renders a Label with a tiny
 * "(আবশ্যক)" or "(ঐচ্ছিক)" suffix so users always know which fields
 * they must fill in.
 */
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
        <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">
          আবশ্যক
        </span>
      ) : (
        <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground/70">
          ঐচ্ছিক
        </span>
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
  guardian_name: string;
  guardian_relation: string;
  guardian_phone: string;
  mother_name: string;
  mother_phone: string;
  address_present: string;
  address_permanent: string;
  previous_school: string;
};

const emptyForm: FormValues = {
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
  guardian_name: "",
  guardian_relation: "father",
  guardian_phone: "",
  mother_name: "",
  mother_phone: "",
  address_present: "",
  address_permanent: "",
  previous_school: "",
};

export function NewStudentForm({
  schoolSlug,
  classes,
}: {
  schoolSlug: string;
  classes: ClassOption[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addStudentAction,
    null,
  );

  // Fully controlled form values so validation errors never wipe input.
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
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
  const resolvedSectionId =
    sectionId || selectedClass?.sections[0]?.id || "";
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

  // -------------------- photo capture / upload --------------------
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
    // Center-crop to square
    const src = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - src) / 2;
    const sy = (video.videoHeight - src) / 2;
    ctx.drawImage(video, sx, sy, src, src, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    setPhotoDataUrl(dataUrl);
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
    const blob = new Blob([JSON.stringify({ ...values, classId, sectionId: resolvedSectionId }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-${values.name_bn || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------------------- submit validation --------------------
  const canSubmit =
    values.name_bn.trim().length >= 2 && classId !== "" && resolvedSectionId !== "";

  return (
    <>
      {/* Top toolbar — Print / Export */}
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

      <form action={action} className="grid gap-5">
        <input type="hidden" name="schoolSlug" value={schoolSlug} />
        <input type="hidden" name="section_id" value={resolvedSectionId} />
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

          {/* Webcam modal */}
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
              value={values.name_bn}
              onChange={(e) => set("name_bn", e.target.value)}
              className={cn(hasError("name_bn") && "border-destructive")}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="name_en">Name (English)</FieldLabel>
            <Input
              id="name_en"
              name="name_en"
              value={values.name_en}
              onChange={(e) => set("name_en", e.target.value)}
            />
          </div>

          {/* CLASS (required) */}
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
            <Input
              id="blood_group"
              name="blood_group"
              placeholder="A+"
              value={values.blood_group}
              onChange={(e) => set("blood_group", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="religion">ধর্ম</FieldLabel>
            <Input
              id="religion"
              name="religion"
              placeholder="ইসলাম"
              value={values.religion}
              onChange={(e) => set("religion", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="nid_birth_cert">NID / জন্মসনদ নম্বর</FieldLabel>
            <Input
              id="nid_birth_cert"
              name="nid_birth_cert"
              value={values.nid_birth_cert}
              onChange={(e) => set("nid_birth_cert", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="admission_date">ভর্তির তারিখ</FieldLabel>
            <Input
              id="admission_date"
              name="admission_date"
              type="date"
              value={values.admission_date}
              onChange={(e) => set("admission_date", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="student_code">ছাত্র কোড</FieldLabel>
            <Input
              id="student_code"
              name="student_code"
              placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
              value={values.student_code}
              onChange={(e) => set("student_code", e.target.value)}
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
              value={values.guardian_name}
              onChange={(e) => set("guardian_name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="guardian_phone">পিতার মোবাইল</FieldLabel>
            <Input
              id="guardian_phone"
              name="guardian_phone"
              type="tel"
              inputMode="tel"
              value={values.guardian_phone}
              onChange={(e) => set("guardian_phone", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="mother_name">মাতার নাম</FieldLabel>
            <Input
              id="mother_name"
              name="mother_name"
              value={values.mother_name}
              onChange={(e) => set("mother_name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="mother_phone">মাতার মোবাইল</FieldLabel>
            <Input
              id="mother_phone"
              name="mother_phone"
              type="tel"
              inputMode="tel"
              value={values.mother_phone}
              onChange={(e) => set("mother_phone", e.target.value)}
            />
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

        {/* ========== Address ========== */}
        <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
          <legend className="col-span-full text-sm font-semibold text-muted-foreground">
            🏠 ঠিকানা
          </legend>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_present">বর্তমান ঠিকানা</FieldLabel>
            <Textarea
              id="address_present"
              name="address_present"
              rows={2}
              value={values.address_present}
              onChange={(e) => set("address_present", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="address_permanent">স্থায়ী ঠিকানা</FieldLabel>
            <Textarea
              id="address_permanent"
              name="address_permanent"
              rows={2}
              value={values.address_permanent}
              onChange={(e) => set("address_permanent", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <FieldLabel htmlFor="previous_school">পূর্ববর্তী স্কুল</FieldLabel>
            <Input
              id="previous_school"
              name="previous_school"
              value={values.previous_school}
              onChange={(e) => set("previous_school", e.target.value)}
            />
          </div>
        </fieldset>

        {state && !state.ok ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            ⚠️ {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 print:hidden">
          <Button
            type="submit"
            disabled={pending || !canSubmit}
            className={cn(
              "bg-gradient-primary text-white min-w-36",
              !canSubmit && "opacity-60",
            )}
          >
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
