"use server";

/**
 * Teacher ↔ Parent direct messaging.
 *
 * Allowed only if the school's `allow_parent_teacher_dm` flag is on.
 * A conversation is a thread with 1+ participants. For Phase 4 we
 * keep it simple: 1-to-1 only (teacher_user_id ↔ parent_user_id).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  type ActionResult,
  ok,
  fail,
  parseForm,
  requireMembershipForAction,
} from "./_helpers";

const startConversationSchema = z.object({
  schoolSlug: z.string().min(1),
  other_user_id: z.string().uuid(),        // the counterparty auth.users id
  subject: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
});

export async function startConversationAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(startConversationSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await requireMembershipForAction(parsed.schoolSlug);
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (supabase as any)
    .from("schools")
    .select("allow_parent_teacher_dm")
    .eq("id", auth.active.school_id)
    .single();

  if (school && school.allow_parent_teacher_dm === false) {
    return fail("শিক্ষক-অভিভাবক সরাসরি বার্তা এই স্কুলে বন্ধ করা হয়েছে।");
  }

  // Check for existing 1-to-1 conversation between these two users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("conversation_participants")
    .select("conversation_id, conversations!inner(school_id, kind)")
    .eq("user_id", auth.session.userId)
    .eq("conversations.school_id", auth.active.school_id)
    .eq("conversations.kind", "teacher_parent");

  for (const row of (existing ?? []) as Array<{ conversation_id: string }>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: others } = await (supabase as any)
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", row.conversation_id);
    const otherIds = ((others ?? []) as { user_id: string }[]).map((r) => r.user_id);
    if (otherIds.includes(parsed.other_user_id) && otherIds.length === 2) {
      return ok({ id: row.conversation_id }, "", `/school/${parsed.schoolSlug}/messages/${row.conversation_id}`);
    }
  }

  // Create new
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conversation, error } = await (supabase as any)
    .from("conversations")
    .insert({
      school_id: auth.active.school_id,
      subject: parsed.subject ?? null,
      kind: "teacher_parent",
      created_by: auth.session.userId,
    })
    .select("id")
    .single();
  if (error || !conversation) return fail(error?.message ?? "Conversation create failed");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: auth.session.userId, school_user_id: auth.active.school_user_id },
    { conversation_id: conversation.id, user_id: parsed.other_user_id },
  ]);

  revalidatePath(`/school/${parsed.schoolSlug}/teacher/messages`);
  revalidatePath(`/school/${parsed.schoolSlug}/portal/messages`);
  return ok({ id: conversation.id }, "কথোপকথন শুরু হয়েছে।");
}

// -----------------------------------------------------------------
// Send a message to an existing conversation
// -----------------------------------------------------------------

const sendMessageSchema = z.object({
  schoolSlug: z.string().min(1),
  conversation_id: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

export async function sendMessageAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(sendMessageSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await requireMembershipForAction(parsed.schoolSlug);
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // Verify participant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participant } = await (supabase as any)
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", parsed.conversation_id)
    .eq("user_id", auth.session.userId)
    .maybeSingle();
  if (!participant) return fail("আপনি এই কথোপকথনের অংশ নন।");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("messages").insert({
    conversation_id: parsed.conversation_id,
    sender_id: auth.session.userId,
    body: parsed.body,
  });
  if (error) return fail(error.message);

  // Bump conversation updated_at so the list refreshes order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", parsed.conversation_id);

  revalidatePath(`/school/${parsed.schoolSlug}/teacher/messages/${parsed.conversation_id}`);
  revalidatePath(`/school/${parsed.schoolSlug}/portal/messages/${parsed.conversation_id}`);
  return ok(undefined, "পাঠানো হয়েছে।");
}

// -----------------------------------------------------------------
// SMS credit topup (super admin only)
// -----------------------------------------------------------------

const topupSchema = z.object({
  school_id: z.string().uuid(),
  amount_bdt: z.coerce.number().min(1),
  method: z.enum(["manual", "bkash", "nagad", "card", "bank_transfer", "free"]).default("manual"),
  note: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export async function smsTopupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(topupSchema, formData);
  if ("error" in parsed) return parsed.error;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("সেশন নেই।");

  // Only super admin can topup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isSuper } = await (supabase as any).rpc("is_super_admin");
  if (!isSuper) return fail("শুধু সুপার অ্যাডমিন।");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school, error: schErr } = await (supabase as any)
    .from("schools")
    .select("sms_credit_balance_bdt")
    .eq("id", parsed.school_id)
    .single();
  if (schErr || !school) return fail("স্কুল পাওয়া যায়নি।");

  const newBalance = Number(school.sms_credit_balance_bdt) + parsed.amount_bdt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("schools")
    .update({ sms_credit_balance_bdt: newBalance })
    .eq("id", parsed.school_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("sms_credit_topups").insert({
    school_id: parsed.school_id,
    amount_bdt: parsed.amount_bdt,
    method: parsed.method,
    note: parsed.note ?? null,
    balance_after: newBalance,
    added_by: user.id,
  });

  revalidatePath("/super-admin/sms-credits");
  return ok({ balance: newBalance }, `৳ ${parsed.amount_bdt} যোগ হয়েছে। নতুন ব্যালেন্স: ৳ ${newBalance.toFixed(2)}`);
}
