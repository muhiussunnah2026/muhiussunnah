"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Clipboard, Download, Printer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentRowActions } from "./row-actions";

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

const statusLabel: Record<string, string> = {
  active: "সক্রিয়",
  transferred: "বদলি হয়েছে",
  passed_out: "পাশ করেছে",
  dropped: "বাদ",
  suspended: "স্থগিত",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Students table with client-side pagination + bulk export actions.
 * Data is loaded server-side (up to 500 rows); this component only
 * handles presentation, page size + page number, and the three
 * export formats.
 */
export function StudentsTable({
  students,
  schoolSlug,
  schoolName,
}: {
  students: Student[];
  schoolSlug: string;
  schoolName: string;
}) {
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visible = useMemo(
    () => students.slice(startIdx, startIdx + pageSize),
    [students, startIdx, pageSize],
  );

  function exportCsv() {
    const headers = ["Code", "Name (BN)", "Name (EN)", "Class", "Section", "Roll", "Gender", "Guardian Phone", "Status"];
    const rows = students.map((s) => [
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
    toast.success(`${students.length} টি রেকর্ড CSV-তে এক্সপোর্ট হয়েছে`);
  }

  async function copyClipboard() {
    const rows = students.map((s) =>
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
      toast.success(`${students.length} টি রেকর্ড ক্লিপবোর্ডে কপি হয়েছে`);
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
              ${students
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
            <IconToolbarButton label="ক্লিপবোর্ডে কপি" onClick={copyClipboard} icon={<Clipboard className="size-4" />} />
            <IconToolbarButton label="CSV এক্সপোর্ট" onClick={exportCsv} icon={<Download className="size-4" />} />
            <IconToolbarButton label="প্রিন্ট" onClick={printTable} icon={<Printer className="size-4" />} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ছবি</TableHead>
              <TableHead className="hidden sm:table-cell">আইডি</TableHead>
              <TableHead>শিক্ষার্থীর নাম</TableHead>
              <TableHead className="hidden md:table-cell">শ্রেণি</TableHead>
              <TableHead className="hidden sm:table-cell w-16">রোল</TableHead>
              <TableHead className="hidden lg:table-cell">ভর্তি তারিখ</TableHead>
              <TableHead className="hidden md:table-cell">স্ট্যাটাস</TableHead>
              <TableHead className="text-end">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link href={`/students/${s.id}`}>
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
                    href={`/students/${s.id}`}
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
                  <StudentRowActions schoolSlug={schoolSlug} studentId={s.id} studentName={s.name_bn} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 p-3 text-sm text-muted-foreground">
          <div>
            Showing <BanglaDigit value={startIdx + 1} /> to{" "}
            <BanglaDigit value={Math.min(startIdx + pageSize, students.length)} /> of{" "}
            <BanglaDigit value={students.length} /> entries
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

/** Render an ISO date as DD-MM-YYYY in Bangla numerals. */
function formatBanglaDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const toBn = (s: string) => s.replace(/[0-9]/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]);
  return `${toBn(d)}-${toBn(mo)}-${toBn(y)}`;
}
