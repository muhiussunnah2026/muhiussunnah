"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addStudentAction } from "@/server/actions/students";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = {
  id: string;
  name_bn: string;
  name_en: string | null;
  sections: { id: string; name: string }[];
};

export function NewStudentForm({ schoolSlug, classes }: { schoolSlug: string; classes: ClassOption[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addStudentAction, null);

  // We capture class locally so we can conditionally render the section picker
  // (section is optional — only shown when the chosen class has more than
  // one real section).
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId),
    [classes, classId],
  );

  // Hidden section_id we actually submit: either the admin-picked one, or
  // the first (default "ক") section on the class.
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

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="section_id" value={resolvedSectionId} />

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="col-span-full text-sm font-semibold text-muted-foreground">
          🎓 শিক্ষার্থীর তথ্য
        </legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_bn">নাম (বাংলা) *</Label>
          <Input id="name_bn" name="name_bn" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_en">Name (English)</Label>
          <Input id="name_en" name="name_en" />
        </div>

        {/* CLASS picker — always required */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="class_id">
            ক্লাস <span className="text-destructive">*</span>
          </Label>
          <Select value={classId} onValueChange={(v) => setClassId(v ?? "")}>
            <SelectTrigger id="class_id">
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

        {/* ROLL */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="roll">রোল নম্বর</Label>
          <Input id="roll" name="roll" type="number" min={0} />
        </div>

        {/* SECTION picker — optional. Only visible when the class has
            more than one section; otherwise the default one is used
            transparently. */}
        {multipleSections ? (
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="section_picker">
              সেকশন <span className="text-xs font-normal text-muted-foreground">(ঐচ্ছিক — না বাছাই করলে প্রথম সেকশনে যোগ হবে)</span>
            </Label>
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
          <Label htmlFor="gender">লিঙ্গ</Label>
          <Select name="gender">
            <SelectTrigger id="gender"><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ছেলে</SelectItem>
              <SelectItem value="female">মেয়ে</SelectItem>
              <SelectItem value="other">অন্যান্য</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_of_birth">জন্মতারিখ</Label>
          <Input id="date_of_birth" name="date_of_birth" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="blood_group">রক্তের গ্রুপ</Label>
          <Input id="blood_group" name="blood_group" placeholder="A+" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="religion">ধর্ম</Label>
          <Input id="religion" name="religion" placeholder="ইসলাম" />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="nid_birth_cert">NID / জন্মসনদ নম্বর</Label>
          <Input id="nid_birth_cert" name="nid_birth_cert" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admission_date">ভর্তির তারিখ</Label>
          <Input id="admission_date" name="admission_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="student_code">ছাত্র কোড (ঐচ্ছিক)</Label>
          <Input id="student_code" name="student_code" placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে" />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
        <legend className="col-span-full text-sm font-semibold text-muted-foreground">
          👨‍👩‍👧 অভিভাবকের তথ্য
        </legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guardian_name">অভিভাবকের নাম</Label>
          <Input id="guardian_name" name="guardian_name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guardian_relation">সম্পর্ক</Label>
          <Select name="guardian_relation" defaultValue="father">
            <SelectTrigger id="guardian_relation"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="father">বাবা</SelectItem>
              <SelectItem value="mother">মা</SelectItem>
              <SelectItem value="guardian">অভিভাবক</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="guardian_phone">অভিভাবকের ফোন</Label>
          <Input id="guardian_phone" name="guardian_phone" type="tel" />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 border-t border-border/60 pt-5">
        <legend className="col-span-full text-sm font-semibold text-muted-foreground">
          🏠 ঠিকানা
        </legend>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="address_present">বর্তমান ঠিকানা</Label>
          <Textarea id="address_present" name="address_present" rows={2} />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="address_permanent">স্থায়ী ঠিকানা</Label>
          <Textarea id="address_permanent" name="address_permanent" rows={2} />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="previous_school">পূর্ববর্তী স্কুল</Label>
          <Input id="previous_school" name="previous_school" />
        </div>
      </fieldset>

      {state && !state.ok ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending || !resolvedSectionId}
          className="bg-gradient-primary text-white"
        >
          {pending ? "ভর্তি হচ্ছে..." : "ভর্তি করুন"}
        </Button>
      </div>
    </form>
  );
}
