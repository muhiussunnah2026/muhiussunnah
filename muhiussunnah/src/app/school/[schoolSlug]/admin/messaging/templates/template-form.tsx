"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSmsTemplateAction } from "@/server/actions/sms-templates";

const categories = [
  { value: "fee_reminder", label: "ফি রিমাইন্ডার" },
  { value: "absent_alert", label: "অনুপস্থিতি সতর্কতা" },
  { value: "exam_reminder", label: "পরীক্ষার রিমাইন্ডার" },
  { value: "result_announce", label: "রেজাল্ট ঘোষণা" },
  { value: "holiday", label: "ছুটির নোটিশ" },
  { value: "general", label: "সাধারণ" },
  { value: "custom", label: "কাস্টম" },
];

export function TemplateForm({ schoolSlug, schoolName }: { schoolSlug: string; schoolName: string }) {
  const [state, action, pending] = useActionState(saveSmsTemplateAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [context, setContext] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "সেভ হয়েছে।"); ref.current?.reset(); setBody(""); setContext(""); setAiUsed(false); }
    else toast.error(state.error);
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
        toast.success(data.ai ? "AI টেমপ্লেট তৈরি হয়েছে" : "টেমপ্লেট প্রস্তাবিত (AI নেই — fallback ব্যবহার)");
      } else {
        toast.error(data.error ?? "তৈরি করা যায়নি");
      }
    } catch {
      toast.error("নেটওয়ার্ক ত্রুটি");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="is_ai_generated" value={aiUsed ? "true" : "false"} />

      <div>
        <Label>টেমপ্লেট নাম *</Label>
        <Input name="name" placeholder="যেমন: জানুয়ারি ফি রিমাইন্ডার" required />
      </div>

      <div>
        <Label>ক্যাটাগরি *</Label>
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
        <Label>AI জন্য অতিরিক্ত context (optional)</Label>
        <Input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="যেমন: মাদ্রাসার জন্য, ইসলামিক টোন"
        />
      </div>

      <Button type="button" variant="outline" size="sm" disabled={aiLoading} onClick={generate} className="w-full">
        <Sparkles className="me-1.5 size-4" />
        {aiLoading ? "তৈরি হচ্ছে..." : "AI দিয়ে টেমপ্লেট তৈরি করুন"}
      </Button>

      <div>
        <Label>টেমপ্লেট বডি *</Label>
        <Textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="{{student_name}}, {{amount}} — এই ভাবে variable ব্যবহার করুন"
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">দৈর্ঘ্য: {body.length} অক্ষর (160-এর মধ্যে রাখুন)</p>
      </div>

      <div>
        <Label>ভাষা</Label>
        <select name="language" defaultValue="bn" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="bn">বাংলা</option>
          <option value="en">English</option>
        </select>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "সেভ হচ্ছে..." : "টেমপ্লেট সেভ করুন"}
      </Button>
    </form>
  );
}
