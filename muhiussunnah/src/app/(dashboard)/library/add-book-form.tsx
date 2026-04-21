"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBookAction } from "@/server/actions/operations";

export function AddBookForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("library");
  const [state, action, pending] = useActionState(addBookAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("add_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("add_title_label")}</Label>
        <Input name="title" placeholder={t("add_title_placeholder")} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("add_author")}</Label>
          <Input name="author" placeholder="Author" />
        </div>
        <div>
          <Label>{t("add_isbn")}</Label>
          <Input name="isbn" placeholder="ISBN" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("add_category_label")}</Label>
          <Input name="category" placeholder={t("add_category_placeholder")} />
        </div>
        <div>
          <Label>{t("add_shelf_label")}</Label>
          <Input name="shelf" placeholder="A-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("add_copies_label")}</Label>
          <Input name="copies_total" type="number" min={1} defaultValue={1} />
        </div>
        <div>
          <Label>{t("add_price_label")}</Label>
          <Input name="price" type="number" min={0} placeholder="0" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("add_adding") : t("add_cta")}
      </Button>
    </form>
  );
}
