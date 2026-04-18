"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { computeRiskScoresAction } from "@/server/actions/insights";
import { Sparkles } from "lucide-react";

export function ComputeRiskButton({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState(computeRiskScoresAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "গণনা সম্পন্ন।");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <Button type="submit" disabled={pending}>
        <Sparkles className="me-1.5 size-4" />
        {pending ? "গণনা হচ্ছে..." : "ঝুঁকি স্কোর গণনা করুন"}
      </Button>
    </form>
  );
}
