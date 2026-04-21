"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

export function NoticeComposer({ schoolSlug, classes, available, costs }: Props) {
  const t = useTranslations("notices");
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

  const channelMeta: Record<ChannelKey, { label: string; icon: React.ReactNode; tone: string }> = {
    sms: { label: "SMS", icon: <MessageSquare className="size-4" />, tone: "text-primary" },
    whatsapp: { label: "WhatsApp", icon: <Smartphone className="size-4" />, tone: "text-success" },
    push: { label: "Push", icon: <Bell className="size-4" />, tone: "text-secondary" },
    email: { label: "Email", icon: <Mail className="size-4" />, tone: "text-info" },
    inapp: { label: t("composer_channel_inapp"), icon: <Globe className="size-4" />, tone: "text-muted-foreground" },
  };

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("composer_sent"));
      router.push(`/notices`);
    } else {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router, schoolSlug]);

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
          <Label htmlFor="title">{t("composer_title_label")}</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("composer_title_placeholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">{t("composer_body_label")}</Label>
          <Textarea
            id="body"
            name="body"
            required
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("composer_body_placeholder")}
          />
          <p className="text-xs text-muted-foreground">
            {t("composer_chars", { count: body.length, lang: isBangla ? t("composer_lang_bn") : t("composer_lang_en"), parts: smsParts })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audience">{t("composer_audience")}</Label>
            <Select name="audience" value={audience} onValueChange={(v: string | null) => v && setAudience(v)}>
              <SelectTrigger id="audience"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("composer_aud_all")}</SelectItem>
                <SelectItem value="parents">{t("composer_aud_parents")}</SelectItem>
                <SelectItem value="students">{t("composer_aud_students")}</SelectItem>
                <SelectItem value="teachers">{t("composer_aud_teachers")}</SelectItem>
                <SelectItem value="staff">{t("composer_aud_staff")}</SelectItem>
                <SelectItem value="class">{t("composer_aud_class")}</SelectItem>
                <SelectItem value="section">{t("composer_aud_section")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showTargetPicker ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="audience_target_id">{audience === "class" ? t("composer_target_class") : t("composer_target_section")}</Label>
              <Select name="audience_target_id" value={targetId} onValueChange={(v: string | null) => v && setTargetId(v)}>
                <SelectTrigger id="audience_target_id"><SelectValue placeholder={t("composer_target_placeholder")} /></SelectTrigger>
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
          <div className="mb-1 text-sm font-medium">{t("composer_channel_heading")}</div>
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
                  {!isAvailable && <span className="text-[10px] text-muted-foreground">{t("composer_channel_configure")}</span>}
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
            {t("composer_send_now")}
          </label>
          {!scheduleNow ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduled_for">{t("composer_schedule_when")}</Label>
              <Input
                id="scheduled_for"
                name="scheduled_for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("composer_schedule_note")}
              </p>
            </div>
          ) : null}
        </div>

        <Button type="submit" disabled={pending || selectedChannels.length === 0} className="bg-gradient-primary text-white">
          {pending ? t("composer_sending") : scheduleNow ? t("composer_send_now_cta") : t("composer_schedule_cta")}
        </Button>

        {state && !state.ok ? (
          <p className="text-sm text-destructive" role="alert">{state.error}</p>
        ) : null}
      </section>

      <aside className="flex flex-col gap-3">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-2 text-sm font-semibold">{t("cost_heading")}</h3>
          <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">{t("cost_recipients")}</dt>
            <dd className="text-right"><BanglaDigit value={estimatedRecipients} /></dd>
            {channels.sms ? (
              <>
                <dt className="text-muted-foreground">{t("cost_sms_prefix", { parts: smsParts, plural: smsParts > 1 ? "s" : "" })}</dt>
                <dd className="text-right">৳ <BanglaDigit value={(perSmsCost * smsParts * estimatedRecipients).toFixed(2)} /></dd>
              </>
            ) : null}
            {channels.whatsapp ? (
              <>
                <dt className="text-muted-foreground">{t("cost_whatsapp")}</dt>
                <dd className="text-right">৳ <BanglaDigit value={(costs.whatsapp * estimatedRecipients).toFixed(2)} /></dd>
              </>
            ) : null}
            <dt className="mt-2 border-t border-border/60 pt-2 text-sm font-semibold">{t("cost_total")}</dt>
            <dd className="mt-2 border-t border-border/60 pt-2 text-right text-sm font-semibold">
              ৳ <BanglaDigit value={estimatedCost.toFixed(2)} />
            </dd>
          </dl>
          <div className="mt-3 border-t border-border/60 pt-3 text-xs">
            <span className="text-muted-foreground">{t("cost_balance")}</span>{" "}
            <span className={insufficientBalance ? "text-destructive font-medium" : "text-success"}>
              ৳ <BanglaDigit value={costs.balance.toLocaleString("en-IN")} />
            </span>
          </div>
          {insufficientBalance ? (
            <p className="mt-2 text-xs text-warning-foreground dark:text-warning">
              {t("cost_insufficient")}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs">
          <p className="mb-2 font-semibold">{t("tips_heading")}</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>{t("tip_sms_chunk")}</li>
            <li>{t("tip_whatsapp")}</li>
            <li>{t("tip_inapp")}</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
