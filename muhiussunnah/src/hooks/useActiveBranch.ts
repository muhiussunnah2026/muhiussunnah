"use client";

/**
 * useActiveBranch — current branch within the active school.
 *
 * A Principal can switch between branches; a Branch Admin is pinned to
 * their assigned branch. The branch id lives in the ActiveSchoolContext.
 */

import { useActiveSchool } from "./useActiveSchool";

export function useActiveBranch(): string | null {
  const { active } = useActiveSchool();
  return active?.branch_id ?? null;
}
