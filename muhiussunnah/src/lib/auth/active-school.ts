/**
 * Active school — cookie-based tenant resolution.
 *
 * Previously every dashboard route encoded the tenant as a URL path
 * segment (`/school/[schoolSlug]/admin/...`). We moved to clean,
 * Vercel-/GitHub-style URLs (`/admin/...`) where the active tenant
 * is resolved from a signed cookie on every request.
 *
 * Security model (defense-in-depth):
 *   1. Supabase auth cookie proves WHO the user is (verified via getUser).
 *   2. `active_school_id` cookie says WHICH school they're acting in.
 *   3. `getActiveSchool()` confirms the user actually has an active
 *      membership in that school — cookie tampering fails this check.
 *   4. Supabase RLS is the atomic-bomb-proof final gate: every query
 *      is filtered by `school_id IN (user's memberships)` at DB level.
 *
 * If the cookie is missing/tampered/stale, we fall back to the user's
 * first active membership (with the cookie rewritten) or — if they
 * have no memberships at all — redirect to login.
 */

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, type ActiveSchoolMembership } from "./session";
import type { UserRole } from "./roles";

export const ACTIVE_SCHOOL_COOKIE = "active_school_id";
/** 30 days — refreshed on every dashboard load so it stays fresh. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Resolve the user's active school + role from the session cookie.
 *
 * Redirects to /login if not authenticated, or returns the validated
 * membership. Per-request cached so layout + page + actions all share
 * a single lookup.
 */
export const getActiveSchool = cache(async (): Promise<ActiveSchoolMembership> => {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.memberships.length === 0) {
    // Authenticated but belongs to no school — e.g. they just signed up
    // but haven't completed registration. Route them to a safe page.
    redirect("/register-school");
  }

  const jar = await cookies();
  const cookieSchoolId = jar.get(ACTIVE_SCHOOL_COOKIE)?.value ?? null;

  // Pick the membership that matches the cookie. If cookie is missing,
  // tampered, or points to a school the user no longer belongs to,
  // silently fall back to the first active membership.
  const active =
    session.memberships.find((m) => m.school_id === cookieSchoolId) ??
    session.memberships[0];

  // Keep the cookie in sync with the resolved active school. This also
  // rewrites tampered cookies back to a legitimate value and refreshes
  // the max-age on every page load.
  if (cookieSchoolId !== active.school_id) {
    try {
      jar.set(ACTIVE_SCHOOL_COOKIE, active.school_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    } catch {
      // Called from a pure Server Component — cookie.set can't run
      // here; the proxy middleware will sync it on the next request.
    }
  }

  return active;
});

/**
 * Like `getActiveSchool`, but also enforces that the user has one of
 * the provided roles. Use at the top of any page/action that needs a
 * specific role gate.
 *
 * Example:
 *   const active = await requireActiveRole(["SCHOOL_ADMIN", "ACCOUNTANT"]);
 */
export async function requireActiveRole(
  allowed: UserRole[],
): Promise<ActiveSchoolMembership> {
  const active = await getActiveSchool();
  if (!allowed.includes(active.role)) {
    // They have SOME role in this school but not one that allows this
    // page. Send them to the school's root so they don't see a blank.
    redirect("/");
  }
  return active;
}

/**
 * Server action: switch the active school to a different membership.
 *
 * Validates that the target school_id is actually in the user's
 * memberships list — so a tampered request body can't grant access.
 */
export async function setActiveSchool(targetSchoolId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const target = session.memberships.find((m) => m.school_id === targetSchoolId);
  if (!target) {
    // Attempted to switch to a school the user isn't a member of.
    // Reject silently by redirecting to a safe page.
    redirect("/");
  }

  const jar = await cookies();
  jar.set(ACTIVE_SCHOOL_COOKIE, target.school_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Clear the active-school cookie (logout cleanup). */
export async function clearActiveSchool(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACTIVE_SCHOOL_COOKIE);
}
