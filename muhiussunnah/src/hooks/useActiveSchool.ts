"use client";

/**
 * useActiveSchool — client-side hook for the active school membership.
 *
 * Intended to be hydrated from a server-rendered <SchoolContextProvider>
 * placed inside /school/[schoolSlug]/layout.tsx. Until that wiring lands
 * in Phase 1, this reads window.__SHIKKHA_ACTIVE__ if present.
 */

import { useContext, createContext } from "react";
import type { ActiveSchoolMembership } from "@/lib/auth/session";

type ActiveSchoolValue = {
  active: ActiveSchoolMembership | null;
  memberships: ActiveSchoolMembership[];
};

export const ActiveSchoolContext = createContext<ActiveSchoolValue>({
  active: null,
  memberships: [],
});

export function useActiveSchool(): ActiveSchoolValue {
  return useContext(ActiveSchoolContext);
}
