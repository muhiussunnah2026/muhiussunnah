"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bulkImportStudentsAction } from "@/server/actions/students";

export function BulkImportUploader({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("studentsExtra");
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

    if (raw.length === 0) {
      toast.error(t("uploader_no_rows"));
      return;
    }
    if (raw.length > 2000) {
      toast.error(t("uploader_max_rows"));
      return;
    }

    // Normalize column headers so Bornomala / other-vendor exports work
    // without hand-editing. Bangla headers map to our canonical English
    // column names. Unknown keys pass through untouched so any extra
    // metadata the user has is still visible in the preview.
    const rows = raw.map(normalizeRow);

    setPreview(rows);
    toast.success(t("uploader_rows_found", { count: rows.length }));
  }

  function submitImport() {
    if (!preview) return;
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await bulkImportStudentsAction(schoolSlug, preview as any);
      if (res.ok && res.data) {
        setResult(res.data);
        toast.success(res.message ?? t("uploader_success"));
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="file">{t("uploader_file_label")}</Label>
        <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
      </div>

      {file ? (
        <p className="text-sm text-muted-foreground">
          {t("uploader_file_count", { name: file.name, count: preview?.length ?? 0 })}
        </p>
      ) : null}

      {preview && preview.length > 0 ? (
        <>
          <div className="max-h-64 overflow-auto rounded-md border border-border/60 text-xs">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/50">
                <tr>
                  {Object.keys(preview[0]).map((k) => (
                    <th key={k} className="p-2 text-left font-medium">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {Object.values(r).map((v, j) => (
                      <td key={j} className="p-2">{String(v ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 10 ? (
            <p className="text-xs text-muted-foreground">{t("uploader_preview_note", { count: preview.length - 10 })}</p>
          ) : null}

          <Button
            type="button"
            onClick={submitImport}
            disabled={pending}
            className="bg-gradient-primary text-white"
          >
            {pending ? t("uploader_importing") : t("uploader_cta", { count: preview.length })}
          </Button>
        </>
      ) : null}

      {result ? (
        <div className="rounded-md border border-success/30 bg-success/5 p-4">
          <p className="text-sm font-semibold">
            {t("uploader_result", { inserted: result.inserted, skipped: result.skipped })}
          </p>
          {result.errors.length > 0 ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">{t("uploader_errors_heading")}</summary>
              <ul className="mt-2 list-disc pl-5 text-xs text-destructive">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Column-header alias map.
 *
 * Real-world spreadsheets come with wildly inconsistent headers — Bangla,
 * English, variants like "Name" vs "Full Name" vs "শিক্ষার্থীর নাম".
 * Mapping to our canonical keys client-side means the server keeps its
 * clean contract while teachers can upload whatever their previous
 * system (Bornomala, Shikho, etc.) exported.
 *
 * Keys are compared lowercase + trimmed, whitespace collapsed. Add more
 * aliases here when new vendor exports show up.
 */
const HEADER_ALIASES: Record<string, string> = {
  // name_bn — Bangla name
  "শিক্ষার্থীর নাম": "name_bn",
  "ছাত্রের নাম": "name_bn",
  "নাম": "name_bn",
  "ছাত্র-ছাত্রীর নাম": "name_bn",
  "student name": "name_bn",
  "full name": "name_bn",
  // name_en — English name
  "english name": "name_bn",
  "নাম (english)": "name_en",
  "english নাম": "name_en",
  // roll
  "রোল": "roll",
  "রোল নম্বর": "roll",
  "roll no": "roll",
  "roll number": "roll",
  // class
  "শ্রেণি": "class_name",
  "ক্লাস": "class_name",
  "শ্রেণী": "class_name",
  "class": "class_name",
  // section
  "সেকশন": "section_name",
  "শাখা": "section_name",
  "section": "section_name",
  // date_of_birth
  "জন্ম তারিখ": "date_of_birth",
  "জন্মতারিখ": "date_of_birth",
  "date of birth": "date_of_birth",
  "dob": "date_of_birth",
  // admission_date
  "ভর্তি তারিখ": "admission_date",
  "ভর্তির তারিখ": "admission_date",
  "admission date": "admission_date",
  // gender
  "লিঙ্গ": "gender",
  "জেন্ডার": "gender",
  // guardian_phone
  "অভিভাবকের ফোন": "guardian_phone",
  "অভিভাবকের মোবাইল": "guardian_phone",
  "মোবাইল": "guardian_phone",
  "ফোন": "guardian_phone",
  "parent phone": "guardian_phone",
  "guardian phone": "guardian_phone",
  // guardian_name
  "অভিভাবকের নাম": "guardian_name",
  "পিতার নাম": "guardian_name",
  "guardian name": "guardian_name",
  "parent name": "guardian_name",
  // address
  "ঠিকানা": "address_present",
  "বর্তমান ঠিকানা": "address_present",
  "address": "address_present",
  // ignored headers (status from Bornomala etc.)
  "অবস্থা": "__ignore__",
  "স্ট্যাটাস": "__ignore__",
  "status": "__ignore__",
};

/**
 * Common Bangla enum values mapped to our canonical English ones.
 * DB columns like `gender` are strict enums; without this map, a sheet
 * that says "মেয়ে" would land in Postgres verbatim and fail the
 * constraint. One entry per expected alias.
 */
const VALUE_ALIASES: Record<string, Record<string, string>> = {
  gender: {
    "মেয়ে": "female",
    "মহিলা": "female",
    "স্ত্রী": "female",
    "f": "female",
    "female": "female",
    "ছেলে": "male",
    "পুরুষ": "male",
    "m": "male",
    "male": "male",
    "অন্যান্য": "other",
    "other": "other",
  },
};

function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [rawKey, value] of Object.entries(raw)) {
    const key = rawKey.toString().trim().toLowerCase().replace(/\s+/g, " ");
    // Pass-through if the key is already one of our canonical columns.
    const canonical = HEADER_ALIASES[key] ?? HEADER_ALIASES[rawKey.trim()] ?? rawKey;
    if (canonical === "__ignore__") continue;

    // Translate known Bangla enum values (e.g. "মেয়ে" → "female").
    const aliases = VALUE_ALIASES[canonical];
    if (aliases && typeof value === "string") {
      const vKey = value.trim().toLowerCase();
      out[canonical] = aliases[vKey] ?? value;
    } else {
      out[canonical] = value;
    }
  }
  return out;
}
