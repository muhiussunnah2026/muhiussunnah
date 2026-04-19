"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2, Plus, X, Pencil, Check } from "lucide-react";
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

type Props = { schoolSlug: string; classes: ClassRow[] };

const streamLabel: Record<string, string> = {
  general: "সাধারণ", science: "বিজ্ঞান", commerce: "ব্যবসায়", arts: "মানবিক",
  hifz: "হিফজ", kitab: "কিতাব", nazera: "নাজেরা",
};

export function ClassSectionList({ schoolSlug, classes }: Props) {
  return (
    <div className="grid gap-3">
      {classes.map((c) => (
        <ClassCard key={c.id} schoolSlug={schoolSlug} data={c} />
      ))}
    </div>
  );
}

function ClassCard({ schoolSlug, data }: { schoolSlug: string; data: ClassRow }) {
  const [showAddSection, setShowAddSection] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        {editing ? (
          <EditClassInline
            schoolSlug={schoolSlug}
            cls={data}
            onDone={() => setEditing(false)}
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">
                {data.name_bn}
                {data.name_en ? <span className="ml-2 text-xs text-muted-foreground">({data.name_en})</span> : null}
              </h3>
              <p className="text-xs text-muted-foreground">
                স্ট্রিম: {streamLabel[data.stream] ?? data.stream} · সেকশন: <BanglaDigit value={data.sections.length} />
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
              <DeleteClassButton schoolSlug={schoolSlug} classId={data.id} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {data.sections.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs">
              {s.name}
              {s.capacity !== null ? <span className="text-muted-foreground">· <BanglaDigit value={s.capacity} /> ধারণ</span> : null}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setShowAddSection((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs text-primary transition hover:bg-primary/5"
          >
            {showAddSection ? <X className="size-3" /> : <Plus className="size-3" />}
            {showAddSection ? "বাতিল" : "সেকশন যোগ"}
          </button>
        </div>

        {showAddSection ? <AddSectionInline schoolSlug={schoolSlug} classId={data.id} onDone={() => setShowAddSection(false)} /> : null}
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
