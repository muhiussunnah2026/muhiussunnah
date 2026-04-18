"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addInvestmentAction } from "@/server/actions/investments";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddInvestmentForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addInvestmentAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">শিরোনাম</Label>
        <Input id="title" name="title" required placeholder="যেমন: FD @ Islami Bank" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="principal">মূলধন (৳)</Label>
          <Input id="principal" name="principal" type="number" min={0.01} step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="return_expected">প্রত্যাশিত রিটার্ন</Label>
          <Input id="return_expected" name="return_expected" type="number" min={0} step="0.01" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">শুরুর তারিখ *</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maturity_date">পরিপক্কতা</Label>
          <Input id="maturity_date" name="maturity_date" type="date" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">নোট</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
