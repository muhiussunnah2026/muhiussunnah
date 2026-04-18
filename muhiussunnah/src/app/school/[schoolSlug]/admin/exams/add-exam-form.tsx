"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExamAction } from "@/server/actions/exams";
import type { ActionResult } from "@/server/actions/_helpers";

type Year = { id: string; name: string; is_active: boolean };
type Props = { schoolSlug: string; years: Year[] };

export function AddExamForm({ schoolSlug, years }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addExamAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "তৈরি হয়েছে");
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  const activeYear = years.find((y) => y.is_active);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">নাম</Label>
        <Input id="name" name="name" required placeholder="যেমন: ২য় সাময়িক পরীক্ষা" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">ধরন</Label>
          <Select name="type" defaultValue="term">
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="term">সাময়িক</SelectItem>
              <SelectItem value="annual">বার্ষিক</SelectItem>
              <SelectItem value="model_test">মডেল টেস্ট</SelectItem>
              <SelectItem value="monthly">মাসিক</SelectItem>
              <SelectItem value="other">অন্যান্য</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="academic_year_id">শিক্ষাবর্ষ</Label>
          <Select name="academic_year_id" defaultValue={activeYear?.id} required>
            <SelectTrigger id="academic_year_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
            <SelectContent>
              {years.map((y) => (<SelectItem key={y.id} value={y.id}>{y.name}{y.is_active ? " (সক্রিয়)" : ""}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">শুরু</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">শেষ</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>
      <Button type="submit" disabled={pending || years.length === 0} className="mt-1 bg-gradient-primary text-white">
        {pending ? "তৈরি হচ্ছে..." : "পরীক্ষা তৈরি"}
      </Button>
    </form>
  );
}
