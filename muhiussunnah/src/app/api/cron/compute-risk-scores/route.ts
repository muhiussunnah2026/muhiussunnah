/**
 * Weekly cron — recompute dropout risk scores for all active schools.
 * Vercel Cron triggers this Sunday 03:00 UTC (see vercel.json).
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: schools } = await admin.from("schools").select("id, slug").eq("is_active", true);
  if (!schools) return NextResponse.json({ ok: true, computed: 0 });

  let totalStudents = 0;
  const errors: Array<{ school: string; error: string }> = [];

  for (const s of schools as Array<{ id: string; slug: string }>) {
    try {
      // Reuse the same logic as computeRiskScoresAction (inline for cron)
      const { data: students } = await admin
        .from("students")
        .select("id")
        .eq("school_id", s.id)
        .eq("is_active", true);
      if (!students || students.length === 0) continue;

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [{ data: attendance }, { data: recentCards }, { data: invoices }] = await Promise.all([
        admin.from("attendance").select("student_id, status").eq("school_id", s.id).gte("date", sixtyDaysAgo.toISOString().split("T")[0]),
        admin.from("report_cards").select("student_id, obtained_total, max_total").eq("school_id", s.id).order("published_at", { ascending: false }).limit(1000),
        admin.from("fee_invoices").select("student_id, due_date, total_amount, paid_amount").eq("school_id", s.id),
      ]);

      const attStats = new Map<string, { total: number; present: number }>();
      for (const r of (attendance ?? []) as Array<{ student_id: string; status: string }>) {
        const st = attStats.get(r.student_id) ?? { total: 0, present: 0 };
        st.total++;
        if (r.status === "present" || r.status === "late") st.present++;
        attStats.set(r.student_id, st);
      }

      const marksMap = new Map<string, number>();
      for (const r of (recentCards ?? []) as Array<{ student_id: string; obtained_total: number | null; max_total: number | null }>) {
        if (marksMap.has(r.student_id)) continue;
        const pct = r.max_total && r.max_total > 0 ? (Number(r.obtained_total ?? 0) / Number(r.max_total)) * 100 : 100;
        marksMap.set(r.student_id, pct);
      }

      const feeMap = new Map<string, number>();
      const today = new Date();
      for (const inv of (invoices ?? []) as Array<{ student_id: string; due_date: string; total_amount: number; paid_amount: number }>) {
        if (Number(inv.paid_amount) >= Number(inv.total_amount)) continue;
        const due = new Date(inv.due_date);
        if (due >= today) continue;
        const days = Math.floor((today.getTime() - due.getTime()) / 86400000);
        const existing = feeMap.get(inv.student_id) ?? 0;
        if (days > existing) feeMap.set(inv.student_id, days);
      }

      const rows = (students as Array<{ id: string }>).map((st) => {
        const att = attStats.get(st.id);
        const attPct = att && att.total > 0 ? (att.present / att.total) * 100 : 100;
        const marksPct = marksMap.get(st.id) ?? 100;
        const overdue = feeMap.get(st.id) ?? 0;

        const attRisk = Math.max(0, 100 - attPct);
        const marksRisk = Math.max(0, 100 - marksPct);
        const feeRisk = Math.min(100, overdue / 0.9);
        const score = Math.round(attRisk * 0.4 + marksRisk * 0.4 + feeRisk * 0.2);
        const level = score >= 75 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

        const factors: Record<string, unknown> = {};
        if (attPct < 75) factors.low_attendance = `${Math.round(attPct)}%`;
        if (marksPct < 40) factors.low_marks = `${Math.round(marksPct)}%`;
        if (overdue > 60) factors.fee_overdue = `${overdue} দিন`;

        return {
          school_id: s.id,
          student_id: st.id,
          risk_level: level,
          score,
          attendance_pct: Math.round(attPct * 100) / 100,
          avg_marks_pct: Math.round(marksPct * 100) / 100,
          fee_overdue_days: overdue,
          factors,
          computed_at: new Date().toISOString(),
        };
      });

      const { error } = await admin.from("student_risk_scores").upsert(rows, { onConflict: "student_id" });
      if (error) errors.push({ school: s.slug, error: error.message });
      else totalStudents += rows.length;
    } catch (e) {
      errors.push({ school: s.slug, error: String(e) });
    }
  }

  return NextResponse.json({ ok: true, schools: schools.length, students: totalStudents, errors });
}
