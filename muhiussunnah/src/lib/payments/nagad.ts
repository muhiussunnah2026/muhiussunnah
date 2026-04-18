/**
 * Nagad direct integration (optional, lowest fees — 1.75%).
 *
 * Scaffold for Phase 3. Full implementation requires RSA key-pair
 * encryption for request signing which we wire up once the merchant
 * approval + key exchange is complete.
 *
 * For now we expose the "is configured" check + placeholder init that
 * returns a helpful error until credentials land.
 */

import "server-only";
import { env } from "@/lib/config/env";

export function isNagadConfigured(): boolean {
  return Boolean(
    env.NAGAD_MERCHANT_ID &&
      env.NAGAD_MERCHANT_NUMBER &&
      env.NAGAD_PG_PUBLIC_KEY &&
      env.NAGAD_MERCHANT_PRIVATE_KEY,
  );
}

export async function createNagadPayment(_input: {
  amount: number;
  invoiceNumber: string;
}): Promise<{ ok: false; error: string }> {
  if (!isNagadConfigured()) {
    return { ok: false, error: "Nagad credentials not set. Use SSLCommerz until then." };
  }
  // Full RSA-encrypted init lands once merchant activation completes.
  return { ok: false, error: "Nagad direct integration coming in a follow-up release." };
}
