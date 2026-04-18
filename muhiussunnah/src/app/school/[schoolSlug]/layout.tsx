import type { ReactNode } from "react";
import { requireSchoolMembership } from "@/lib/auth/session";
import { SchoolContextProvider } from "@/components/providers/school-context";

type Props = {
  children: ReactNode;
  params: Promise<{ schoolSlug: string }>;
};

/**
 * Root layout for a single tenant.
 *
 * - Verifies the current user is a member of this school (redirects to / otherwise)
 * - Hydrates ActiveSchoolContext so client components can read school/branch/role
 *
 * Next 16: `params` is a Promise that must be awaited.
 */
export default async function SchoolRootLayout({ children, params }: Props) {
  const { schoolSlug } = await params;
  const { session, active } = await requireSchoolMembership(schoolSlug);

  return (
    <SchoolContextProvider active={active} memberships={session.memberships}>
      {children}
    </SchoolContextProvider>
  );
}
