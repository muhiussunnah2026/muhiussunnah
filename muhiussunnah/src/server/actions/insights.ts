"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction, fail, ok } from "./_helpers";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ActionResult } from "./_helpers";

/**
 * Compute dropout risk scores for all active students in a school.
 * Risk factors:
 *   • Attendance % over last 60 days (<75% = risk)
 *   • Average marks in most recent published exam (<40% = risk)
 *   • Fee overdue days (>60 days = risk)
 *
 * Score = weighted average of each factor (0-100, higher = more risk)
 * Level: critical >=75, high >=50, medium >=25, low <25
 */
export async function computeRiskScoresAction(
  _prev: ActionResult<{ count: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ count: number }>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  if (!schoolSlug) return fail("Invalid data");

  const auth = await authorizeAction({ schoolSlug, action: "update", resource: "student" });
  if ("error" in auth) return auth.error as ActionResult<{ count: number }>;

  const admin = supabaseAdmin();
  const schoolId = auth.active.school_id;

  // 1) Get active students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (admin as any)
    .from("students")
    .select("id, name_bn, section_id")
    .eq("school_id", schoolId)
    .eq("is_active", true);

  if (!students || students.length === 0) return ok({ count: 0 }, "কোন সক্রিয় ছাত্র নেই।");

  // 2) Compute attendance % over last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const fromDate = sixtyDaysAgo.toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attendance } = await (admin as any)
    .from("attendance")
    .select("student_id, status")
    .eq("school_id", schoolId)
    .gte("date", fromDate);

  const attStats = new Map<string, { total: number; present: number }>();
  for (const r of (attendance ?? []) as Array<{ student_id: string; status: string }>) {
    const s = attStats.get(r.student_id) ?? { total: 0, present: 0 };
    s.total++;
    if (r.status === "present" || r.status === "late") s.present++;
    attStats.set(r.student_id, s);
  }

  // 3) Most recent published exam — average marks_obtained / total_marks per student
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentCards } = await (admin as any)
    .from("report_cards")
    .select("student_id, gpa, obtained_total, max_total")
    .eq("school_id", schoolId)
    .order("published_at", { ascending: false })
    .limit(500);

  const marksMap = new Map<string, number>();
  for (const r of (recentCards ?? []) as Array<{ student_id: string; obtained_total: number | null; max_total: number | null }>) {
    if (marksMap.has(r.student_id)) continue; // take only most recent per student
    const pct = r.max_total && r.max_total > 0 ? (Number(r.obtained_total ?? 0) / Number(r.max_total)) * 100 : 100;
    marksMap.set(r.student_id, pct);
  }

  // 4) Fee overdue days — oldest unpaid invoice
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (admin as any)
    .from("fee_invoices")
    .select("student_id, due_date, total_amount, paid_amount")
    .eq("school_id", schoolId);

  const feeMap = new Map<string, number>(); // days overdue
  const today = new Date();
  for (const inv of (invoices ?? []) as Array<{ student_id: string; due_date: string; total_amount: number; paid_amount: number }>) {
    if (Number(inv.paid_amount) >= Number(inv.total_amount)) continue;
    const due = new Date(inv.due_date);
    if (due >= today) continue;
    const days = Math.floor((today.getTime() - due.getTime()) / 86400000);
    const existing = feeMap.get(inv.student_id) ?? 0;
    if (days > existing) feeMap.set(inv.student_id, days);
  }

  // 5) Score each student
  const rows = students.map((s: { id: string; name_bn: string | null }) => {
    const att = attStats.get(s.id);
    const attPct = att && att.total > 0 ? (att.present / att.total) * 100 : 100;
    const marksPct = marksMap.get(s.id) ?? 100;
    const overdue = feeMap.get(s.id) ?? 0;

    // Score: 0-100 (higher = more risk)
    const attRisk = Math.max(0, 100 - attPct);         // 0 if 100% attendance, 100 if 0%
    const marksRisk = Math.max(0, 100 - marksPct);     // 0 if 100% marks
    const feeRisk = Math.min(100, overdue / 0.9);      // 90+ days overdue = 100 risk

    // Weighted: attendance 40%, marks 40%, fees 20%
    const score = Math.round(attRisk * 0.4 + marksRisk * 0.4 + feeRisk * 0.2);

    const level: "low" | "medium" | "high" | "critical" =
      score >= 75 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

    const factors: Record<string, unknown> = {};
    if (attPct < 75) factors.low_attendance = `${Math.round(attPct)}%`;
    if (marksPct < 40) factors.low_marks = `${Math.round(marksPct)}%`;
    if (overdue > 60) factors.fee_overdue = `${overdue} দিন`;

    let suggestion: string | null = null;
    if (level === "critical") suggestion = "অভিভাবকের সাথে জরুরি মিটিং ডাকুন। counseling session প্রয়োজন।";
    else if (level === "high") suggestion = "অভিভাবককে ফোন করে সমস্যা জানুন। পারফরম্যান্স রিভিউ করুন।";
    else if (level === "medium") suggestion = "ক্লাস টিচারকে নজর রাখতে বলুন।";

    return {
      school_id: schoolId,
      student_id: s.id,
      risk_level: level,
      score,
      attendance_pct: Math.round(attPct * 100) / 100,
      avg_marks_pct: Math.round(marksPct * 100) / 100,
      fee_overdue_days: overdue,
      factors,
      suggestion,
      computed_at: new Date().toISOString(),
    };
  });

  // 6) Upsert all rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("student_risk_scores")
    .upsert(rows, { onConflict: "student_id" });

  if (error) return fail(error.message);

  revalidatePath(`/school/${schoolSlug}/admin/insights/dropout-risk`);
  return ok({ count: rows.length }, `${rows.length} জন ছাত্রের ঝুঁকি স্কোর গণনা হয়েছে।`);
}
