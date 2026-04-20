"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateFeeHeadAmountAction } from "@/server/actions/fees";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; id: string; defaultAmount: number };

export function UpdateAmountForm({ schoolSlug, id, defaultAmount }: Props) {
  const [value, setValue] = useState(String(defaultAmount));
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateFeeHeadAmountAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট");
    else toast.error(state.error);
  }, [state]);

  const changed = Number(value) !== Number(defaultAmount);

  return (
    <form action={action} className="flex items-center justify-end gap-2">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="id" value={id} />
      <span className="text-sm text-muted-foreground">৳</span>
      <Input
        name="default_amount"
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-28 text-right"
      />
      {changed ? (
        <Button type="submit" size="icon-sm" disabled={pending} aria-label="Save" className="bg-gradient-primary text-white">
          <Check className="size-3.5" />
        </Button>
      ) : null}
    </form>
  );
}
