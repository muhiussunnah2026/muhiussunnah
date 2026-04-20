"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addClassAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

type Branch = { id: string; name: string };

type Props = {
  schoolSlug: string;
  branches: Branch[];
};

export function AddClassForm({ schoolSlug, branches }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addClassAction,
    null,
  );

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
        <Input id="name_bn" name="name_bn" required placeholder="যেমন: ক্লাস ৬" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" placeholder="e.g. Class 6" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stream">স্ট্রিম</Label>
          <Select name="stream" defaultValue="general">
            <SelectTrigger id="stream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">সাধারণ</SelectItem>
              <SelectItem value="science">বিজ্ঞান</SelectItem>
              <SelectItem value="commerce">ব্যবসায়</SelectItem>
              <SelectItem value="arts">মানবিক</SelectItem>
              <SelectItem value="hifz">হিফজ</SelectItem>
              <SelectItem value="kitab">কিতাব</SelectItem>
              <SelectItem value="nazera">নাজেরা</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display_order">ক্রম</Label>
          <Input id="display_order" name="display_order" type="number" min={0} defaultValue={0} />
        </div>
      </div>

      {branches.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch_id">শাখা (ঐচ্ছিক)</Label>
          <Select name="branch_id">
            <SelectTrigger id="branch_id">
              <SelectValue placeholder="সকল শাখায়" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "যোগ হচ্ছে..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
