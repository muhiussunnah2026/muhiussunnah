"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { addBranchAction } from "@/server/actions/school";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddBranchForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addBranchAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "শাখা যোগ হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">শাখার নাম</Label>
        <Input id="name" name="name" required placeholder="যেমন: উত্তরা ক্যাম্পাস" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">ঠিকানা</Label>
        <Textarea id="address" name="address" rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">ফোন</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_primary" />
        প্রধান শাখা (পূর্বের প্রধান শাখা স্বয়ংক্রিয়ভাবে সরে যাবে)
      </label>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "যোগ হচ্ছে..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
