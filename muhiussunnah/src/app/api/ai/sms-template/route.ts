import { NextRequest, NextResponse } from "next/server";
import { generateSmsTemplate } from "@/lib/ai/sms-template";

type Category = "fee_reminder" | "absent_alert" | "exam_reminder" | "result_announce" | "holiday" | "general" | "custom";

export async function POST(req: NextRequest) {
  try {
    const { category, context, schoolName } = (await req.json()) as {
      category: Category;
      context?: string;
      schoolName?: string;
    };
    if (!category) return NextResponse.json({ ok: false, error: "category required" }, { status: 400 });
    const result = await generateSmsTemplate({ category, context, schoolName });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
