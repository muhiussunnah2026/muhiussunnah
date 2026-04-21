"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("classes");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addClassAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("add_success"));
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">{t("add_name_bn")}</Label>
        <Input id="name_bn" name="name_bn" required placeholder={t("add_name_bn_placeholder")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">{t("add_name_en")}</Label>
        <Input id="name_en" name="name_en" placeholder={t("add_name_en_placeholder")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stream">{t("add_stream")}</Label>
          <Select name="stream" defaultValue="general">
            <SelectTrigger id="stream">
              <SelectValue>
                {(v: unknown) => {
                  const key = typeof v === "string" ? v : "general";
                  const streamKey = `stream_${key}` as const;
                  // Fall back to raw key if translation missing so we
                  // never render an empty trigger.
                  try {
                    return t(streamKey);
                  } catch {
                    return key;
                  }
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t("stream_general")}</SelectItem>
              <SelectItem value="science">{t("stream_science")}</SelectItem>
              <SelectItem value="commerce">{t("stream_commerce")}</SelectItem>
              <SelectItem value="arts">{t("stream_arts")}</SelectItem>
              <SelectItem value="hifz">{t("stream_hifz")}</SelectItem>
              <SelectItem value="kitab">{t("stream_kitab")}</SelectItem>
              <SelectItem value="nazera">{t("stream_nazera")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display_order">{t("add_order")}</Label>
          <Input id="display_order" name="display_order" type="number" min={0} defaultValue={0} />
        </div>
      </div>

      {branches.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch_id">{t("add_branch")}</Label>
          <Select name="branch_id">
            <SelectTrigger id="branch_id">
              <SelectValue placeholder={t("add_branch_placeholder")} />
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
        {pending ? t("add_submitting") : t("add_submit")}
      </Button>
    </form>
  );
}
