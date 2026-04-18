/**
 * Bangla ↔ English digit conversion.
 *
 * FRONTEND_UX_GUIDE §6.3: all display-side numbers must be Bangla digits;
 * storage stays English/ASCII. Use these helpers at the display boundary.
 */

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;
const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

export function toBengaliNumber(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
}

export function toArabicNumber(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
}

export function toEnglishNumber(input: string | null | undefined): string {
  if (!input) return "";
  let out = input;
  bengaliDigits.forEach((bd, i) => {
    out = out.replace(new RegExp(bd, "g"), String(i));
  });
  arabicDigits.forEach((ad, i) => {
    out = out.replace(new RegExp(ad, "g"), String(i));
  });
  return out;
}

/** Localise a number according to the current locale. */
export function localiseNumber(
  input: string | number | null | undefined,
  locale: "bn" | "en" | "ar" = "bn",
): string {
  if (input === null || input === undefined) return "";
  switch (locale) {
    case "bn":
      return toBengaliNumber(input);
    case "ar":
      return toArabicNumber(input);
    default:
      return String(input);
  }
}
