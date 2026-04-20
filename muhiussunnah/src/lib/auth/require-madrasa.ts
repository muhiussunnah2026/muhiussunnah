import "server-only";

import { redirect } from "next/navigation";
import { requireSchoolMembership } from "./session";
import { requireActiveRole } from "./active-school";
import type { UserRole } from "./roles";

/**
 * Gate a route behind: (a) active school membership with one of the
 * allowed roles, AND (b) school type must be 'madrasa' or 'both'.
 *
 * School-type tenants get redirected to the admin home — madrasa
 * features are feature-flagged.
 */
export async function requireMadrasaRole(slug: string, allowed: UserRole[]) {
  const { session, active } = await requireSchoolMembership(slug);
  if (!allowed.includes(active.role)) redirect(`/school/${slug}`);
  if (active.school_type !== "madrasa" && active.school_type !== "both") {
    redirect(`/admin`);
  }
  return { session, active };
}

/**
 * Cookie/active-school variant — same semantics but no slug param.
 * Use inside clean-URL routes (/admin/madrasa/*).
 */
export async function requireActiveMadrasaRole(allowed: UserRole[]) {
  const active = await requireActiveRole(allowed);
  if (active.school_type !== "madrasa" && active.school_type !== "both") {
    redirect(`/admin`);
  }
  return { active };
}
