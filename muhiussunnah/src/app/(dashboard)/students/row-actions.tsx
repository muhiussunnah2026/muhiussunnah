"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Printer, Receipt, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteStudentAction } from "@/server/actions/students";
import type { ActionResult } from "@/server/actions/_helpers";

/**
 * Per-row action icons for the students table.
 * Matches the competitor layout: Print admission / Admission invoice /
 * Edit / Delete — all with tooltips on hover.
 */
export function StudentRowActions({
  schoolSlug,
  studentId,
  studentName,
}: {
  schoolSlug: string;
  studentId: string;
  studentName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    deleteStudentAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "মুছে ফেলা হয়েছে");
      setConfirming(false);
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconLink
        href={`/students/${studentId}/print?type=admission`}
        tooltip="ভর্তি প্রিন্ট"
        icon={<Printer className="size-4" />}
        tone="primary"
        target="_blank"
      />
      <IconLink
        href={`/students/${studentId}/print?type=invoice`}
        tooltip="ভর্তি ইনভয়েস"
        icon={<Receipt className="size-4" />}
        tone="accent"
        target="_blank"
      />
      <IconLink
        href={`/students/${studentId}/edit`}
        tooltip="সম্পাদনা"
        icon={<Pencil className="size-4" />}
        tone="success"
      />
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={iconButtonClasses("danger")}
        aria-label="মুছে ফেলুন"
      >
        <Trash2 className="size-4" />
        <Tooltip label="মুছে ফেলুন" />
      </button>

      {/* Confirm-delete modal */}
      {confirming ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setConfirming(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl shadow-destructive/10">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">এই শিক্ষার্থী মুছে ফেলবেন?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">{studentName}</strong> এর স্ট্যাটাস{" "}
                  <span className="font-semibold text-destructive">বাদ</span> (dropped) করা হবে।
                  ইতিহাস (উপস্থিতি, মার্ক, লেজার) সংরক্ষিত থাকবে — পরে status পরিবর্তন করে
                  পুনরায় সক্রিয় করা যাবে।
                </p>
              </div>
            </div>

            <form ref={formRef} action={action} className="mt-5 flex items-center justify-end gap-2">
              <input type="hidden" name="schoolSlug" value={schoolSlug} />
              <input type="hidden" name="student_id" value={studentId} />
              <button
                type="button"
                onClick={() => !pending && setConfirming(false)}
                disabled={pending}
                className="rounded-md border border-border/60 bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    মুছছে…
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    হ্যাঁ, মুছে ফেলুন
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type Tone = "primary" | "accent" | "success" | "danger";

function iconButtonClasses(tone: Tone) {
  const tones: Record<Tone, string> = {
    primary: "text-primary hover:bg-primary/10 hover:text-primary",
    accent: "text-accent hover:bg-accent/10 hover:text-accent-foreground",
    success: "text-success hover:bg-success/10 hover:text-success",
    danger: "text-destructive hover:bg-destructive/10 hover:text-destructive",
  };
  return cn(
    "group/action relative inline-flex size-8 items-center justify-center rounded-md transition-colors",
    tones[tone],
  );
}

function IconLink({
  href,
  tooltip,
  icon,
  tone,
  target,
}: {
  href: string;
  tooltip: string;
  icon: React.ReactNode;
  tone: Tone;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={iconButtonClasses(tone)}
      aria-label={tooltip}
      prefetch={false}
    >
      {icon}
      <Tooltip label={tooltip} />
    </Link>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover/action:opacity-100"
    >
      {label}
    </span>
  );
}
