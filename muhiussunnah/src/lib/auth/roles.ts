/**
 * Roles and role-grouping constants (PROJECT_PLAN §3.1).
 *
 * Mirrors the `public.user_role` enum in the database.
 */

export const USER_ROLES = [
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "VICE_PRINCIPAL",
  "ACCOUNTANT",
  "BRANCH_ADMIN",
  "CLASS_TEACHER",
  "SUBJECT_TEACHER",
  "MADRASA_USTADH",
  "LIBRARIAN",
  "TRANSPORT_MANAGER",
  "HOSTEL_WARDEN",
  "CANTEEN_MANAGER",
  "COUNSELOR",
  "STUDENT",
  "PARENT",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Roles with principal-level authority inside a tenant.
 *  SUPER_ADMIN is included so platform owners can open any school's
 *  admin dashboard alongside their /super-admin area. */
export const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "VICE_PRINCIPAL",
  "BRANCH_ADMIN",
];

/** Roles that enter the teacher dashboard. */
export const TEACHER_ROLES: UserRole[] = [
  "CLASS_TEACHER",
  "SUBJECT_TEACHER",
  "MADRASA_USTADH",
];

/** Roles that can touch finance. */
export const FINANCE_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "VICE_PRINCIPAL",
  "ACCOUNTANT",
];

/** Roles that enter the parent/student portal. */
export const PORTAL_ROLES: UserRole[] = ["STUDENT", "PARENT"];

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role ? ADMIN_ROLES.includes(role) : false;
}

export function isTeacherRole(role: UserRole | null | undefined): boolean {
  return role ? TEACHER_ROLES.includes(role) : false;
}

export function isPortalRole(role: UserRole | null | undefined): boolean {
  return role ? PORTAL_ROLES.includes(role) : false;
}

/** Permission action verbs (PROJECT_PLAN §3.2). */
export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
  "export",
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Resources the permission system protects. */
export const PERMISSION_RESOURCES = [
  "student",
  "attendance",
  "marks",
  "fee",
  "exam",
  "salary",
  "class",
  "subject",
  "notice",
  "report_card",
  "finance_report",
  "donation",
  "investment",
  "hifz",
  "sabaq",
  "certificate",
  "expense",
  "cash_receive",
  "library",
  "transport",
  "hostel",
  "inventory",
  "support_ticket",
] as const;
export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const PERMISSION_SCOPE_TYPES = [
  "school",
  "branch",
  "class",
  "section",
  "subject",
  "student",
  "self",
] as const;
export type PermissionScopeType = (typeof PERMISSION_SCOPE_TYPES)[number];
