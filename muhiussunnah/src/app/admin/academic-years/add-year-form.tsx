"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addAcademicYearAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddYearForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addAcademicYearAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">নাম</Label>
        <Input id="name" name="name" required placeholder="যেমন: ২০২৫-২০২৬" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">শুরু</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">শেষ</Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_active" /> সক্রিয় করুন (পূর্বের সক্রিয় বছর স্বয়ংক্রিয়ভাবে সরে যাবে)
      </label>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
