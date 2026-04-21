"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
  Search,
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

/**
 * Lookup status → translation key. Full strings are in the
 * `studentsFilters` namespace (status_active, status_dropped…).
 * Caller resolves via t(). Falls back to the raw key if missing.
 */
function statusKey(status: string): string {
  return `status_${status}`;
}

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
  const [query, setQuery] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const t = useTranslations("common");
  const tTable = useTranslations("studentsTable");
  const tStatus = useTranslations("studentsFilters");
  // Resolve a status enum → localised label. `common.dropped` etc are
  // short forms; studentsFilters uses fuller wording for the row badge
  // (e.g. "বদলি হয়েছে" / "Transferred") so we prefer that namespace.
  function statusText(status: string): string {
    try {
      return tStatus(statusKey(status));
    } catch {
      return status;
    }
  }

  // ── Real-time name/ID filter ──────────────────────────────
  // Matches substring in either Bangla name, English name, or the
  // student_code / UUID id. Case-insensitive. Resets page whenever
  // the query changes so users don't get stuck on an empty page.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name_bn.toLowerCase().includes(q) ||
        (s.name_en ?? "").toLowerCase().includes(q) ||
        (s.student_code ?? "").toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [students, query]);

  // ── Sorting ───────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
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
  }, [filtered, sortKey, sortDir]);

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
    const warn = mode === "hard"
      ? tTable("confirm_bulk_hard", { count: selected.size })
      : tTable("confirm_bulk_drop", { count: selected.size });
    if (!confirm(warn)) return;

    const fd = new FormData();
    fd.append("schoolSlug", schoolSlug);
    fd.append("student_ids", [...selected].join(","));
    fd.append("mode", mode);

    startTransition(async () => {
      const res = await bulkDeleteStudentsAction(null, fd);
      if (res.ok) {
        toast.success(res.message ?? "");
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
      statusText(s.status),
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
    toast.success(tTable("csv_success", { count: exportSource.length }));
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
        statusText(s.status),
      ].join("\t"),
    );
    const text = ["Code\tName\tClass\tSection\tRoll\tGuardian\tStatus", ...rows].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(tTable("clipboard_success", { count: exportSource.length }));
    } catch {
      toast.error(tTable("clipboard_fail"));
    }
  }

  function printTable() {
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) {
      toast.error(tTable("print_blocked"));
      return;
    }
    const tableHtml = `
      <html>
        <head>
          <title>${schoolName} — ${tTable("print_title_suffix")}</title>
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
          <h2>${tTable("print_title_suffix")} — ${new Date().toLocaleDateString("bn-BD")}</h2>
          <table>
            <thead>
              <tr>
                <th>${tTable("col_id")}</th><th>${tTable("col_name")}</th><th>${tTable("col_class")}</th><th>${tTable("col_section")}</th><th>${tTable("col_roll")}</th><th>${tTable("col_guardian")}</th><th>${tTable("col_status")}</th>
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
                      <td>${escapeHtml(statusText(s.status))}</td>
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
              {tTable("n_selected_suffix")}
            </span>
            {selected.size < sorted.length ? (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs text-primary hover:underline"
              >
                {tTable("select_all_filtered", { count: sorted.length })}
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
                {t("drop")}
              </button>
              <button
                type="button"
                onClick={() => runBulkDelete("hard")}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                {t("delete_permanently")}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("clear_search")}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Toolbar — page size + real-time search + export actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("show")}</span>
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
            <span>{t("entries")}</span>
          </label>

          {/* Real-time search — filters instantly as user types, no server trip */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("search_placeholder")}
              className="h-9 w-full rounded-md border border-border/60 bg-card ps-9 pe-9 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("clear_search")}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <IconToolbarButton
              label={selected.size > 0
                ? tTable("tooltip_copy_sel", { count: selected.size })
                : tTable("tooltip_copy_all")}
              onClick={copyClipboard}
              icon={<Clipboard className="size-4" />}
            />
            <IconToolbarButton
              label={selected.size > 0
                ? tTable("tooltip_csv_sel", { count: selected.size })
                : tTable("tooltip_csv_all")}
              onClick={exportCsv}
              icon={<Download className="size-4" />}
            />
            <IconToolbarButton
              label={selected.size > 0
                ? tTable("tooltip_print_sel", { count: selected.size })
                : tTable("tooltip_print_all")}
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
                  aria-label={tTable("select_this_page")}
                />
              </TableHead>
              <TableHead className="w-16">{tTable("col_photo")}</TableHead>
              <SortableHead
                className="hidden sm:table-cell"
                label={tTable("col_id")}
                active={sortKey === "code"}
                dir={sortDir}
                onClick={() => toggleSort("code")}
              />
              <SortableHead
                label={tTable("col_name")}
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <SortableHead
                className="hidden md:table-cell"
                label={tTable("col_class")}
                active={sortKey === "class"}
                dir={sortDir}
                onClick={() => toggleSort("class")}
              />
              <SortableHead
                className="hidden sm:table-cell w-16"
                label={tTable("col_roll")}
                active={sortKey === "roll"}
                dir={sortDir}
                onClick={() => toggleSort("roll")}
              />
              <SortableHead
                className="hidden lg:table-cell"
                label={tTable("col_admission_date")}
                active={sortKey === "admission"}
                dir={sortDir}
                onClick={() => toggleSort("admission")}
              />
              <SortableHead
                className="hidden md:table-cell"
                label={tTable("col_status")}
                active={sortKey === "status"}
                dir={sortDir}
                onClick={() => toggleSort("status")}
              />
              <TableHead className="text-end">{tTable("col_actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && query.trim() ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Search className="size-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {tTable("search_empty", { query })}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setPage(1);
                      }}
                      className="mt-1 text-xs text-primary hover:underline"
                    >
                      {t("clear_search")}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
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
                      aria-label={tTable("select_aria", { name: s.name_bn })}
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
                      {statusText(s.status)}
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
            {t.rich("showing_x_to_y_of_z", {
              start: () => <BanglaDigit value={startIdx + 1} />,
              end: () => <BanglaDigit value={Math.min(startIdx + pageSize, sorted.length)} />,
              total: () => <BanglaDigit value={sorted.length} />,
            })}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
              {t("previous")}
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
              {t("next")}
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
