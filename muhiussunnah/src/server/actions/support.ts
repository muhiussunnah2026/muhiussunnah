"use server";

/**
 * Support tickets.
 *
 * Any authenticated school member can open a ticket. Admin assignees
 * get notified (v2). For now, tickets are visible to:
 *   - creator (via RLS — school member)
 *   - assigned_to user
 *   - all admins of the same school
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
  authorizeAction,
  writeAuditLog,
} from "./_helpers";

const createTicketSchema = z.object({
  schoolSlug: z.string().min(1),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(5).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  category: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
});

export async function createTicketAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(createTicketSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await requireMembershipForAction(parsed.schoolSlug);
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ticket, error } = await (supabase as any)
    .from("support_tickets")
    .insert({
      school_id: auth.active.school_id,
      created_by: auth.session.userId,
      subject: parsed.subject,
      body: parsed.body,
      priority: parsed.priority,
      status: "open",
      category: parsed.category ?? null,
    })
    .select("id")
    .single();
  if (error || !ticket) return fail(error?.message ?? "টিকেট তৈরি করা যায়নি।");

  await writeAuditLog({
    schoolId: auth.active.school_id,
    userId: auth.session.userId,
    action: "create",
    resourceType: "support_ticket",
    resourceId: ticket.id,
    meta: { subject: parsed.subject, priority: parsed.priority },
  });

  revalidatePath(`/admin/support`);
  return ok({ id: ticket.id }, "টিকেট তৈরি হয়েছে।", `/admin/support/${ticket.id}`);
}

// -----------------------------------------------------------------
// Reply to a ticket
// -----------------------------------------------------------------

const replySchema = z.object({
  schoolSlug: z.string().min(1),
  ticket_id: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

export async function replyTicketAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(replySchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await requireMembershipForAction(parsed.schoolSlug);
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();

  // Verify ticket belongs to this school
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ticket } = await (supabase as any)
    .from("support_tickets")
    .select("id, status, school_id")
    .eq("id", parsed.ticket_id)
    .single();
  if (!ticket || ticket.school_id !== auth.active.school_id) {
    return fail("টিকেট পাওয়া যায়নি।");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("support_messages").insert({
    ticket_id: parsed.ticket_id,
    user_id: auth.session.userId,
    body: parsed.body,
  });
  if (error) return fail(error.message);

  // If the ticket was waiting, bump to in_progress
  if (ticket.status === "waiting" || ticket.status === "open") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("support_tickets")
      .update({ status: "in_progress" })
      .eq("id", parsed.ticket_id);
  }

  revalidatePath(`/admin/support/${parsed.ticket_id}`);
  revalidatePath(`/portal/support/${parsed.ticket_id}`);
  return ok(undefined, "উত্তর পাঠানো হয়েছে।");
}

// -----------------------------------------------------------------
// Change status (admin-only)
// -----------------------------------------------------------------

const statusSchema = z.object({
  schoolSlug: z.string().min(1),
  ticket_id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]),
});

export async function updateTicketStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(statusSchema, formData);
  if ("error" in parsed) return parsed.error;

  const auth = await authorizeAction({
    schoolSlug: parsed.schoolSlug,
    action: "update",
    resource: "support_ticket",
  });
  if ("error" in auth) return auth.error;

  const supabase = await supabaseServer();
  const patch: Record<string, unknown> = { status: parsed.status };
  if (parsed.status === "resolved") patch.resolved_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("support_tickets")
    .update(patch)
    .eq("id", parsed.ticket_id)
    .eq("school_id", auth.active.school_id);
  if (error) return fail(error.message);

  revalidatePath(`/admin/support`);
  revalidatePath(`/admin/support/${parsed.ticket_id}`);
  return ok(undefined, "স্ট্যাটাস আপডেট হয়েছে।");
}
