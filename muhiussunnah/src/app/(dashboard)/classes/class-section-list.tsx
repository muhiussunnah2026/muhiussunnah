"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Plus, X, Pencil, Check, Info, ChevronDown, ChevronUp, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { deleteClassAction, addSectionAction, updateClassAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassRow = {
  id: string;
  name_bn: string;
  name_en: string | null;
  stream: string;
  display_order: number;
  sections: { id: string; name: string; capacity: number | null; room: string | null }[];
};

type Props = {
  schoolSlug: string;
  classes: ClassRow[];
  /** classId → total active students in that class */
  classStudentCounts?: Record<string, number>;
  /** sectionId → active students in that section */
  sectionStudentCounts?: Record<string, number>;
};

/** Map a stream enum → translation key under `classes.stream_*`. */
function streamKey(stream: string): string {
  return `stream_${stream}`;
}

export function ClassSectionList({
  schoolSlug,
  classes,
  classStudentCounts = {},
  sectionStudentCounts = {},
}: Props) {
  const t = useTranslations("classes");
  return (
    <div className="flex flex-col gap-4">
      {/* Helpful hint — 90% of institutes don't need sections */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-3.5 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground">{t("banner_title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("banner_body")}
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
            sectionStudentCounts={sectionStudentCounts}
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
  sectionStudentCounts,
}: {
  schoolSlug: string;
  data: ClassRow;
  classStudentCount: number;
  sectionStudentCounts: Record<string, number>;
}) {
  const t = useTranslations("classes");
  const [showAddSection, setShowAddSection] = useState(false);
  const [editing, setEditing] = useState(false);
  // Default: show sections only if there are actually custom sections
  // (more than 1, or 1 that isn't the auto-default "ক"). Otherwise keep
  // the UI clean — principals never think about sections.
  const hasMeaningfulSections =
    data.sections.length > 1 ||
    (data.sections.length === 1 && data.sections[0]?.name !== "ক");
  const [showSections, setShowSections] = useState<boolean>(hasMeaningfulSections);
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
                {/* Class name — click to see that class's student list */}
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

                {/* Prominent student-count pill — hero stat of the card */}
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
                {hasMeaningfulSections ? (
                  <>
                    {" "}· {t("section_label")} <BanglaDigit value={data.sections.length} />
                  </>
                ) : null}
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

        {/* Section management — collapsed by default for institutes that
            don't use sections. Principal sees a clean card. */}
        <button
          type="button"
          onClick={() => setShowSections((v) => !v)}
          className="flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
        >
          {showSections ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {t("section_mgmt_toggle")}
          {hasMeaningfulSections ? (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              <BanglaDigit value={data.sections.length} />
            </span>
          ) : (
            <span className="ml-1 text-[10px] text-muted-foreground/70">{t("section_optional_badge")}</span>
          )}
        </button>

        {showSections ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/50 bg-muted/20 p-3">
            {data.sections.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("no_sections_yet")}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {data.sections.map((s) => {
                  const n = sectionStudentCounts[s.id] ?? 0;
                  return (
                    <Link
                      key={s.id}
                      href={`/students?section_id=${s.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs transition hover:border-primary/40 hover:bg-primary/5"
                      title={t("section_tooltip")}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        · <BanglaDigit value={n} /> {t("section_students_suffix")}
                      </span>
                      {s.capacity !== null ? (
                        <span className="text-muted-foreground">
                          / <BanglaDigit value={s.capacity} />
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAddSection((v) => !v)}
              className="inline-flex items-center gap-1 self-start rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs text-primary transition hover:bg-primary/5"
            >
              {showAddSection ? <X className="size-3" /> : <Plus className="size-3" />}
              {showAddSection ? t("cancel_add") : t("add_section_button")}
            </button>
            {showAddSection ? <AddSectionInline classId={data.id} onDone={() => setShowAddSection(false)} schoolSlug={schoolSlug} /> : null}
          </div>
        ) : null}
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

function AddSectionInline({ schoolSlug, classId, onDone }: { schoolSlug: string; classId: string; onDone: () => void }) {
  const t = useTranslations("classes");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addSectionAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("section_add_success")); onDone(); }
    else toast.error(state.error);
  }, [state, onDone, t]);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="class_id" value={classId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`name-${classId}`} className="text-xs">{t("section_name_label")}</Label>
        <Input id={`name-${classId}`} name="name" required placeholder={t("section_name_placeholder")} className="h-8 w-24" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`cap-${classId}`} className="text-xs">{t("section_capacity_label")}</Label>
        <Input id={`cap-${classId}`} name="capacity" type="number" min={0} placeholder={t("section_capacity_placeholder")} className="h-8 w-24" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`room-${classId}`} className="text-xs">{t("section_room_label")}</Label>
        <Input id={`room-${classId}`} name="room" placeholder={t("section_room_placeholder")} className="h-8 w-20" />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="bg-gradient-primary text-white">
        {pending ? t("section_add_submitting") : t("section_add_submit")}
      </Button>
    </form>
  );
}

function DeleteClassButton({ schoolSlug, classId }: { schoolSlug: string; classId: string }) {
  const t = useTranslations("classes");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteClassAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("delete_success"));
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form action={action} onSubmit={(e) => { if (!confirm(t("delete_class_confirm"))) e.preventDefault(); }}>
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="classId" value={classId} />
      <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} aria-label={t("delete_class_aria")} className="hover:bg-destructive/10">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}
