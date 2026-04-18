/**
 * Parsed, type-safe environment. Import this everywhere instead of process.env.
 *
 * Intentionally ONLY runs on the server/build. NEXT_PUBLIC_* vars reach the
 * client through Next's inlining of process.env.NEXT_PUBLIC_* at build time.
 */

import { envSchema, productionRequired, type Env } from "./env.schema";

// Treat empty strings the same as unset so zod defaults can kick in.
const cleaned: Record<string, string | undefined> = {};
for (const [key, value] of Object.entries(process.env)) {
  cleaned[key] = typeof value === "string" && value.trim() === "" ? undefined : value;
}

const parsed = envSchema.safeParse(cleaned);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:\n",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration. See logs above.");
}

const env = parsed.data;

// Strict gate only for real production deploys (Vercel-live / runtime).
// During `next build` on a developer machine, NODE_ENV is forced to
// "production" by Next but the user may still be scaffolding with no
// secrets — warn instead of failing.
const isRuntimeProduction =
  env.NODE_ENV === "production" &&
  (env.VERCEL_ENV === "production" || process.env.SHIKKHA_STRICT_ENV === "true");

if (env.NODE_ENV === "production") {
  const missing = productionRequired.filter((key) => {
    const value = env[key as keyof Env];
    return value === undefined || value === "" || value === "placeholder-anon-key" || value === "https://placeholder.supabase.co";
  });
  if (missing.length > 0) {
    const msg = `Missing required production env vars: ${missing.join(", ")}`;
    if (isRuntimeProduction) {
      // eslint-disable-next-line no-console
      console.error(`❌ ${msg}`);
      throw new Error(msg);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `⚠ Build-time warning: ${msg}\n` +
          "   Fill .env.local before deploying. Set SHIKKHA_STRICT_ENV=true to make this fatal.",
      );
    }
  }
}

export { env };
export type { Env };
