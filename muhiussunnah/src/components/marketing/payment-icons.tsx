/* eslint-disable @next/next/no-img-element */

/**
 * Payment method badges — uses real SVG logos from /public/payments/.
 * Each badge is a white card with subtle border that wraps the logo SVG.
 */

const methods = [
  { name: "bKash",       src: "/payments/bkash.svg" },
  { name: "Nagad",       src: "/payments/nagad.svg" },
  { name: "Rocket",      src: "/payments/rocket.svg" },
  { name: "Upay",        src: "/payments/upay.svg" },
  { name: "SSLCOMMERZ",  src: "/payments/sslcommerz.svg" },
  { name: "VISA",        src: "/payments/visa.svg" },
  { name: "Mastercard",  src: "/payments/mastercard.svg" },
  { name: "AMEX",        src: "/payments/amex.svg" },
  { name: "PayPal",      src: "/payments/paypal.svg" },
  { name: "Google Pay",  src: "/payments/gpay.svg" },
  { name: "Apple Pay",   src: "/payments/applepay.svg" },
  { name: "Stripe",      src: "/payments/stripe.svg" },
] as const;

export function PaymentIcons() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {methods.map((m) => (
        <div
          key={m.name}
          title={m.name}
          className="group flex items-center justify-center rounded-lg border border-border/50 bg-white dark:bg-neutral-900/60 p-1.5 h-11 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
        >
          <img
            src={m.src}
            alt={m.name}
            className="h-full w-auto object-contain max-w-full"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
