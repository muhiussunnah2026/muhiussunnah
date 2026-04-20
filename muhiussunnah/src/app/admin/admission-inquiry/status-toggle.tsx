"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInquiryStatusAction } from "@/server/actions/admission-inquiry";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; id: string; currentStatus: string };

export function InquiryStatusToggle({ schoolSlug, id, currentStatus }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateInquiryStatusAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট হয়েছে");
    else toast.error(state.error);
  }, [state]);

  function handleChange(status: string | null) {
    if (!status) return;
    const fd = new FormData();
    fd.set("schoolSlug", schoolSlug);
    fd.set("id", id);
    fd.set("status", status);
    action(fd);
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-8 w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">নতুন</SelectItem>
        <SelectItem value="contacted">যোগাযোগ হয়েছে</SelectItem>
        <SelectItem value="visited">ভিজিট করেছে</SelectItem>
        <SelectItem value="admitted">ভর্তি হয়েছে</SelectItem>
        <SelectItem value="lost">হারিয়েছি</SelectItem>
      </SelectContent>
    </Select>
  );
}
