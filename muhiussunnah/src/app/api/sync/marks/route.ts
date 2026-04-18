import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/sync/marks
 * Body: { records: Array<{ school_id, student_id, exam_subject_id, marks_obtained, is_absent }> }
 *
 * Used by the offline sync queue in sw.js to replay queued marks entries
 * when the device comes back online.
 */
export async function POST(req: NextRequest) {
  try {
    const { records } = (await req.json()) as {
      records: Array<{
        school_id: string;
        student_id: string;
        exam_subject_id: string;
        marks_obtained: number | null;
        is_absent: boolean;
      }>;
    };

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ ok: false, error: "No records" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("marks")
      .upsert(records, { onConflict: "exam_subject_id,student_id" });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, synced: records.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
