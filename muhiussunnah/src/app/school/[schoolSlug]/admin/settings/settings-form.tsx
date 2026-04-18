"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSchoolAction } from "@/server/actions/school";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = {
  schoolSlug: string;
  initial: {
    name_bn: string; name_en: string | null; eiin: string | null;
    type: "school" | "madrasa" | "both"; address: string | null; phone: string | null;
    email: string | null; website: string | null;
  };
};

export function SchoolSettingsForm({ schoolSlug, initial }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateSchoolAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">স্কুলের নাম (বাংলা)</Label>
        <Input id="name_bn" name="name_bn" required defaultValue={initial.name_bn} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">School name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={initial.name_en ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">ধরন</Label>
          <Select name="type" defaultValue={initial.type}>
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="school">স্কুল</SelectItem>
              <SelectItem value="madrasa">মাদ্রাসা</SelectItem>
              <SelectItem value="both">স্কুল + মাদ্রাসা</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eiin">EIIN</Label>
          <Input id="eiin" name="eiin" defaultValue={initial.eiin ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">ঠিকানা</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={initial.address ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">ফোন</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initial.phone ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">ওয়েবসাইট</Label>
        <Input id="website" name="website" type="url" placeholder="https://" defaultValue={initial.website ?? ""} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2 bg-gradient-primary text-white">
        {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
