"use client";

/**
 * usePermission — client-side permission check (PROJECT_PLAN §3.3 layer 3).
 *
 * This mirrors the server-side requirePermission() logic but stays fast
 * and synchronous for conditional rendering. The authoritative check is
 * still the server — never trust this alone for mutations.
 *
 * Explicit grants are loaded once per session into <SchoolContextProvider>
 * and exposed here. For scopes that depend on row-level info (e.g. only
 * view marks for section X), pass the relevant scope id.
 */

import { useMemo } from "react";
import { useActiveSchool } from "./useActiveSchool";
import {
  ADMIN_ROLES,
  FINANCE_ROLES,
  type PermissionAction,
  type PermissionResource,
  type PermissionScopeType,
} from "@/lib/auth/roles";

export type UsePermissionArgs = {
  action: PermissionAction;
  resource: PermissionResource;
  scope?: { type: PermissionScopeType; id?: string | null };
};

const FINANCE_RESOURCES: PermissionResource[] = [
  "fee",
  "expense",
  "cash_receive",
  "finance_report",
  "donation",
  "investment",
  "salary",
];

export function usePermission(args: UsePermissionArgs): boolean {
  const { active } = useActiveSchool();

  return useMemo(() => {
    if (!active) return false;
    if (active.role === "SUPER_ADMIN") return true;
    if (ADMIN_ROLES.includes(active.role)) return true;
    if (FINANCE_ROLES.includes(active.role) && FINANCE_RESOURCES.includes(args.resource)) return true;
    if (args.scope?.type === "self") return true;

    // TODO: wire explicit grants from server context once SchoolContextProvider
    // hydrates permissions[]. Until then, deny by default for non-privileged roles.
    return false;
  }, [active, args.action, args.resource, args.scope?.type, args.scope?.id]);
}
