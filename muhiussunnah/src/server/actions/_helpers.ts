import "server-only";

/**
 * Shared primitives for server actions.
 *
 * Every mutating action returns ActionResult so client components using
 * useActionState can uniformly display success/error toasts.
 */

import { z, type ZodSchema } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getSession, type ShikkhaSession, type ActiveSchoolMembership } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import type { PermissionAction, PermissionResource, PermissionScopeType } from "@/lib/auth/roles";

export type ActionResult<T = unknown> =
  | { ok: true; message?: string; data?: T; redirect?: string }
  | { ok: false; error: string; fields?: Record<string, string[]> };

export function fail<T = unknown>(error: string, fields?: Record<string, string[]>): ActionResult<T> {
  return { ok: false, error, fields };
}

export function ok<T>(data?: T, message?: string, redirect?: string): ActionResult<T> {
  return { ok: true, data, message, redirect };
}

/** Validate form data with zod and surface structured errors. */
export function parseForm<S extends ZodSchema>(schema: S, formData: FormData): z.infer<S> | { error: ActionResult } {
  const entries: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    // Handle checkbox arrays (multiple values for same name)
    if (key in entries) {
      const existing = entries[key];
      if (Array.isArray(existing)) existing.push(value);
      else entries[key] = [existing, value];
    } else {
      entries[key] = value;
    }
  }
  const parsed = schema.safeParse(entries);
  if (!parsed.success) {
    const rawFields = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const fields: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(rawFields)) {
      if (v && v.length > 0) fields[k] = v;
    }
    return { error: fail("ফর্মে ত্রুটি আছে। লাল চিহ্নিত ফিল্ডগুলো ঠিক করুন।", fields) };
  }
  return parsed.data;
}

/** Audit log writer (uses service-side client with current session cookies). */
export async function writeAuditLog(params: {
  schoolId: string | null;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
}) {
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("audit_logs")
    .insert({
      school_id: params.schoolId,
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId ?? null,
      meta: params.meta ?? {},
    });
}

/** Ensure we have an authenticated session with a specific school membership. */
export async function requireMembershipForAction(
  schoolSlug: string,
): Promise<{ session: ShikkhaSession; active: ActiveSchoolMembership } | { error: ActionResult }> {
  const session = await getSession(schoolSlug);
  if (!session) return { error: fail("সেশন শেষ হয়েছে। আবার লগইন করুন।") };
  const active = session.memberships.find((m) => m.school_slug === schoolSlug);
  if (!active) return { error: fail("এই স্কুলে আপনার অ্যাক্সেস নেই।") };
  return { session, active };
}

/** Shortcut: require permission + return typed membership (or ActionResult error). */
export async function authorizeAction(args: {
  schoolSlug: string;
  action: PermissionAction;
  resource: PermissionResource;
  scope?: { type: PermissionScopeType; id?: string | null };
}): Promise<{ session: ShikkhaSession; active: ActiveSchoolMembership } | { error: ActionResult }> {
  const auth = await requireMembershipForAction(args.schoolSlug);
  if ("error" in auth) return auth;

  const allowed = await hasPermission({
    schoolSlug: args.schoolSlug,
    action: args.action,
    resource: args.resource,
    scope: args.scope ?? { type: "school" },
  });
  if (!allowed) return { error: fail("এই কাজের জন্য আপনার অনুমতি নেই।") };

  return auth;
}
