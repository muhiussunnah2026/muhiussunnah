"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Pencil, Printer, Receipt, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteStudentAction,
  permanentDeleteStudentAction,
} from "@/server/actions/students";
import type { ActionResult } from "@/server/actions/_helpers";

/**
 * Per-row action icons for the students table.
 * Matches the competitor layout: Print admission / Admission invoice /
 * Edit / Delete — all with tooltips on hover.
 *
 * Delete opens a modal (React portal → document.body so it escapes any
 * transformed table ancestor) with TWO options:
 *   • "বাদ দিন (পুনরুদ্ধারযোগ্য)" — soft delete (status = dropped)
 *   • "স্থায়ীভাবে মুছুন" — hard delete from DB (admin-client, cascades
 *     student_guardians)
 */
export function StudentRowActions({
  schoolSlug,
  studentId,
  studentCode,
  studentName,
}: {
  schoolSlug: string;
  /** DB UUID — used in the form's hidden input for reliable server action lookup. */
  studentId: string;
  /** Human-readable code (e.g. "202601") — used in URL paths so the address bar stays clean. Falls back to UUID if empty. */
  studentCode?: string | null;
  studentName: string;
}) {
  // Prefer the short code in URLs; fall back to UUID for legacy rows
  // whose code hasn't been backfilled yet.
  const urlId = studentCode && studentCode.trim().length > 0 ? studentCode : studentId;
  const [confirming, setConfirming] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [softState, softAction, softPending] = useActionState<ActionResult | null, FormData>(
    deleteStudentAction,
    null,
  );
  const [hardState, hardAction, hardPending] = useActionState<ActionResult | null, FormData>(
    permanentDeleteStudentAction,
    null,
  );

  useEffect(() => {
    if (!softState) return;
    if (softState.ok) {
      toast.success(softState.message ?? "বাদ দেওয়া হয়েছে");
      setConfirming(false);
    } else {
      toast.error(softState.error);
    }
  }, [softState]);

  useEffect(() => {
    if (!hardState) return;
    if (hardState.ok) {
      toast.success(hardState.message ?? "স্থায়ীভাবে মুছে ফেলা হয়েছে");
      setConfirming(false);
    } else {
      toast.error(hardState.error);
    }
  }, [hardState]);

  const pending = softPending || hardPending;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <IconLink
        href={`/students/${urlId}/print?type=admission`}
        tooltip="ভর্তি প্রিন্ট"
        icon={<Printer className="size-4" />}
        tone="primary"
        target="_blank"
      />
      <IconLink
        href={`/students/${urlId}/print?type=invoice`}
        tooltip="ভর্তি ইনভয়েস"
        icon={<Receipt className="size-4" />}
        tone="accent"
        target="_blank"
      />
      <IconLink
        href={`/students/${urlId}/edit`}
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

      {confirming && mounted
        ? createPortal(
            <ConfirmDeleteModal
              studentName={studentName}
              schoolSlug={schoolSlug}
              studentId={studentId}
              softAction={softAction}
              hardAction={hardAction}
              softPending={softPending}
              hardPending={hardPending}
              onCancel={() => !pending && setConfirming(false)}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

function ConfirmDeleteModal({
  studentName,
  schoolSlug,
  studentId,
  softAction,
  hardAction,
  softPending,
  hardPending,
  onCancel,
}: {
  studentName: string;
  schoolSlug: string;
  studentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  softAction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hardAction: any;
  softPending: boolean;
  hardPending: boolean;
  onCancel: () => void;
}) {
  const pending = softPending || hardPending;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-foreground/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-destructive/30 bg-card shadow-2xl shadow-destructive/10">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-tight break-words">
                {studentName} কে কীভাবে মুছবেন?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed break-words">
                দুটো অপশন আছে। ইতিহাস (উপস্থিতি, মার্ক, লেজার) দুইটাই ক্ষেত্রে সংরক্ষিত থাকে।
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="mt-5 grid gap-3">
            <form action={softAction}>
              <input type="hidden" name="schoolSlug" value={schoolSlug} />
              <input type="hidden" name="student_id" value={studentId} />
              <button
                type="submit"
                disabled={pending}
                className="group/opt w-full rounded-xl border-2 border-warning/30 bg-warning/5 p-4 text-start transition hover:border-warning/50 hover:bg-warning/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
                    {softPending ? <Loader2 className="size-4 animate-spin" /> : "1"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      বাদ দিন <span className="font-normal text-muted-foreground">(পুনরুদ্ধারযোগ্য)</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">
                      স্ট্যাটাস <strong>dropped</strong> হবে। তালিকা থেকে সরে যাবে কিন্তু
                      রেকর্ড থাকবে। পরে status পরিবর্তন করে আবার সক্রিয় করা যাবে।
                    </p>
                  </div>
                </div>
              </button>
            </form>

            <form action={hardAction}>
              <input type="hidden" name="schoolSlug" value={schoolSlug} />
              <input type="hidden" name="student_id" value={studentId} />
              <button
                type="submit"
                disabled={pending}
                className="group/opt w-full rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 text-start transition hover:border-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
                    {hardPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-destructive">
                      স্থায়ীভাবে মুছুন <span className="font-normal text-destructive/70">(অপরিবর্তনীয়)</span>
                    </div>
                    <p className="mt-1 text-xs text-destructive/80 leading-snug">
                      শিক্ষার্থীর মূল রেকর্ড ডেটাবেস থেকে একেবারে মুছে যাবে।
                      ⚠️ এটি আর পুনরুদ্ধার করা যাবে না।
                    </p>
                  </div>
                </div>
              </button>
            </form>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-md border border-border/60 bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              বাতিল
            </button>
          </div>
        </div>
      </div>
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
