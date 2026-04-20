import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSchoolMembership } from "@/lib/auth/session";
import { ACTIVE_SCHOOL_COOKIE } from "@/lib/auth/active-school";
import { isAdminRole, isTeacherRole, isPortalRole } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

/**
 * Backwards-compatible entry point for old `/school/[slug]` bookmarks.
 *
 * URL structure moved from `/school/[slug]/admin/...` to clean root-level
 * `/admin/...` paths with the active school stored in a cookie. This page
 * preserves old links by:
 *   1. Validating the user has a membership in the requested slug.
 *   2. Setting the active_school_id cookie to that school.
 *   3. Redirecting to the appropriate root-level dashboard for their role.
 */
export default async function SchoolSlugRedirectPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const { active } = await requireSchoolMembership(schoolSlug);

  const jar = await cookies();
  jar.set(ACTIVE_SCHOOL_COOKIE, active.school_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  if (isAdminRole(active.role) || active.role === "ACCOUNTANT") redirect("/admin");
  if (isTeacherRole(active.role)) redirect("/teacher");
  if (isPortalRole(active.role)) redirect("/portal");
  redirect("/admin");
}
