/**
 * AI-generated report card comment.
 *
 * Feature-flagged via NEXT_PUBLIC_ENABLE_AI_FEATURES. When disabled,
 * returns a best-effort rule-based comment so the button still works
 * in demos without Anthropic keys.
 *
 * Uses Anthropic Messages API — direct fetch to avoid a new SDK dep.
 */

import "server-only";
import { env } from "@/lib/config/env";

export type StudentPerformance = {
  student_name: string;
  class_name?: string;
  overall_gpa: number;
  overall_grade: string;
  position: number | null;
  attendance_pct: number | null;
  subjects: { name: string; marks: number; full_marks: number; grade: string }[];
};

function ruleBasedComment(perf: StudentPerformance): string {
  const name = perf.student_name;
  const strongest = [...perf.subjects].sort((a, b) => b.marks / b.full_marks - a.marks / a.full_marks)[0];
  const weakest = [...perf.subjects].sort((a, b) => a.marks / a.full_marks - b.marks / b.full_marks)[0];

  let comment = "";
  if (perf.overall_gpa >= 4.5) {
    comment = `${name} এই পরীক্ষায় চমৎকার ফলাফল করেছে (GPA ${perf.overall_gpa.toFixed(2)})। `;
  } else if (perf.overall_gpa >= 3.5) {
    comment = `${name} ভাল ফলাফল করেছে (GPA ${perf.overall_gpa.toFixed(2)})। `;
  } else if (perf.overall_gpa >= 2.0) {
    comment = `${name}-এর ফলাফল সন্তোষজনক (GPA ${perf.overall_gpa.toFixed(2)}) — আরও মনোযোগ প্রয়োজন। `;
  } else {
    comment = `${name}-এর এই পরীক্ষার ফলাফল দুর্বল (GPA ${perf.overall_gpa.toFixed(2)}) — পড়াশোনায় বিশেষ যত্ন দরকার। `;
  }

  if (strongest) comment += `${strongest.name}-এ সবচেয়ে ভাল করেছে। `;
  if (weakest && weakest !== strongest) comment += `${weakest.name}-এ আরও মনোযোগ দিতে হবে। `;

  if (perf.attendance_pct !== null) {
    if (perf.attendance_pct >= 90) comment += `উপস্থিতি প্রশংসনীয় (${perf.attendance_pct.toFixed(0)}%)। `;
    else if (perf.attendance_pct < 75) comment += `উপস্থিতি কম (${perf.attendance_pct.toFixed(0)}%) — নিয়মিত ক্লাসে আসা দরকার। `;
  }

  return comment.trim();
}

export async function generateReportComment(perf: StudentPerformance): Promise<{ ok: true; comment: string; source: "ai" | "rule" }> {
  if (!env.NEXT_PUBLIC_ENABLE_AI_FEATURES || !env.ANTHROPIC_API_KEY) {
    return { ok: true, comment: ruleBasedComment(perf), source: "rule" };
  }

  try {
    const prompt = [
      `You are a warm, respectful school teacher writing a brief (2-3 sentence) report card remark in Bangla for a parent.`,
      `Use simple Bangla that a village parent can understand. No English words except numbers/grades.`,
      `Student: ${perf.student_name}${perf.class_name ? ` (${perf.class_name})` : ""}`,
      `Overall GPA: ${perf.overall_gpa.toFixed(2)} (${perf.overall_grade}), position: ${perf.position ?? "N/A"}, attendance: ${perf.attendance_pct ?? "N/A"}%`,
      `Subjects:`,
      ...perf.subjects.map((s) => `  • ${s.name}: ${s.marks}/${s.full_marks} (${s.grade})`),
      `Respond with JUST the remark in Bangla — no labels, no quotes.`,
    ].join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: true, comment: ruleBasedComment(perf), source: "rule" };
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (text && text.length > 5) return { ok: true, comment: text, source: "ai" };
    return { ok: true, comment: ruleBasedComment(perf), source: "rule" };
  } catch {
    return { ok: true, comment: ruleBasedComment(perf), source: "rule" };
  }
}
