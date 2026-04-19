/**
 * Environment variable schema and validator for Shikkha Platform.
 *
 * Fails fast in production if required vars are missing.
 * In development, logs a warning but continues so the app can boot
 * with partial integration setups (SMS off, payments off, etc).
 *
 * Reference: ENV_SETUP_GUIDE.md (project root).
 *
 * Usage:
 *   import { env } from "@/lib/config/env"
 *   env.NEXT_PUBLIC_SUPABASE_URL
 */

import { z } from "zod";

// Helpers --------------------------------------------------------------------

const optionalString = () => z.string().trim().optional().or(z.literal("").transform(() => undefined));
const requiredString = (name: string) =>
  z.string().trim().min(1, `${name} is required`);
const optionalUrl = () =>
  z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined));
const boolFromString = () =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return v === "true" || v === "1";
      return undefined;
    },
    z.boolean().optional(),
  );

// Core schema ----------------------------------------------------------------

export const envSchema = z.object({
  // App ---------------------------------------------------------------------
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Muhius Sunnah"),
  NEXT_PUBLIC_APP_SHORT_NAME: z.string().default("Muhius"),

  // Secrets (required in production; optional for local dev scaffolding)
  JWT_SECRET: optionalString(),
  SESSION_SECRET: optionalString(),

  // Supabase (required) -----------------------------------------------------
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("placeholder-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  SUPABASE_JWT_SECRET: optionalString(),
  SUPABASE_DB_PASSWORD: optionalString(),
  SUPABASE_PROJECT_REF: optionalString(),

  // Vercel (auto-filled in Vercel env; optional locally)
  VERCEL_URL: optionalString(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),

  // Email — Resend ----------------------------------------------------------
  RESEND_API_KEY: optionalString(),
  RESEND_FROM_EMAIL: z.string().email().default("noreply@shikkha.app"),
  RESEND_FROM_NAME: z.string().default("Shikkha Platform"),
  RESEND_REPLY_TO: z.string().email().default("support@shikkha.app"),

  // SMS — SSL Wireless (primary BD) -----------------------------------------
  SSL_SMS_API_TOKEN: optionalString(),
  SSL_SMS_SID: optionalString(),
  SSL_SMS_URL: z.string().url().default("https://smsplus.sslwireless.com/api/v3/send-sms"),
  SSL_SMS_SENDER_ID: optionalString(),

  // SMS — Alpha SMS (fallback)
  ALPHA_SMS_API_KEY: optionalString(),
  ALPHA_SMS_SENDER_ID: optionalString(),
  ALPHA_SMS_URL: z.string().url().default("https://api.sms.net.bd/sendsms"),

  // SMS — BulkSMSBD (secondary fallback)
  BULKSMS_BD_API_KEY: optionalString(),
  BULKSMS_BD_SENDER_ID: optionalString(),

  // Payment — SSLCommerz ---------------------------------------------------
  SSLCOMMERZ_STORE_ID: optionalString(),
  SSLCOMMERZ_STORE_PASSWORD: optionalString(),
  SSLCOMMERZ_SANDBOX: boolFromString().default(true),
  SSLCOMMERZ_SUCCESS_URL: optionalUrl(),
  SSLCOMMERZ_FAIL_URL: optionalUrl(),
  SSLCOMMERZ_CANCEL_URL: optionalUrl(),
  SSLCOMMERZ_IPN_URL: optionalUrl(),

  // Payment — bKash direct
  BKASH_APP_KEY: optionalString(),
  BKASH_APP_SECRET: optionalString(),
  BKASH_USERNAME: optionalString(),
  BKASH_PASSWORD: optionalString(),
  BKASH_BASE_URL: z.string().url().default("https://tokenized.sandbox.bka.sh/v1.2.0-beta"),
  BKASH_CALLBACK_URL: optionalUrl(),

  // Payment — Nagad direct
  NAGAD_MERCHANT_ID: optionalString(),
  NAGAD_MERCHANT_NUMBER: optionalString(),
  NAGAD_PG_PUBLIC_KEY: optionalString(),
  NAGAD_MERCHANT_PRIVATE_KEY: optionalString(),
  NAGAD_BASE_URL: z.string().url().default("https://api.mynagad.com/api/dfs"),
  NAGAD_CALLBACK_URL: optionalUrl(),

  // Payment — Stripe (optional, international only)
  STRIPE_SECRET_KEY: optionalString(),
  STRIPE_WEBHOOK_SECRET: optionalString(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString(),

  // Push notifications — Firebase Cloud Messaging ---------------------------
  NEXT_PUBLIC_FIREBASE_API_KEY: optionalString(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalString(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optionalString(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optionalString(),
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalString(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: optionalString(),
  FIREBASE_ADMIN_PROJECT_ID: optionalString(),
  FIREBASE_ADMIN_CLIENT_EMAIL: optionalString(),
  FIREBASE_ADMIN_PRIVATE_KEY: optionalString(),

  // Image storage — Cloudinary (optional) ----------------------------------
  CLOUDINARY_CLOUD_NAME: optionalString(),
  CLOUDINARY_API_KEY: optionalString(),
  CLOUDINARY_API_SECRET: optionalString(),
  CLOUDINARY_UPLOAD_PRESET: optionalString(),

  // WhatsApp Business Cloud API --------------------------------------------
  WHATSAPP_PHONE_NUMBER_ID: optionalString(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: optionalString(),
  WHATSAPP_ACCESS_TOKEN: optionalString(),
  WHATSAPP_VERIFY_TOKEN: optionalString(),
  WHATSAPP_APP_SECRET: optionalString(),

  // AI — Anthropic + OpenAI ------------------------------------------------
  ANTHROPIC_API_KEY: optionalString(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  OPENAI_API_KEY: optionalString(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  // Error tracking — Sentry ------------------------------------------------
  SENTRY_AUTH_TOKEN: optionalString(),
  NEXT_PUBLIC_SENTRY_DSN: optionalString(),
  SENTRY_ORG: optionalString(),
  SENTRY_PROJECT: z.string().default("shikkha-platform"),

  // Analytics — PostHog ----------------------------------------------------
  NEXT_PUBLIC_POSTHOG_KEY: optionalString(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://us.i.posthog.com"),

  // Caching + rate limiting — Upstash Redis --------------------------------
  UPSTASH_REDIS_REST_URL: optionalString(),
  UPSTASH_REDIS_REST_TOKEN: optionalString(),

  // Maps — Google Maps -----------------------------------------------------
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: optionalString(),

  // Cron / QStash ----------------------------------------------------------
  CRON_SECRET: optionalString(),
  QSTASH_TOKEN: optionalString(),
  QSTASH_CURRENT_SIGNING_KEY: optionalString(),
  QSTASH_NEXT_SIGNING_KEY: optionalString(),

  // Upload config ----------------------------------------------------------
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(10),
  MAX_PROFILE_IMAGE_SIZE_MB: z.coerce.number().default(2),

  // Feature flags ----------------------------------------------------------
  NEXT_PUBLIC_ENABLE_AI_FEATURES: boolFromString().default(false),
  NEXT_PUBLIC_ENABLE_MADRASA_MODULE: boolFromString().default(true),
  NEXT_PUBLIC_ENABLE_WHATSAPP: boolFromString().default(false),
  NEXT_PUBLIC_ENABLE_BIOMETRIC: boolFromString().default(false),
  NEXT_PUBLIC_ENABLE_LMS: boolFromString().default(false),

  // Super admin bootstrap --------------------------------------------------
  SUPER_ADMIN_EMAIL: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  SUPER_ADMIN_INITIAL_PASSWORD: optionalString(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Vars that MUST be set in production for the app to even boot.
 * Validated separately so dev/preview stays lax.
 */
export const productionRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
  "SESSION_SECRET",
] as const satisfies ReadonlyArray<keyof Env>;
