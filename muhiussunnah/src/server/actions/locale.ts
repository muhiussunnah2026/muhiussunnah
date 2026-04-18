"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";

export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) return { ok: false as const, error: "Invalid locale" };
  const jar = await cookies();
  jar.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
