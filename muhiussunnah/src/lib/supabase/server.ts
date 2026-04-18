/**
 * Supabase server client.
 *
 * Used in Server Components, Server Actions, Route Handlers, and proxy.ts.
 * Bound to the incoming request cookies so auth flows through naturally.
 *
 * Next.js 16 note: `cookies()` is async — await it.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import type { Database } from "./types";

/**
 * For use inside Server Components, Server Actions, and Route Handlers.
 * Automatically wires up cookie reads/writes to the Next.js request.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options as CookieOptions);
            }
          } catch {
            // Called from a Server Component — cookies cannot be set
            // there. The proxy refreshes the session for us.
          }
        },
      },
    },
  );
}
