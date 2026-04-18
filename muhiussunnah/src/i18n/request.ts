/**
 * next-intl request handler.
 *
 * Resolves locale from cookie (set by locale switcher / proxy) and
 * returns the corresponding message bundle.
 */

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  const locale: Locale = isLocale(fromCookie) ? fromCookie : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "Asia/Dhaka",
    now: new Date(),
  };
});
