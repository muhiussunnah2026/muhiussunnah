import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Post-authentication redirector.
 *
 * Used after a password reset / first-time setup. The client just
 * navigates to /post-auth and we figure out the right destination
 * based on the user's primary school_users role:
 *
 *   SUPER_ADMIN                                     → /super-admin
 *   CLASS_TEACHER / SUBJECT_TEACHER / MADRASA_USTADH → /teacher
 *   STUDENT / PARENT                                → /portal
 *   anything else (admin tier)                       → /admin
 *   no membership                                    → /
 *   no session                                       → /login
 *
 * Lives outside any layout group so it doesn't pay for the auth
 * shell render — just reads the cookie + 1 DB lookup + 302.
 */
export async function GET(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const origin = new URL(request.url).origin;

  if (!session) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data } = await admin
    .from("school_users")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const role = data?.role as string | undefined;

  let destination = "/";
  if (role === "SUPER_ADMIN") {
    destination = "/super-admin";
  } else if (
    role === "CLASS_TEACHER" ||
    role === "SUBJECT_TEACHER" ||
    role === "MADRASA_USTADH"
  ) {
    destination = "/teacher";
  } else if (role === "STUDENT" || role === "PARENT") {
    destination = "/portal";
  } else if (role) {
    // Admin tier: SCHOOL_ADMIN, VICE_PRINCIPAL, ACCOUNTANT,
    // BRANCH_ADMIN, LIBRARIAN, TRANSPORT_MANAGER, HOSTEL_WARDEN,
    // CANTEEN_MANAGER, COUNSELOR — they all land on /admin and the
    // route gates the deeper actions per role.
    destination = "/admin";
  }

  return NextResponse.redirect(new URL(destination, origin));
}
