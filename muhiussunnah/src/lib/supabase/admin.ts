/**
 * Supabase admin (service-role) client.
 *
 * ⚠  SERVER-ONLY. Never import from a Client Component or anywhere
 * that could be bundled for the browser. This client bypasses RLS.
 *
 * Use sparingly — only for operations that genuinely need to cross
 * tenant boundaries (Super Admin console, scheduled jobs, webhook
 * receivers that don't have a user session yet).
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";
import type { Database } from "./types";

let adminClient: ReturnType<typeof createClient<Database>> | undefined;

export function supabaseAdmin() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations are unavailable.",
    );
  }

  if (adminClient) return adminClient;

  adminClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return adminClient;
}
