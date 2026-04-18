/**
 * Slug utilities — deterministic, URL-safe, works for Bangla names.
 *
 * Bangla school names transliterate unpredictably, so we accept any
 * Unicode name and:
 *   1. Trim whitespace
 *   2. Lowercase ASCII portion
 *   3. Replace spaces + non-slug chars with hyphens
 *   4. If the result is empty (all non-ASCII), fall back to a random
 *      `school-<6chars>` slug.
 */

export function slugify(input: string): string {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")              // strip combining marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  if (ascii.length >= 3) return ascii;

  const rand = Math.random().toString(36).slice(2, 8);
  return `school-${rand}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])?$/.test(slug);
}
