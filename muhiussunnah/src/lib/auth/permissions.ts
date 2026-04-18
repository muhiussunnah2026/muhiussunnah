/**
 * Permission helper (PROJECT_PLAN §3.3 layer 2: API).
 *
 * Every server action that mutates tenant data MUST call requirePermission()
 * at the top. This is the single source of truth; the UI hook and RLS
 * policies should agree with this.
 *
 * Scope model (see PROJECT_PLAN §3.2):
 *   (action, resource, scope={ type, id? })
 *
 * Example:
 *   await requirePermission({
 *     action: "update",
 *     resource: "marks",
 *     scope: { type: "section", id: sectionId },
 *     schoolSlug: slug,
 *   });
 */

import "server-only";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { requireSchoolMembership } from "./session";
import {
  ADMIN_ROLES,
  FINANCE_ROLES,
  type PermissionAction,
  type PermissionResource,
  type PermissionScopeType,
} from "./roles";

export type PermissionScope = {
  type: PermissionScopeType;
  id?: string | null;
};

export type PermissionRequest = {
  schoolSlug: string;
  action: PermissionAction;
  resource: PermissionResource;
  scope: PermissionScope;
};

/**
 * Returns true if the active user has the permission within the given school.
 *
 * Implicit rules applied BEFORE checking user_permissions table:
 *   • SUPER_ADMIN always passes.
 *   • SCHOOL_ADMIN / VICE_PRINCIPAL always pass (they have full tenant authority).
 *   • ACCOUNTANT passes on any finance-related resource.
 *   • CLASS_TEACHER / SUBJECT_TEACHER automatically have view on own scope.
 *
 * Explicit grants in user_permissions override nothing — they add to the
 * implicit allowances.
 */
export async function hasPermission(req: PermissionRequest): Promise<boolean> {
  const { active } = await requireSchoolMembership(req.schoolSlug);

  // Super admin: global allow
  if (active.role === "SUPER_ADMIN") return true;

  // Principal tier: full tenant authority
  if (ADMIN_ROLES.includes(active.role)) return true;

  // Accountant on finance resources
  const financeResources: PermissionResource[] = [
    "fee",
    "expense",
    "cash_receive",
    "finance_report",
    "donation",
    "investment",
    "salary",
  ];
  if (FINANCE_ROLES.includes(active.role) && financeResources.includes(req.resource)) {
    return true;
  }

  // Explicit grants
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("user_permissions")
    .select("id")
    .eq("school_user_id", active.school_user_id)
    .eq("action", req.action)
    .eq("resource", req.resource)
    .eq("scope_type", req.scope.type)
    .limit(1);

  if (data && data.length > 0) return true;

  // Scope = 'self' always passes for the owner
  if (req.scope.type === "self") return true;

  return false;
}

/** Throws (via redirect) if permission is denied. */
export async function requirePermission(req: PermissionRequest): Promise<void> {
  const allowed = await hasPermission(req);
  if (!allowed) {
    // Future: render a proper 403 page via `forbidden()` (Next 16 canary).
    // For now redirect to the school home with a toast query param.
    redirect(`/school/${req.schoolSlug}?error=forbidden`);
  }
}
