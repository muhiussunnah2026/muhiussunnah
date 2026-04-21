"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSmsTemplateAction } from "@/server/actions/sms-templates";

export function TemplateForm({ schoolSlug, schoolName }: { schoolSlug: string; schoolName: string }) {
  const t = useTranslations("messaging");
  const [state, action, pending] = useActionState(saveSmsTemplateAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [context, setContext] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const categories = [
    { value: "fee_reminder", label: t("tpl_form_cat_fee_reminder") },
    { value: "absent_alert", label: t("tpl_form_cat_absent_alert") },
    { value: "exam_reminder", label: t("tpl_form_cat_exam_reminder") },
    { value: "result_announce", label: t("tpl_form_cat_result_announce") },
    { value: "holiday", label: t("tpl_form_cat_holiday") },
    { value: "general", label: t("tpl_form_cat_general") },
    { value: "custom", label: t("tpl_form_cat_custom") },
  ];

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("tpl_form_saved")); ref.current?.reset(); setBody(""); setContext(""); setAiUsed(false); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function generate() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/sms-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, context, schoolName }),
      });
      const data = await res.json();
      if (data.ok && data.body) {
        setBody(data.body);
        setAiUsed(!!data.ai);
        toast.success(data.ai ? t("tpl_form_gen_ok") : t("tpl_form_gen_fallback"));
      } else {
        toast.error(data.error ?? t("tpl_form_gen_failed"));
      }
    } catch {
      toast.error(t("tpl_form_net_error"));
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="is_ai_generated" value={aiUsed ? "true" : "false"} />

      <div>
        <Label>{t("tpl_form_name_label")}</Label>
        <Input name="name" placeholder={t("tpl_form_name_placeholder")} required />
      </div>

      <div>
        <Label>{t("tpl_form_cat_label")}</Label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <Label>{t("tpl_form_ctx_label")}</Label>
        <Input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t("tpl_form_ctx_placeholder")}
        />
      </div>

      <Button type="button" variant="outline" size="sm" disabled={aiLoading} onClick={generate} className="w-full">
        <Sparkles className="me-1.5 size-4" />
        {aiLoading ? t("tpl_form_generating") : t("tpl_form_gen_cta")}
      </Button>

      <div>
        <Label>{t("tpl_form_body_label")}</Label>
        <Textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("tpl_form_body_placeholder")}
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">{t("tpl_form_body_help", { count: body.length })}</p>
      </div>

      <div>
        <Label>{t("tpl_form_lang_label")}</Label>
        <select name="language" defaultValue="bn" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="bn">{t("tpl_form_lang_bn")}</option>
          <option value="en">{t("tpl_form_lang_en")}</option>
        </select>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("tpl_form_saving") : t("tpl_form_save_cta")}
      </Button>
    </form>
  );
}
