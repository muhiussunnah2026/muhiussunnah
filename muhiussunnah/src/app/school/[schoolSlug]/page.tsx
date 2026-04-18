import { redirect } from "next/navigation";
import { requireSchoolMembership } from "@/lib/auth/session";
import { isAdminRole, isTeacherRole, isPortalRole } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

/**
 * School root — forwards to the dashboard matching the user's role.
 */
export default async function SchoolIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const { active } = await requireSchoolMembership(schoolSlug);

  if (isAdminRole(active.role) || active.role === "ACCOUNTANT") {
    redirect(`/school/${schoolSlug}/admin`);
  }
  if (isTeacherRole(active.role)) {
    redirect(`/school/${schoolSlug}/teacher`);
  }
  if (isPortalRole(active.role)) {
    redirect(`/school/${schoolSlug}/portal`);
  }
  // Other staff roles (librarian, transport manager, etc.) default to admin
  // with limited permissions visible in the nav.
  redirect(`/school/${schoolSlug}/admin`);
}
