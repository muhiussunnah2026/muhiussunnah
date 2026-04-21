"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentRowActions } from "./row-actions";
import { bulkDeleteStudentsAction } from "@/server/actions/students";

type Student = {
  id: string;
  student_code: string;
  name_bn: string;
  name_en: string | null;
  roll: number | null;
  gender: string | null;
  photo_url: string | null;
  status: string;
  guardian_phone: string | null;
  admission_date: string | null;
  sections: { id: string; name: string; classes: { name_bn: string } } | null;
};

type SortKey = "name" | "code" | "class" | "roll" | "admission" | "status";
type SortDir = "asc" | "desc";

const statusLabel: Record<string, string> = {
  active: "সক্রিয়",
  transferred: "বদলি হয়েছে",
  passed_out: "পাশ করেছে",
  dropped: "বাদ",
  suspended: "স্থগিত",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function StudentsTable({
  students,
  schoolSlug,
  schoolName,
}: {
  students: Student[];
  schoolSlug: string;
  schoolName: string;
}) {
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  // ── Sorting ───────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return students;
    const arr = [...students];
    const dir = sortDir === "asc" ? 1 : -1;
    const keyFns: Record<SortKey, (s: Student) => string | number> = {
      name: (s) => s.name_bn.toLowerCase(),
      code: (s) => s.student_code || "",
      class: (s) => s.sections?.classes?.name_bn ?? "zzz",
      roll: (s) => (s.roll ?? Number.MAX_SAFE_INTEGER),
      admission: (s) => s.admission_date ?? "9999-99-99",
      status: (s) => s.status,
    };
    const fn = keyFns[sortKey];
    arr.sort((a, b) => {
      const av = fn(a);
      const bv = fn(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [students, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visible = sorted.slice(startIdx, startIdx + pageSize);

  // ── Selection ─────────────────────────────────────────────
  const visibleIds = visible.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected = !allVisibleSelected && visibleIds.some((id) => selected.has(id));

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }
  function selectAllFiltered() {
    setSelected(new Set(sorted.map((s) => s.id)));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulkDelete(mode: "soft" | "hard") {
    if (selected.size === 0) return;
    const verb = mode === "soft" ? "বাদ দিতে" : "স্থায়ীভাবে মুছতে";
    const warn = mode === "hard"
      ? `⚠️ ${selected.size} জন শিক্ষার্থী স্থায়ীভাবে মুছে ফেলা হবে — এই কাজ উল্টানো যাবে না। নিশ্চিত?`
      : `${selected.size} জন শিক্ষার্থীকে "বাদ" status-এ পাঠানো হবে। নিশ্চিত?`;
    if (!confirm(warn)) return;

    const fd = new FormData();
    fd.append("schoolSlug", schoolSlug);
    fd.append("student_ids", [...selected].join(","));
    fd.append("mode", mode);

    startTransition(async () => {
      const res = await bulkDeleteStudentsAction(null, fd);
      if (res.ok) {
        toast.success(res.message ?? `${selected.size} জন ${verb.slice(0, -3)} হয়েছে`);
        clearSelection();
      } else {
        toast.error(res.error);
      }
    });
  }

  // ── Exports ───────────────────────────────────────────────
  // If there's an active selection, export/print operate on the selected
  // subset — otherwise on the full filtered list.
  const exportSource: Student[] = selected.size > 0
    ? sorted.filter((s) => selected.has(s.id))
    : sorted;

  function exportCsv() {
    const headers = ["Code", "Name (BN)", "Name (EN)", "Class", "Section", "Roll", "Gender", "Guardian Phone", "Status"];
    const rows = exportSource.map((s) => [
      s.student_code,
      s.name_bn,
      s.name_en ?? "",
      s.sections?.classes?.name_bn ?? "",
      s.sections?.name ?? "",
      s.roll?.toString() ?? "",
      s.gender ?? "",
      s.guardian_phone ?? "",
      statusLabel[s.status] ?? s.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${schoolSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${exportSource.length} টি রেকর্ড CSV-তে এক্সপোর্ট হয়েছে`);
  }

  async function copyClipboard() {
    const rows = exportSource.map((s) =>
      [
        s.student_code,
        s.name_bn,
        s.sections?.classes?.name_bn ?? "",
        s.sections?.name ?? "",
        s.roll ?? "",
        s.guardian_phone ?? "",
        statusLabel[s.status] ?? s.status,
      ].join("\t"),
    );
    const text = ["Code\tName\tClass\tSection\tRoll\tGuardian\tStatus", ...rows].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${exportSource.length} টি রেকর্ড ক্লিপবোর্ডে কপি হয়েছে`);
    } catch {
      toast.error("ক্লিপবোর্ড অ্যাক্সেস অনুমোদিত নয়");
    }
  }

  function printTable() {
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) {
      toast.error("পপ-আপ ব্লক হয়েছে — প্রিন্ট করতে অনুমোদন দিন");
      return;
    }
    const tableHtml = `
      <html>
        <head>
          <title>${schoolName} — শিক্ষার্থী তালিকা</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 4px; text-align: center; }
            h2 { font-size: 14px; margin: 0 0 16px; text-align: center; font-weight: normal; color: #444; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
            th { background: #eee; }
            @media print { body { margin: 10mm; } }
          </style>
        </head>
        <body>
          <h1>${schoolName}</h1>
          <h2>শিক্ষার্থী তালিকা — ${new Date().toLocaleDateString("bn-BD")}</h2>
          <table>
            <thead>
              <tr>
                <th>কোড</th><th>নাম</th><th>ক্লাস</th><th>শাখা</th><th>রোল</th><th>অভিভাবক</th><th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              ${exportSource
                .map(
                  (s) =>
                    `<tr>
                      <td>${escapeHtml(s.student_code)}</td>
                      <td>${escapeHtml(s.name_bn)}</td>
                      <td>${escapeHtml(s.sections?.classes?.name_bn ?? "")}</td>
                      <td>${escapeHtml(s.sections?.name ?? "")}</td>
                      <td>${s.roll ?? ""}</td>
                      <td>${escapeHtml(s.guardian_phone ?? "")}</td>
                      <td>${escapeHtml(statusLabel[s.status] ?? s.status)}</td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    w.document.write(tableHtml);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        {/* Bulk-action bar — sticky at top of card when any row selected */}
        {selected.size > 0 ? (
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-3 py-2.5 text-sm backdrop-blur">
            <span className="flex items-center gap-2 font-semibold text-primary">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                <BanglaDigit value={selected.size} />
              </span>
              জন নির্বাচিত
            </span>
            {selected.size < sorted.length ? (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs text-primary hover:underline"
              >
                সব {sorted.length} জনকে নির্বাচন করুন
              </button>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => runBulkDelete("soft")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning transition hover:bg-warning/20 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                বাদ দিন
              </button>
              <button
                type="button"
                onClick={() => runBulkDelete("hard")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                স্থায়ীভাবে মুছুন
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear selection"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Toolbar — page size + export actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-border/60 bg-card px-2 py-1 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>entries</span>
          </label>

          <div className="flex items-center gap-1">
            <IconToolbarButton
              label={selected.size > 0 ? `${selected.size} জন কপি` : "সব কপি"}
              onClick={copyClipboard}
              icon={<Clipboard className="size-4" />}
            />
            <IconToolbarButton
              label={selected.size > 0 ? `${selected.size} জন CSV` : "সব CSV"}
              onClick={exportCsv}
              icon={<Download className="size-4" />}
            />
            <IconToolbarButton
              label={selected.size > 0 ? `${selected.size} জন প্রিন্ট` : "সব প্রিন্ট"}
              onClick={printTable}
              icon={<Printer className="size-4" />}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => { if (el) el.indeterminate = someVisibleSelected; }}
                  onChange={toggleAllVisible}
                  className="size-4 cursor-pointer rounded border-border accent-primary"
                  aria-label="এই পেজের সবাইকে নির্বাচন করুন"
                />
              </TableHead>
              <TableHead className="w-16">ছবি</TableHead>
              <SortableHead
                className="hidden sm:table-cell"
                label="আইডি"
                active={sortKey === "code"}
                dir={sortDir}
                onClick={() => toggleSort("code")}
              />
              <SortableHead
                label="শিক্ষার্থীর নাম"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <SortableHead
                className="hidden md:table-cell"
                label="শ্রেণি"
                active={sortKey === "class"}
                dir={sortDir}
                onClick={() => toggleSort("class")}
              />
              <SortableHead
                className="hidden sm:table-cell w-16"
                label="রোল"
                active={sortKey === "roll"}
                dir={sortDir}
                onClick={() => toggleSort("roll")}
              />
              <SortableHead
                className="hidden lg:table-cell"
                label="ভর্তি তারিখ"
                active={sortKey === "admission"}
                dir={sortDir}
                onClick={() => toggleSort("admission")}
              />
              <SortableHead
                className="hidden md:table-cell"
                label="স্ট্যাটাস"
                active={sortKey === "status"}
                dir={sortDir}
                onClick={() => toggleSort("status")}
              />
              <TableHead className="text-end">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((s) => {
              const isSel = selected.has(s.id);
              const urlId =
                s.student_code && s.student_code.trim().length > 0 ? s.student_code : s.id;
              return (
                <TableRow key={s.id} className={isSel ? "bg-primary/5" : undefined}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleRow(s.id)}
                      className="size-4 cursor-pointer rounded border-border accent-primary"
                      aria-label={`${s.name_bn} নির্বাচন`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/students/${urlId}`}>
                      <Avatar className="size-10">
                        {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.name_bn} /> : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary/15 to-accent/15 text-sm text-primary">
                          {s.name_bn.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                    {s.student_code}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/students/${urlId}`}
                      className="font-medium hover:text-primary hover:underline underline-offset-4"
                    >
                      {s.name_bn}
                    </Link>
                    {s.name_en ? (
                      <div className="text-[11px] text-muted-foreground">{s.name_en}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {s.sections ? (
                      <span>
                        {s.sections.classes.name_bn}
                        {s.sections.name && s.sections.name !== "ক" ? (
                          <span className="text-muted-foreground"> — {s.sections.name}</span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm tabular-nums">
                    {s.roll != null ? <BanglaDigit value={s.roll} /> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {s.admission_date ? formatBanglaDate(s.admission_date) : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabel[s.status] ?? s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <StudentRowActions
                      schoolSlug={schoolSlug}
                      studentId={s.id}
                      studentCode={s.student_code}
                      studentName={s.name_bn}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 p-3 text-sm text-muted-foreground">
          <div>
            Showing <BanglaDigit value={startIdx + 1} /> to{" "}
            <BanglaDigit value={Math.min(startIdx + pageSize, sorted.length)} /> of{" "}
            <BanglaDigit value={sorted.length} /> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === totalPages)
              .reduce<number[]>((acc, n) => {
                if (acc.length && n - acc[acc.length - 1] > 1) acc.push(-1);
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === -1 ? (
                  <span key={`g-${i}`} className="px-1 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`min-w-[32px] rounded-md border px-2 py-1.5 text-sm ${
                      safePage === n
                        ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-card hover:bg-muted"
                    }`}
                  >
                    <BanglaDigit value={n} />
                  </button>
                ),
              )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className="group/sort inline-flex items-center gap-1 font-semibold transition-colors hover:text-primary"
      >
        <span>{label}</span>
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="size-3 text-primary" />
          ) : (
            <ArrowDown className="size-3 text-primary" />
          )
        ) : (
          <ArrowUpDown className="size-3 text-muted-foreground/40 transition-colors group-hover/sort:text-primary/60" />
        )}
      </button>
    </TableHead>
  );
}

function IconToolbarButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group/tb relative inline-flex size-9 items-center justify-center rounded-md border border-border/60 bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      {icon}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover/tb:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBanglaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const toBn = (s: string) => s.replace(/[0-9]/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]);
  return `${toBn(d)}-${toBn(mo)}-${toBn(y)}`;
}
