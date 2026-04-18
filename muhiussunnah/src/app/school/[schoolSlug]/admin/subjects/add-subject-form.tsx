"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSubjectAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = { id: string; name_bn: string; name_en: string | null };

type Props = { schoolSlug: string; classes: ClassOption[] };

export function AddSubjectForm({ schoolSlug, classes }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addSubjectAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "সফল!");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">নাম (বাংলা)</Label>
        <Input id="name_bn" name="name_bn" required placeholder="যেমন: বাংলা" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_en">English</Label>
          <Input id="name_en" name="name_en" placeholder="Bengali" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_ar">العربية</Label>
          <Input id="name_ar" name="name_ar" placeholder="اللغة" dir="rtl" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="class_id">শ্রেণি (ঐচ্ছিক)</Label>
        <Select name="class_id">
          <SelectTrigger id="class_id">
            <SelectValue placeholder="সকল ক্লাসে প্রযোজ্য" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name_bn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">কোড</Label>
          <Input id="code" name="code" placeholder="BN101" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_marks">পূর্ণমান</Label>
          <Input id="full_marks" name="full_marks" type="number" min={1} defaultValue={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pass_marks">পাশ</Label>
          <Input id="pass_marks" name="pass_marks" type="number" min={0} defaultValue={33} />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_optional" />
        ঐচ্ছিক বিষয়
      </label>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "যোগ হচ্ছে..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
