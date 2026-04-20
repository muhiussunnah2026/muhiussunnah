"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteBranchAction } from "@/server/actions/school";
import type { ActionResult } from "@/server/actions/_helpers";

type Branch = { id: string; name: string; address: string | null; phone: string | null; is_primary: boolean };

export function BranchList({ schoolSlug, branches }: { schoolSlug: string; branches: Branch[] }) {
  return (
    <div className="grid gap-3">
      {branches.map((b) => (
        <BranchCard key={b.id} data={b} schoolSlug={schoolSlug} />
      ))}
    </div>
  );
}

function BranchCard({ schoolSlug, data }: { schoolSlug: string; data: Branch }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteBranchAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "মুছে ফেলা হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            {data.name}
            {data.is_primary ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                প্রধান
              </span>
            ) : null}
          </h3>
          {data.address ? <p className="mt-1 text-sm text-muted-foreground">{data.address}</p> : null}
          {data.phone ? <p className="text-xs text-muted-foreground">ফোন: {data.phone}</p> : null}
        </div>
        {data.is_primary ? null : (
          <form
            action={action}
            onSubmit={(e) => {
              if (!confirm("এই শাখা মুছে ফেলবেন? সম্পর্কিত ডেটা বিচ্ছিন্ন হয়ে যাবে।")) e.preventDefault();
            }}
          >
            <input type="hidden" name="schoolSlug" value={schoolSlug} />
            <input type="hidden" name="branchId" value={data.id} />
            <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} aria-label="Delete branch">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
