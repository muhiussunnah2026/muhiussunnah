import "server-only";

import { redirect } from "next/navigation";
import { requireSchoolMembership } from "./session";
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
    redirect(`/school/${slug}/admin`);
  }
  return { session, active };
}
