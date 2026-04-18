/**
 * Session helpers — all server-side. Wrap Supabase's getUser() with
 * tenant context so every protected page has a single import.
 */

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { UserRole } from "./roles";

export type ActiveSchoolMembership = {
  school_user_id: string;
  school_id: string;
  branch_id: string | null;
  role: UserRole;
  full_name_bn: string | null;
  full_name_en: string | null;
  photo_url: string | null;
  school_slug: string;
  school_name_bn: string;
  school_name_en: string | null;
  school_type: "school" | "madrasa" | "both";
};

/** Row shape returned by the school_users + schools join below. */
type MembershipRow = {
  id: string;
  school_id: string;
  branch_id: string | null;
  role: string;
  full_name_bn: string | null;
  full_name_en: string | null;
  photo_url: string | null;
  status: string;
  schools: {
    slug: string;
    name_bn: string;
    name_en: string | null;
    type: "school" | "madrasa" | "both";
  } | null;
};

export type ShikkhaSession = {
  userId: string;
  email: string | null;
  phone: string | null;
  memberships: ActiveSchoolMembership[];
  active: ActiveSchoolMembership | null;
};

/**
 * Load the current session with memberships. Returns null if not logged in.
 * Cached per-request via React's `cache()`.
 */
export const getSession = cache(async (activeSlug?: string): Promise<ShikkhaSession | null> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load all school memberships for this user, joined to the school for slug/name.
  // Cast to `any` because the Database type is a placeholder until
  // `npx supabase gen types` populates it.
  const { data: rows } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ data: MembershipRow[] | null }>;
        };
      };
    };
  })
    .from("school_users")
    .select(
      `
        id,
        school_id,
        branch_id,
        role,
        full_name_bn,
        full_name_en,
        photo_url,
        status,
        schools:school_id ( slug, name_bn, name_en, type )
      `,
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  const memberships: ActiveSchoolMembership[] = (rows ?? [])
    .filter((r): r is MembershipRow & { schools: NonNullable<MembershipRow["schools"]> } => r.schools != null)
    .map((r) => ({
      school_user_id: r.id,
      school_id: r.school_id,
      branch_id: r.branch_id,
      role: r.role as UserRole,
      full_name_bn: r.full_name_bn,
      full_name_en: r.full_name_en,
      photo_url: r.photo_url,
      school_slug: r.schools.slug,
      school_name_bn: r.schools.name_bn,
      school_name_en: r.schools.name_en,
      school_type: r.schools.type,
    }));

  const active = activeSlug
    ? memberships.find((m) => m.school_slug === activeSlug) ?? null
    : memberships[0] ?? null;

  return {
    userId: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    memberships,
    active,
  };
});

/** Require a logged-in user. Redirects to /login with a `next` parameter. */
export async function requireSession(): Promise<ShikkhaSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Require membership in a specific school slug. */
export async function requireSchoolMembership(slug: string): Promise<{
  session: ShikkhaSession;
  active: ActiveSchoolMembership;
}> {
  const session = await requireSession();
  const active = session.memberships.find((m) => m.school_slug === slug);
  if (!active) redirect("/");
  return { session, active };
}

/** Require one of the given roles in the school. */
export async function requireRole(
  slug: string,
  allowed: UserRole[],
): Promise<ActiveSchoolMembership> {
  const { active } = await requireSchoolMembership(slug);
  if (!allowed.includes(active.role)) redirect(`/school/${slug}`);
  return active;
}

/** Require super admin. */
export async function requireSuperAdmin(): Promise<ShikkhaSession> {
  const session = await requireSession();
  if (!session.memberships.some((m) => m.role === "SUPER_ADMIN")) redirect("/");
  return session;
}
