import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://muhiussunnah.vercel.app";

/**
 * Emits a BreadcrumbList JSON-LD block only (no visible UI). Use when the
 * page already renders a back-link or visual breadcrumb and you just want
 * the structured-data signal for Google.
 */
export function BreadcrumbJsonLd({
  items,
  id,
}: {
  items: Array<{ label: string; href: string }>;
  id: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.label,
        item: `${SITE_URL}${it.href}`,
      })),
    ],
  };

  return (
    <Script
      id={`breadcrumb-jsonld-${id}`}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
