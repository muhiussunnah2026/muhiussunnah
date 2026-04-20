/**
 * proxy.ts — Next.js 16 request middleware (renamed from middleware.ts).
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookie so server components see a valid user.
 *   2. Gate auth-required routes; redirect unauthenticated users to /login.
 *   3. Parse the tenant slug from /school/[slug]/... and stamp it into a
 *      request header so downstream layouts can read it cheaply.
 *   4. Guard /super-admin/* with a minimal "is logged in" check; deep role
 *      enforcement happens in each dashboard's layout (server-side) via
 *      requirePermission.
 *
 * Next.js 16 changes this file from `middleware.ts` (exporting `middleware`)
 * to `proxy.ts` (exporting `proxy`). See proxy docs.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/config/env";
import { defaultLocale, isLocale, localeCookieName } from "@/lib/i18n/config";

const PUBLIC_PATHS = new Set([
  "/",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/support",
  "/refund-policy",
  "/terms",
  "/privacy",
  "/pay/success",
  "/pay/fail",
  "/pay/cancel",
]);

/**
 * Primary platform hostname. Requests from other hostnames are treated as
 * potential custom domains for a school (Scale plan), rewritten to /s/[slug].
 * Configure via PLATFORM_HOST env; defaults cover local dev + shikkha.app.
 */
const PLATFORM_HOSTS = new Set(
  (process.env.PLATFORM_HOSTS ?? "muhiussunnah.app,www.muhiussunnah.app,muhiussunnah.vercel.app,shikkha.app,www.shikkha.app,localhost:3000,localhost,shikkha.vercel.app")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

const AUTH_PATHS = new Set([
  "/login",
  "/register-school",
  "/forgot-password",
  "/reset-password",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (AUTH_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/s/")) return true;                // public school pages
  if (pathname.startsWith("/pricing/")) return true;          // pricing detail pages
  if (pathname.startsWith("/pay/")) return true;              // public payment callbacks
  if (pathname.startsWith("/api/public")) return true;
  if (pathname.startsWith("/api/auth/callback")) return true;
  if (pathname.startsWith("/api/payment/")) return true;      // gateway webhooks
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/static/")) return true;
  if (pathname.startsWith("/icons/")) return true;
  if (pathname.startsWith("/payments/")) return true;         // payment logo SVGs
  if (pathname === "/favicon.ico" || pathname === "/favicon.svg") return true;
  if (pathname === "/manifest.webmanifest") return true;
  return false;
}

/**
 * Custom-domain lookup stub.
 *
 * For Scale-plan schools with a configured custom domain (e.g.
 * example-school.edu.bd) Vercel points the domain at this app, and we map the
 * Host header to a school slug. The real mapping lives in the
 * `school_custom_domains` table (future migration) or in env for static demos.
 *
 * For now we allow CUSTOM_DOMAIN_<HOST>=<slug> env pairs:
 *   CUSTOM_DOMAIN_example.edu.bd=example-school
 */
function customDomainToSlug(host: string): string | null {
  const env = process.env[`CUSTOM_DOMAIN_${host.toLowerCase()}`];
  return env ?? null;
}

export async function proxy(request: NextRequest) {
  // --- Custom domain rewrite --------------------------------------------
  // If the request comes from a non-platform host, try to route it to the
  // mapped school's public page at /s/[slug].
  const host = (request.headers.get("host") ?? "").toLowerCase();
  if (host && !PLATFORM_HOSTS.has(host)) {
    const slug = customDomainToSlug(host);
    if (slug) {
      const url = request.nextUrl.clone();
      // Only rewrite the root/public routes; /school/[slug]/* (authed) stays
      // accessible via the platform host.
      if (url.pathname === "/" || url.pathname === "/index.html") {
        url.pathname = `/s/${slug}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  let response = NextResponse.next({ request });

  // --- Locale cookie bootstrap ------------------------------------------
  // If the visitor has no locale cookie (first visit, incognito, or cleared
  // cookies) we seed it with the default locale (Bangla). This ignores the
  // browser's Accept-Language header by design — the product is Bangladesh-
  // first and should always open in Bangla until the user picks otherwise
  // from the language switcher.
  const existingLocale = request.cookies.get(localeCookieName)?.value;
  if (!isLocale(existingLocale)) {
    request.cookies.set(localeCookieName, defaultLocale);
    response.cookies.set(localeCookieName, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const { pathname } = request.nextUrl;

  // --- Tenant slug header (legacy, for /school/[slug] backwards-compat) -
  const schoolMatch = pathname.match(/^\/school\/([^/]+)/);
  if (schoolMatch) {
    response.headers.set("x-school-slug", schoolMatch[1]);
  }

  // --- Fast path: no auth work for truly public, non-auth routes --------
  // Marketing pages, public school pages, webhooks, etc. don't need us to
  // hit Supabase to validate the session on every navigation.
  const requiresAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/school/") ||       // legacy URLs still auth-gated
    pathname.startsWith("/super-admin") ||
    (pathname.startsWith("/api/") && !isPublicPath(pathname));
  const isAuthPage = AUTH_PATHS.has(pathname);
  if (!requiresAuth && !isAuthPage) {
    return response;
  }

  // --- Cheap cookie-existence short-circuit -----------------------------
  // If there's no Supabase auth cookie AT ALL, we don't need to spin up
  // a Supabase client or hit the network. Just redirect unauth'd users
  // and let authed auth-pages pass through.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  if (!hasAuthCookie) {
    if (requiresAuth) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", pathname);
      return NextResponse.redirect(redirect);
    }
    return response;
  }

  // --- Supabase session refresh ------------------------------------------
  // We MUST use `getSession()` here, not `getUser()`. getUser() hits the
  // Supabase Auth server on every request (adds 300–900ms of latency per
  // dashboard navigation). getSession() reads the cookie locally and only
  // makes a network request when the access token is expired and needs a
  // refresh. Security-wise, permission enforcement still happens in the
  // RSC layouts via `requireRole() → supabase.auth.getUser()` which DOES
  // verify, so nothing is weakened — we just stop paying the auth roundtrip
  // twice per click.
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options as CookieOptions);
          }
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // --- Auth gating -------------------------------------------------------
  if (!session && requiresAuth) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (session && isAuthPage) {
    // Already logged in — bounce away from the auth pages
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // Skip Next internals and public asset paths. Note: always include the
  // root and dynamic paths so auth cookies refresh on every navigation.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|static/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
