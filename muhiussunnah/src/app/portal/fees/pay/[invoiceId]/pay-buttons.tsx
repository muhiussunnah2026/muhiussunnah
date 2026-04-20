"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { initiateOnlinePaymentAction, type GatewayChoice } from "@/server/actions/payment-init";

type Props = {
  schoolSlug: string;
  invoiceId: string;
  gateways: { sslcommerz: boolean; bkash: boolean; nagad: boolean };
};

export function PayButtons({ schoolSlug, invoiceId, gateways }: Props) {
  const [pending, startTransition] = useTransition();

  function pay(gateway: GatewayChoice) {
    startTransition(async () => {
      const res = await initiateOnlinePaymentAction({ schoolSlug, invoiceId, gateway });
      if (res.ok && res.data) {
        toast.loading("গেটওয়েতে যাচ্ছেন...");
        window.location.href = res.data.redirectUrl;
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  const anyConfigured = gateways.sslcommerz || gateways.bkash || gateways.nagad;

  if (!anyConfigured) {
    return (
      <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
        <p className="font-semibold">⚠ অনলাইন পেমেন্ট এখনও চালু হয়নি</p>
        <p className="mt-1 text-xs text-muted-foreground">
          স্কুল অ্যাডমিনকে জানান SSLCommerz বা bKash কনফিগার করতে। আপাতত ক্যাশ পেমেন্টের জন্য স্কুলে যান।
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {gateways.sslcommerz ? (
        <Button
          type="button"
          disabled={pending}
          onClick={() => pay("sslcommerz")}
          className="bg-gradient-primary text-white"
        >
          💳 কার্ড / bKash / Nagad / Rocket (SSLCommerz)
        </Button>
      ) : null}

      {gateways.bkash ? (
        <Button
          type="button"
          disabled={pending}
          onClick={() => pay("bkash")}
          variant="outline"
          className="border-pink-500/40 text-pink-500"
        >
          📱 bKash সরাসরি (কম ফি)
        </Button>
      ) : null}

      {gateways.nagad ? (
        <Button
          type="button"
          disabled={pending}
          onClick={() => pay("nagad")}
          variant="outline"
          className="border-orange-500/40 text-orange-500"
        >
          🧡 Nagad সরাসরি
        </Button>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        💡 SSLCommerz সবচেয়ে সহজ — কার্ড + সব MFS এক জায়গায়। bKash সরাসরি ফি কম কিন্তু শুধু bKash-এ।
      </p>
    </div>
  );
}
