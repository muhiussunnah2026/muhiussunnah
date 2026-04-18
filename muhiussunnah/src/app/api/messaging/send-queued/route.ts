/**
 * Cron target: flush scheduled notices whose `scheduled_for` has arrived.
 *
 * Runs every 15 minutes (see vercel.json). For each notice where
 * sent_at is null and scheduled_for <= now, resolve recipients and
 * dispatch across configured channels.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";
import { dispatchMessage, type Channel, type Recipient } from "@/lib/messaging/dispatcher";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function resolveRecipients(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  schoolId: string,
  audience: string,
  targetId: string | null,
): Promise<Recipient[]> {
  if (audience === "staff" || audience === "teachers") {
    const roleFilter = audience === "teachers"
      ? ["CLASS_TEACHER", "SUBJECT_TEACHER", "MADRASA_USTADH"]
      : null;
    let q = admin.from("school_users")
      .select("user_id, full_name_bn, email, phone")
      .eq("school_id", schoolId)
      .eq("status", "active");
    if (roleFilter) q = q.in("role", roleFilter);
    else q = q.not("role", "in", "(STUDENT,PARENT)");
    const { data } = await q;
    return ((data ?? []) as Array<{ user_id: string; full_name_bn: string | null; email: string | null; phone: string | null }>)
      .map((r) => ({ user_id: r.user_id, name: r.full_name_bn ?? undefined, email: r.email ?? undefined, phone: r.phone ?? undefined }));
  }

  let sq = admin.from("students")
    .select("id, name_bn, guardian_phone, section_id, sections(class_id)")
    .eq("school_id", schoolId)
    .eq("status", "active");
  if (audience === "class" && targetId) sq = sq.eq("sections.class_id", targetId);
  if (audience === "section" && targetId) sq = sq.eq("section_id", targetId);
  const { data: students } = await sq;
  const studentIds = ((students ?? []) as { id: string }[]).map((s) => s.id);
  if (studentIds.length === 0) return [];

  const { data: guardians } = await admin
    .from("student_guardians")
    .select("student_id, user_id, phone, email, name_bn")
    .in("student_id", studentIds);

  const recipients: Recipient[] = [];
  for (const g of ((guardians ?? []) as Array<{ student_id: string; user_id: string | null; phone: string | null; email: string | null; name_bn: string }>)) {
    recipients.push({
      user_id: g.user_id ?? undefined,
      phone: g.phone ?? undefined,
      email: g.email ?? undefined,
      name: g.name_bn,
    });
  }
  const seen = new Set<string>();
  return recipients.filter((r) => {
    const key = r.user_id ?? r.phone ?? r.email ?? "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function handle(request: Request) {
  const auth = request.headers.get("authorization");
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: due } = await admin
    .from("notices")
    .select("id, school_id, title, body, audience, target_ids, channels, scheduled_for")
    .is("sent_at", null)
    .not("scheduled_for", "is", null)
    .lte("scheduled_for", new Date().toISOString())
    .limit(100);

  const list = (due ?? []) as Array<{
    id: string; school_id: string; title: string; body: string; audience: string;
    target_ids: string[]; channels: string[]; scheduled_for: string;
  }>;

  const results: Array<{ id: string; sent: number; failed: number; cost: number; error?: string }> = [];

  for (const notice of list) {
    try {
      const recipients = await resolveRecipients(
        admin,
        notice.school_id,
        notice.audience,
        notice.target_ids?.[0] ?? null,
      );

      const channels = (notice.channels ?? []).filter((c): c is Channel =>
        ["sms", "whatsapp", "push", "email", "inapp"].includes(c),
      );

      const dispatch = await dispatchMessage({
        schoolId: notice.school_id,
        noticeId: notice.id,
        channels,
        recipients,
        subject: notice.title,
        body: notice.body,
      });

      await admin
        .from("notices")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", notice.id);

      results.push({ id: notice.id, sent: dispatch.sent, failed: dispatch.failed, cost: dispatch.cost });
    } catch (e) {
      results.push({ id: notice.id, sent: 0, failed: 0, cost: 0, error: (e as Error).message });
    }
  }

  return NextResponse.json({ ok: true, processed: list.length, results });
}

export async function POST(request: Request) { return handle(request); }
export async function GET(request: Request) { return handle(request); }
