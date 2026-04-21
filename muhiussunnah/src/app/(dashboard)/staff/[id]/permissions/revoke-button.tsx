"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revokePermissionAction } from "@/server/actions/staff";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; permissionId: string; schoolUserId: string };

export function RevokeButton({ schoolSlug, permissionId, schoolUserId }: Props) {
  const t = useTranslations("staff");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(revokePermissionAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("perm_revoked"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="permissionId" value={permissionId} />
      <input type="hidden" name="schoolUserId" value={schoolUserId} />
      <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} aria-label="Revoke">
        <X className="size-4 text-destructive" />
      </Button>
    </form>
  );
}
