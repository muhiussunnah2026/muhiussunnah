/**
 * Firebase Cloud Messaging — push notifications.
 *
 * Uses the HTTP v1 API with Google service-account credentials.
 * We build our own JWT + access token to avoid pulling in
 * firebase-admin SDK (keeps bundle lean).
 *
 * Docs: https://firebase.google.com/docs/cloud-messaging/send-message
 */

import "server-only";
import { env } from "@/lib/config/env";

export function isPushConfigured(): boolean {
  return Boolean(
    env.FIREBASE_ADMIN_PROJECT_ID &&
      env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

type PushResult = { ok: true; messageName: string } | { ok: false; error: string };

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!isPushConfigured()) return null;
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: nowSec + 3600,
    iat: nowSec,
  };
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const toSign = `${encode(header)}.${encode(payload)}`;

  const { createSign } = await import("node:crypto");
  const pk = (env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  const signer = createSign("RSA-SHA256");
  signer.update(toSign);
  const signature = signer.sign(pk).toString("base64url");
  const jwt = `${toSign}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export async function sendPush(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<PushResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: "Push access token unavailable" };

  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: deviceToken,
            notification: { title, body },
            data: data ?? {},
          },
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const payload = (await res.json()) as { name?: string };
    if (!payload.name) return { ok: false, error: "No message name returned" };
    return { ok: true, messageName: payload.name };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
