/**
 * Supabase browser client.
 *
 * Used in Client Components and Client-side hooks. Never expose the
 * service role key here — this client uses the anon key and relies on
 * Row Level Security to enforce access.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function supabaseBrowser() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
