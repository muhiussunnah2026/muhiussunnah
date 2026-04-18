"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setupTotpAction, verifyTotpAction, disableTotpAction } from "@/server/actions/totp";

type Existing = { verified: boolean };

export function TwoFactorSetup({ schoolSlug, existing }: { schoolSlug: string; existing: Existing | null }) {
  const [setupState, setupAction, setupPending] = useActionState(setupTotpAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyTotpAction, null);
  const [disableState, disableAction, disablePending] = useActionState(disableTotpAction, null);
  const [setup, setSetup] = useState<{ secret: string; uri: string; recovery: string[] } | null>(null);

  useEffect(() => {
    if (!setupState) return;
    if (setupState.ok && setupState.data) {
      setSetup(setupState.data);
      toast.success(setupState.message ?? "সেটআপ শুরু");
    } else if (!setupState.ok) {
      toast.error(setupState.error);
    }
  }, [setupState]);

  useEffect(() => {
    if (!verifyState) return;
    if (verifyState.ok) { toast.success(verifyState.message ?? "2FA চালু"); setSetup(null); }
    else toast.error(verifyState.error);
  }, [verifyState]);

  useEffect(() => {
    if (!disableState) return;
    if (disableState.ok) toast.success(disableState.message ?? "2FA বন্ধ");
    else toast.error(disableState.error);
  }, [disableState]);

  // Already verified state
  if (existing?.verified && !setup) {
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">2FA সক্রিয়</h3>
              <p className="text-xs text-muted-foreground">আপনার অ্যাকাউন্ট সুরক্ষিত — প্রতিবার লগইনে ৬-ডিজিট কোড লাগবে।</p>
            </div>
            <Badge className="ms-auto bg-success/10 text-success hover:bg-success/20" variant="secondary">
              চালু
            </Badge>
          </div>
          <form action={disableAction}>
            <input type="hidden" name="schoolSlug" value={schoolSlug} />
            <Button type="submit" variant="destructive" size="sm" disabled={disablePending}>
              <ShieldOff className="me-1.5 size-4" />
              {disablePending ? "বন্ধ হচ্ছে..." : "2FA বন্ধ করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Setup in progress — show QR + verification
  if (setup) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(setup.uri)}`;
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">ধাপ ১: Authenticator app-এ scan করুন</h3>
          <p className="text-sm text-muted-foreground">
            Google Authenticator, Authy বা 1Password খুলে নিচের QR কোড scan করুন।
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="TOTP QR" className="border rounded-lg bg-white p-2" width={220} height={220} />

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Manual entry (QR scan না হলে)</summary>
            <code className="mt-2 block rounded bg-muted p-2 break-all">{setup.secret}</code>
          </details>

          <hr />

          <h3 className="font-semibold">ধাপ ২: Recovery codes সংরক্ষণ করুন</h3>
          <p className="text-sm text-muted-foreground">
            ফোন হারালে এই কোডগুলো দিয়ে লগইন করতে পারবেন। নিরাপদ জায়গায় রাখুন।
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {setup.recovery.map((c) => (
              <code key={c} className="rounded bg-muted px-2 py-1">{c}</code>
            ))}
          </div>

          <hr />

          <h3 className="font-semibold">ধাপ ৩: কোড verify করুন</h3>
          <form action={verifyAction} className="space-y-3">
            <input type="hidden" name="schoolSlug" value={schoolSlug} />
            <div>
              <Label>৬-ডিজিট কোড</Label>
              <Input name="code" placeholder="123456" maxLength={6} inputMode="numeric" required />
            </div>
            <Button type="submit" disabled={verifyPending} className="w-full">
              {verifyPending ? "verify হচ্ছে..." : "Verify এবং 2FA চালু করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Initial state — not setup yet
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning-foreground dark:text-warning">
            <Shield className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">দুই-স্তর প্রমাণীকরণ (2FA)</h3>
            <p className="text-xs text-muted-foreground">আপনার অ্যাকাউন্টের জন্য বাড়তি সুরক্ষা — Authenticator app-এর কোড দরকার হবে।</p>
          </div>
        </div>
        <form action={setupAction}>
          <input type="hidden" name="schoolSlug" value={schoolSlug} />
          <Button type="submit" disabled={setupPending}>
            <Shield className="me-1.5 size-4" />
            {setupPending ? "সেটআপ হচ্ছে..." : "2FA সেটআপ শুরু করুন"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
