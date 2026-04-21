"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
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

const streamLabel: Record<string, string> = {
  general: "সাধারণ", science: "বিজ্ঞান", commerce: "ব্যবসায়", arts: "মানবিক",
  hifz: "হিফজ", kitab: "কিতাব", nazera: "নাজেরা",
};

export function ClassSectionList({
  schoolSlug,
  classes,
  classStudentCounts = {},
  sectionStudentCounts = {},
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Helpful hint — 90% of institutes don't need sections */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-3.5 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground">সেকশন ঐচ্ছিক — শুধু ক্লাস দিলেই চলবে।</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            বেশিরভাগ প্রতিষ্ঠানে সেকশন লাগে না। আপনার প্রতিষ্ঠানে একাধিক সেকশন থাকলে (যেমন Class 7 - A, B, C) নিচে &ldquo;সেকশন ব্যবস্থাপনা&rdquo; বাটন থেকে যোগ করতে পারেন।
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
                  title="এই ক্লাসের সব শিক্ষার্থী দেখুন"
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
                  title="এই ক্লাসের সব শিক্ষার্থী দেখুন"
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
                    ছাত্র/ছাত্রী
                  </span>
                </Link>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                স্ট্রিম: {streamLabel[data.stream] ?? data.stream}
                {hasMeaningfulSections ? (
                  <>
                    {" "}· সেকশন: <BanglaDigit value={data.sections.length} />
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
                aria-label="Edit class"
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
          সেকশন ব্যবস্থাপনা
          {hasMeaningfulSections ? (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              <BanglaDigit value={data.sections.length} />
            </span>
          ) : (
            <span className="ml-1 text-[10px] text-muted-foreground/70">(ঐচ্ছিক)</span>
          )}
        </button>

        {showSections ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border/50 bg-muted/20 p-3">
            {data.sections.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                এই ক্লাসে এখনও কোন সেকশন যোগ করা হয়নি। নিচের বাটনে ক্লিক করে যোগ করুন।
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
                      title="এই সেকশনের শিক্ষার্থী দেখুন"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        · <BanglaDigit value={n} /> জন
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
              {showAddSection ? "বাতিল" : "নতুন সেকশন যোগ"}
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
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateClassAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "আপডেট হয়েছে");
      onDone();
    } else {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="classId" value={cls.id} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-bn-${cls.id}`} className="text-xs">নাম (বাংলা) *</Label>
          <Input id={`edit-bn-${cls.id}`} name="name_bn" defaultValue={cls.name_bn} required className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-en-${cls.id}`} className="text-xs">Name (English)</Label>
          <Input id={`edit-en-${cls.id}`} name="name_en" defaultValue={cls.name_en ?? ""} className="h-9" />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-stream-${cls.id}`} className="text-xs">স্ট্রিম</Label>
          <Select name="stream" defaultValue={cls.stream}>
            <SelectTrigger id={`edit-stream-${cls.id}`} className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">সাধারণ</SelectItem>
              <SelectItem value="science">বিজ্ঞান</SelectItem>
              <SelectItem value="commerce">ব্যবসায়</SelectItem>
              <SelectItem value="arts">মানবিক</SelectItem>
              <SelectItem value="hifz">হিফজ</SelectItem>
              <SelectItem value="kitab">কিতাব</SelectItem>
              <SelectItem value="nazera">নাজেরা</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`edit-order-${cls.id}`} className="text-xs">ক্রম</Label>
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
          {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}

function AddSectionInline({ schoolSlug, classId, onDone }: { schoolSlug: string; classId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addSectionAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "সেকশন যোগ হয়েছে"); onDone(); }
    else toast.error(state.error);
  }, [state, onDone]);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="class_id" value={classId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`name-${classId}`} className="text-xs">সেকশনের নাম</Label>
        <Input id={`name-${classId}`} name="name" required placeholder="যেমন: ক" className="h-8 w-24" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`cap-${classId}`} className="text-xs">ধারণক্ষমতা</Label>
        <Input id={`cap-${classId}`} name="capacity" type="number" min={0} placeholder="৪০" className="h-8 w-24" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`room-${classId}`} className="text-xs">রুম</Label>
        <Input id={`room-${classId}`} name="room" placeholder="১০১" className="h-8 w-20" />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="bg-gradient-primary text-white">
        {pending ? "..." : "যোগ"}
      </Button>
    </form>
  );
}

function DeleteClassButton({ schoolSlug, classId }: { schoolSlug: string; classId: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteClassAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "মুছে ফেলা হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} onSubmit={(e) => { if (!confirm("আপনি কি নিশ্চিত? সেকশন ও ছাত্রও মুছে যেতে পারে।")) e.preventDefault(); }}>
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="classId" value={classId} />
      <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} aria-label="Delete class" className="hover:bg-destructive/10">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}
