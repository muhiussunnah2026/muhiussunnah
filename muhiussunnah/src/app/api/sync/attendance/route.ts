import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/sync/attendance
 * Body: { records: Array<{ student_id, section_id, school_id, date, status }> }
 *
 * Used by the offline sync queue in sw.js to replay queued attendance records
 * when the device comes back online.
 */
export async function POST(req: NextRequest) {
  try {
    const { records } = await req.json() as {
      records: Array<{ student_id: string; section_id: string; school_id: string; date: string; status: string }>;
    };

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ ok: false, error: "No records" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("attendance")
      .upsert(records, { onConflict: "student_id,date" });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, synced: records.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
