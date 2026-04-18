"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Smartphone, Mail, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { createNoticeAction } from "@/server/actions/notices";
import type { ActionResult } from "@/server/actions/_helpers";

type ChannelKey = "sms" | "whatsapp" | "push" | "email" | "inapp";

type Props = {
  schoolSlug: string;
  classes: { id: string; name_bn: string; sections: { id: string; name: string }[] }[];
  available: Record<ChannelKey, boolean>;
  costs: { sms_bn: number; sms_en: number; whatsapp: number; balance: number };
};

const channelMeta: Record<ChannelKey, { label: string; icon: React.ReactNode; tone: string }> = {
  sms: { label: "SMS", icon: <MessageSquare className="size-4" />, tone: "text-primary" },
  whatsapp: { label: "WhatsApp", icon: <Smartphone className="size-4" />, tone: "text-success" },
  push: { label: "Push", icon: <Bell className="size-4" />, tone: "text-secondary" },
  email: { label: "Email", icon: <Mail className="size-4" />, tone: "text-info" },
  inapp: { label: "অ্যাপে", icon: <Globe className="size-4" />, tone: "text-muted-foreground" },
};

export function NoticeComposer({ schoolSlug, classes, available, costs }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<string>("parents");
  const [targetId, setTargetId] = useState<string>("");
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({
    sms: available.sms,
    whatsapp: false,
    push: available.push,
    email: false,
    inapp: true,
  });
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createNoticeAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "নোটিশ পাঠানো হয়েছে");
      router.push(`/school/${schoolSlug}/admin/notices`);
    } else {
      toast.error(state.error);
    }
  }, [state, router, schoolSlug]);

  // Estimate recipient count (best guess — real count on server)
  const estimatedRecipients = useMemo(() => {
    if (audience === "all") return 500;
    if (audience === "staff") return 30;
    if (audience === "teachers") return 25;
    if (audience === "section") return 40;
    if (audience === "class") return 80;
    return 200;
  }, [audience]);

  const isBangla = /[\u0980-\u09FF]/.test(body);
  const perSmsCost = isBangla ? costs.sms_bn : costs.sms_en;
  const smsChunkSize = isBangla ? 70 : 160;
  const smsParts = Math.max(1, Math.ceil(body.length / smsChunkSize));

  const estimatedCost = useMemo(() => {
    let total = 0;
    if (channels.sms) total += perSmsCost * smsParts * estimatedRecipients;
    if (channels.whatsapp) total += costs.whatsapp * estimatedRecipients;
    return total;
  }, [channels, perSmsCost, smsParts, estimatedRecipients, costs.whatsapp]);

  const insufficientBalance = channels.sms && estimatedCost > costs.balance;

  const selectedChannels = (Object.entries(channels) as [ChannelKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => k);

  const showTargetPicker = audience === "class" || audience === "section";

  function toggle(ch: ChannelKey) {
    if (!available[ch]) return;
    setChannels((c) => ({ ...c, [ch]: !c[ch] }));
  }

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="channels" value={JSON.stringify(selectedChannels)} />
      {scheduleNow ? <input type="hidden" name="schedule_now" value="on" /> : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">শিরোনাম *</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: আগামীকাল ক্লাস বন্ধ"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">বার্তা *</Label>
          <Textarea
            id="body"
            name="body"
            required
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="বিস্তারিত লিখুন..."
          />
          <p className="text-xs text-muted-foreground">
            <BanglaDigit value={body.length} /> অক্ষর · {isBangla ? "বাংলা" : "English"} SMS · <BanglaDigit value={smsParts} /> parts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audience">প্রাপক</Label>
            <Select name="audience" value={audience} onValueChange={(v: string | null) => v && setAudience(v)}>
              <SelectTrigger id="audience"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সবাই (ছাত্র + অভিভাবক + স্টাফ)</SelectItem>
                <SelectItem value="parents">সব অভিভাবক</SelectItem>
                <SelectItem value="students">সব ছাত্র</SelectItem>
                <SelectItem value="teachers">সব শিক্ষক</SelectItem>
                <SelectItem value="staff">সব স্টাফ</SelectItem>
                <SelectItem value="class">নির্দিষ্ট ক্লাস</SelectItem>
                <SelectItem value="section">নির্দিষ্ট সেকশন</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showTargetPicker ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="audience_target_id">{audience === "class" ? "ক্লাস" : "সেকশন"}</Label>
              <Select name="audience_target_id" value={targetId} onValueChange={(v: string | null) => v && setTargetId(v)}>
                <SelectTrigger id="audience_target_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {audience === "class"
                    ? classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>))
                    : classes.flatMap((c) =>
                        c.sections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {c.name_bn} — {s.name}
                          </SelectItem>
                        )),
                      )}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-4">
          <div className="mb-1 text-sm font-medium">চ্যানেল নির্বাচন</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {(Object.entries(channelMeta) as [ChannelKey, typeof channelMeta.sms][]).map(([key, meta]) => {
              const isAvailable = available[key];
              const isOn = channels[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => toggle(key)}
                  className={`flex flex-col items-center gap-1 rounded-md border p-3 text-xs transition ${
                    isOn
                      ? "border-primary bg-primary/10 text-primary"
                      : isAvailable
                      ? "border-border hover:border-primary/40"
                      : "border-dashed border-border/40 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className={meta.tone}>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {!isAvailable && <span className="text-[10px] text-muted-foreground">কনফিগার করুন</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={scheduleNow}
              onCheckedChange={(c) => setScheduleNow(c === true)}
            />
            এখনই পাঠান
          </label>
          {!scheduleNow ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduled_for">কখন পাঠান ো হবে</Label>
              <Input
                id="scheduled_for"
                name="scheduled_for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                📅 Vercel Cron প্রতি ১৫ মিনিটে scheduled notices পাঠাবে।
              </p>
            </div>
          ) : null}
        </div>

        <Button type="submit" disabled={pending || selectedChannels.length === 0} className="bg-gradient-primary text-white">
          {pending ? "পাঠান ো হচ্ছে..." : scheduleNow ? "🚀 এখনই পাঠান" : "📅 শিডিউল করুন"}
        </Button>

        {state && !state.ok ? (
          <p className="text-sm text-destructive" role="alert">{state.error}</p>
        ) : null}
      </section>

      <aside className="flex flex-col gap-3">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-2 text-sm font-semibold">💰 Cost preview</h3>
          <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">অনুমানিত প্রাপক</dt>
            <dd className="text-right"><BanglaDigit value={estimatedRecipients} /></dd>
            {channels.sms ? (
              <>
                <dt className="text-muted-foreground">SMS ({smsParts} part{smsParts > 1 ? "s" : ""})</dt>
                <dd className="text-right">৳ <BanglaDigit value={(perSmsCost * smsParts * estimatedRecipients).toFixed(2)} /></dd>
              </>
            ) : null}
            {channels.whatsapp ? (
              <>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="text-right">৳ <BanglaDigit value={(costs.whatsapp * estimatedRecipients).toFixed(2)} /></dd>
              </>
            ) : null}
            <dt className="mt-2 border-t border-border/60 pt-2 text-sm font-semibold">মোট</dt>
            <dd className="mt-2 border-t border-border/60 pt-2 text-right text-sm font-semibold">
              ৳ <BanglaDigit value={estimatedCost.toFixed(2)} />
            </dd>
          </dl>
          <div className="mt-3 border-t border-border/60 pt-3 text-xs">
            <span className="text-muted-foreground">SMS ব্যালেন্স:</span>{" "}
            <span className={insufficientBalance ? "text-destructive font-medium" : "text-success"}>
              ৳ <BanglaDigit value={costs.balance.toLocaleString("en-IN")} />
            </span>
          </div>
          {insufficientBalance ? (
            <p className="mt-2 text-xs text-warning-foreground dark:text-warning">
              ⚠ SMS ক্রেডিট কম পড়তে পারে। Super admin থেকে topup করুন।
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs">
          <p className="mb-2 font-semibold">💡 Tips</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• SMS ৭০ অক্ষরের চেয়ে বড় বাংলা → দুটো SMS খরচ হবে।</li>
            <li>• WhatsApp খরচ কম, কিন্তু pre-approved template লাগে।</li>
            <li>• In-app notice সবসময় ফ্রি — কেউ খরচ নেই।</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
