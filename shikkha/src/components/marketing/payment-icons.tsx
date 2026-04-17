/**
 * Inline SVG payment method badges — light/dark theme-aware.
 * All methods relevant to Bangladesh + international.
 */

export const paymentMethods = [
  { name: "bKash", bg: "bg-[#E2136E]", text: "text-white", label: "bKash" },
  { name: "Nagad", bg: "bg-[#EC1C24]", text: "text-white", label: "Nagad" },
  { name: "Rocket", bg: "bg-[#8A1D88]", text: "text-white", label: "Rocket" },
  { name: "Upay", bg: "bg-[#00A651]", text: "text-white", label: "Upay" },
  { name: "SSLCOMMERZ", bg: "bg-[#1D63ED]", text: "text-white", label: "SSL" },
  { name: "VISA", bg: "bg-[#1A1F71]", text: "text-[#F7B600]", label: "VISA" },
  { name: "Mastercard", bg: "bg-white dark:bg-neutral-900", text: "text-[#EB001B]", label: "MC" },
  { name: "AMEX", bg: "bg-[#006FCF]", text: "text-white", label: "AMEX" },
  { name: "PayPal", bg: "bg-[#003087]", text: "text-[#009CDE]", label: "PayPal" },
  { name: "GPay", bg: "bg-white dark:bg-neutral-900", text: "text-foreground", label: "G Pay" },
  { name: "Apple Pay", bg: "bg-black dark:bg-white", text: "text-white dark:text-black", label: "\uF8FF Pay" },
  { name: "Stripe", bg: "bg-[#635BFF]", text: "text-white", label: "Stripe" },
] as const;

export function PaymentIcons() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {paymentMethods.map((m) => (
        <div
          key={m.name}
          title={m.name}
          className={`${m.bg} ${m.text} rounded-lg px-2.5 py-2 text-center text-[10px] font-bold border border-border/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
}
