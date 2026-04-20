"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSmsTemplateAction } from "@/server/actions/sms-templates";

export function DeleteTemplateButton({ schoolSlug, id }: { schoolSlug: string; id: string }) {
  const [state, action, pending] = useActionState(deleteSmsTemplateAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "মুছে ফেলা হয়েছে।");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="id" value={id} />
      <Button variant="ghost" size="sm" type="submit" disabled={pending}>
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
