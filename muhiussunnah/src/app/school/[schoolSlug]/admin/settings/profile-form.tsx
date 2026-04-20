"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  updateProfileNameAction,
  updateProfileEmailAction,
  updateProfilePasswordAction,
} from "@/server/actions/profile";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = {
  schoolSlug: string;
  currentEmail: string;
  currentFullName: string;
};

export function ProfileForm({ schoolSlug, currentEmail, currentFullName }: Props) {
  const [tab, setTab] = useState<"name" | "email" | "password">("name");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-card/60 p-1">
        {(["name", "email", "password"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              tab === k
                ? "bg-gradient-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
            )}
          >
            {k === "name" ? <User className="size-3.5" /> : null}
            {k === "email" ? <Mail className="size-3.5" /> : null}
            {k === "password" ? <Lock className="size-3.5" /> : null}
            {k === "name" ? "নাম" : k === "email" ? "ইমেইল" : "পাসওয়ার্ড"}
          </button>
        ))}
      </div>

      {tab === "name" ? (
        <NameForm schoolSlug={schoolSlug} current={currentFullName} />
      ) : null}
      {tab === "email" ? (
        <EmailForm schoolSlug={schoolSlug} current={currentEmail} />
      ) : null}
      {tab === "password" ? <PasswordForm schoolSlug={schoolSlug} /> : null}
    </div>
  );
}

function NameForm({ schoolSlug, current }: { schoolSlug: string; current: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileNameAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name_bn">আপনার নাম</Label>
        <Input id="full_name_bn" name="full_name_bn" required defaultValue={current} />
      </div>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white w-fit">
        {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
      </Button>
    </form>
  );
}

function EmailForm({ schoolSlug, current }: { schoolSlug: string; current: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileEmailAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "লিংক পাঠানো হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label>বর্তমান ইমেইল</Label>
        <Input value={current} disabled className="opacity-60" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_email">নতুন ইমেইল</Label>
        <Input id="new_email" name="new_email" type="email" required autoComplete="email" />
      </div>
      <p className="text-xs text-muted-foreground">
        🔐 নিরাপত্তার জন্য পুরনো ও নতুন উভয় ইমেইলে কনফার্মেশন লিংক যাবে।
      </p>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white w-fit">
        {pending ? "পাঠানো হচ্ছে..." : "ইমেইল পরিবর্তন"}
      </Button>
    </form>
  );
}

function PasswordForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfilePasswordAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "পাসওয়ার্ড আপডেট হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_password">নতুন পাসওয়ার্ড (৮+ অক্ষর)</Label>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm_password">পাসওয়ার্ড নিশ্চিত করুন</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white w-fit">
        {pending ? "সংরক্ষণ হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন"}
      </Button>
    </form>
  );
}
