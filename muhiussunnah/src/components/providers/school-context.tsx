"use client";

/**
 * SchoolContextProvider — hydrates the active school membership into a
 * React context so client-side hooks (useActiveSchool, usePermission,
 * useActiveBranch) can read without prop-drilling.
 *
 * Mount this inside /school/[schoolSlug]/layout.tsx after the server
 * has loaded the session.
 */

import type { ReactNode } from "react";
import { ActiveSchoolContext } from "@/hooks/useActiveSchool";
import type { ActiveSchoolMembership } from "@/lib/auth/session";

type Props = {
  active: ActiveSchoolMembership | null;
  memberships: ActiveSchoolMembership[];
  children: ReactNode;
};

export function SchoolContextProvider({ active, memberships, children }: Props) {
  return (
    <ActiveSchoolContext.Provider value={{ active, memberships }}>
      {children}
    </ActiveSchoolContext.Provider>
  );
}
