/**
 * Monthly fee invoice generation cron endpoint.
 *
 * Authenticated with CRON_SECRET (sent as Authorization: Bearer <secret>).
 * Vercel Cron config in vercel.json triggers this on the 1st of each month.
 *
 * For each active school it runs seed_monthly_invoices — equivalent to
 * clicking "Generate invoices for this month" in the admin UI.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: schools } = await admin
    .from("schools")
    .select("id, slug")
    .in("subscription_status", ["trial", "active"]);

  const results: Array<{ school: string; created: number; skipped: number; error?: string }> = [];

  for (const school of (schools ?? []) as Array<{ id: string; slug: string }>) {
    try {
      // Reuse the action's core logic inline against the admin client.
      const { data: structures } = await admin
        .from("fee_structures")
        .select("id, class_id, fee_head_id, amount, frequency, fee_heads!inner(name_bn)")
        .eq("school_id", school.id);

      const applicableStructures = ((structures ?? []) as Array<{ id: string; class_id: string; fee_head_id: string; amount: number; frequency: string; fee_heads: { name_bn: string } }>).filter((st) => {
        if (st.frequency === "monthly") return true;
        if (st.frequency === "quarterly") return [1, 4, 7, 10].includes(month);
        if (st.frequency === "annual") return month === 1;
        return false;
      });

      if (applicableStructures.length === 0) {
        results.push({ school: school.slug, created: 0, skipped: 0 });
        continue;
      }

      const byClass = new Map<string, typeof applicableStructures>();
      for (const s of applicableStructures) {
        const arr = byClass.get(s.class_id) ?? [];
        arr.push(s);
        byClass.set(s.class_id, arr);
      }

      const { data: students } = await admin
        .from("students")
        .select("id, section_id, sections!inner(class_id)")
        .eq("school_id", school.id)
        .eq("status", "active");

      let created = 0;
      let skipped = 0;

      for (const s of (students ?? []) as Array<{ id: string; section_id: string | null; sections: { class_id: string } | null }>) {
        if (!s.sections) continue;
        const applicable = byClass.get(s.sections.class_id);
        if (!applicable) continue;

        const { data: existing } = await admin
          .from("fee_invoices")
          .select("id")
          .eq("student_id", s.id)
          .eq("month", month)
          .eq("year", year)
          .maybeSingle();
        if (existing) { skipped++; continue; }

        const total = applicable.reduce((sum, a) => sum + Number(a.amount), 0);
        const invoiceNo = `INV-${school.slug.toUpperCase().slice(0, 6)}-${year}${String(month).padStart(2, "0")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const { data: inv } = await admin
          .from("fee_invoices")
          .insert({
            school_id: school.id,
            student_id: s.id,
            invoice_no: invoiceNo,
            month,
            year,
            issue_date: now.toISOString().slice(0, 10),
            total_amount: total,
            paid_amount: 0,
            status: "unpaid",
          })
          .select("id")
          .single();

        if (!inv) continue;

        await admin.from("fee_invoice_items").insert(
          applicable.map((a) => ({
            invoice_id: inv.id,
            fee_head_id: a.fee_head_id,
            amount: a.amount,
            waiver: 0,
            description: a.fee_heads.name_bn,
          })),
        );

        await admin.from("student_ledger_entries").insert({
          school_id: school.id,
          student_id: s.id,
          date: now.toISOString().slice(0, 10),
          ref_type: "invoice",
          ref_id: inv.id,
          debit: total,
          credit: 0,
          note: `${invoiceNo} · ${month}/${year}`,
        });
        created++;
      }

      results.push({ school: school.slug, created, skipped });
    } catch (e) {
      results.push({ school: school.slug, created: 0, skipped: 0, error: (e as Error).message });
    }
  }

  return NextResponse.json({ ok: true, month, year, results });
}

// Allow GET for manual trigger from Vercel Cron which sometimes uses GET
export async function GET(request: Request) {
  return POST(request);
}
