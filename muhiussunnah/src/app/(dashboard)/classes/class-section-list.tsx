"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Pencil, Check, Info, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { deleteClassAction, updateClassAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassRow = {
  id: string;
  name_bn: string;
  name_en: string | null;
  stream: string;
  display_order: number;
  /** Kept in the type because the parent page still fetches it, but we
      don't render it — the section concept is hidden in the UI. */
  sections: { id: string; name: string; capacity: number | null; room: string | null }[];
};

type Props = {
  schoolSlug: string;
  classes: ClassRow[];
  classStudentCounts?: Record<string, number>;
  /** Still in the prop shape so /classes page doesn't need to change;
      unused in this component after the section UI was removed. */
  sectionStudentCounts?: Record<string, number>;
};

/** Map a stream enum → translation key under `classes.stream_*`. */
function streamKey(stream: string): string {
  return `stream_${stream}`;
}

/**
 * Sections used to be editable inline on each class card — a section
 * list, an add-section form, capacity/room inputs. That surface area
 * produced a steady stream of subtle bugs (orphan students, duplicate
 * codes, inconsistent counts across pages). Most schools never needed
 * sections in the first place.
 *
 * Product decision: hide sections completely. Schools that DO want
 * multiple sections of the same class just create separate classes
 * named like "Class Five (A)" / "Class Five (B)". The banner at the
 * top of the list tells them this. A default section still exists in
 * the DB for each class (auto-created by ensureDefaultSections) so
 * downstream features like attendance / marks / online classes that
 * wire off section_id keep working — users simply never see them.
 */
export function ClassSectionList({
  schoolSlug,
  classes,
  classStudentCounts = {},
}: Props) {
  const t = useTranslations("classes");
  return (
    <div className="flex flex-col gap-4">
      {/* Hint — tell principals how to handle multi-section classes
          without exposing the "section" concept at all. */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-3.5 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground">{t("multi_section_hint_title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("multi_section_hint_body")}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            data={c}
            schoolSlug={schoolSlug}
            classStudentCount={classStudentCounts[c.id] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function ClassCard({
  schoolSlug,
  data,
  classStudentCount,
}: {
  schoolSlug: string;
  data: ClassRow;
  classStudentCount: number;
}) {
  const t = useTranslations("classes");
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        {editing ? (
          <EditClassInline
            cls={data}
            onDone={() => setEditing(false)}
            schoolSlug={schoolSlug}
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Class name — click to see the class's student list */}
                <Link
                  href={`/students?class_id=${data.id}`}
                  className="group/cls inline-flex items-center gap-1.5 text-base font-semibold transition-colors hover:text-primary"
                  title={t("count_students_tooltip")}
                >
                  <span className="underline-offset-4 group-hover/cls:underline">
                    {data.name_bn}
                  </span>
                  {data.name_en ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({data.name_en})
                    </span>
                  ) : null}
                  <ArrowRight className="size-3.5 opacity-0 -translate-x-1 transition-all group-hover/cls:opacity-100 group-hover/cls:translate-x-0" />
                </Link>

                {/* Student-count pill */}
                <Link
                  href={`/students?class_id=${data.id}`}
                  className={
                    classStudentCount > 0
                      ? "group/count inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 px-3 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20"
                      : "inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border/60 bg-muted/40 px-3 py-1.5"
                  }
                  title={t("count_students_tooltip")}
                >
                  <Users
                    className={
                      classStudentCount > 0
                        ? "size-4 text-primary"
                        : "size-4 text-muted-foreground/60"
                    }
                  />
                  <span
                    className={
                      classStudentCount > 0
                        ? "text-lg font-extrabold tabular-nums bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent"
                        : "text-lg font-bold tabular-nums text-muted-foreground"
                    }
                  >
                    <BanglaDigit value={classStudentCount} />
                  </span>
                  <span
                    className={
                      classStudentCount > 0
                        ? "text-[11px] font-medium uppercase tracking-wider text-primary/80"
                        : "text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    }
                  >
                    {t("count_students")}
                  </span>
                </Link>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("stream_label")}{" "}
                {(() => {
                  try {
                    return t(streamKey(data.stream));
                  } catch {
                    return data.stream;
                  }
                })()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                aria-label={t("edit_class_aria")}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteClassButton classId={data.id} schoolSlug={schoolSlug} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EditClassInline({
  schoolSlug,
  cls,
  onDone,
}: {
  schoolSlug: string;
  cls: ClassRow;
  onDone: () => void;
}) {
  const t = useTranslations("classes");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateClassAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("edit_success"));
      onDone();
    } else {
      toast.error(state.error);
    }
  }, [state, onDone, t]);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="classId" value={cls.id} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-bn-${cls.id}`} className="text-xs">{t("edit_bn")}</Label>
          <Input id={`edit-bn-${cls.id}`} name="name_bn" defaultValue={cls.name_bn} required className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-en-${cls.id}`} className="text-xs">{t("edit_en")}</Label>
          <Input id={`edit-en-${cls.id}`} name="name_en" defaultValue={cls.name_en ?? ""} className="h-9" />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-stream-${cls.id}`} className="text-xs">{t("edit_stream")}</Label>
          <Select name="stream" defaultValue={cls.stream}>
            <SelectTrigger id={`edit-stream-${cls.id}`} className="h-9">
              <SelectValue>
                {(v: unknown) => {
                  const key = typeof v === "string" ? v : cls.stream;
                  try {
                    return t(streamKey(key));
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
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-order-${cls.id}`} className="text-xs">{t("edit_order")}</Label>
          <Input
            id={`edit-order-${cls.id}`}
            name="display_order"
            type="number"
            min={0}
            defaultValue={cls.display_order}
            className="h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending} className="gap-1">
          <Check className="size-3.5" />
          {pending ? t("edit_saving") : t("edit_save")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          {t("edit_cancel")}
        </Button>
      </div>
    </form>
  );
}

function DeleteClassButton({ schoolSlug, classId }: { schoolSlug: string; classId: string }) {
  const t = useTranslations("classes");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteClassAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("delete_success"));
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="classId" value={classId} />
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={pending}
        aria-label={t("delete_class_aria")}
        className="hover:bg-destructive/10"
        onClick={async () => {
          const ok = await confirmDialog({
            title: t("delete_class_confirm"),
            tone: "destructive",
          });
          if (ok) formRef.current?.requestSubmit();
        }}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}
