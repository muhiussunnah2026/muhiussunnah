"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTemplateAction } from "@/server/actions/certificates";
import type { ActionResult } from "@/server/actions/_helpers";

const sampleTemplate = `<div style="text-align:center;font-family:serif;padding:60px;">
  <h1 style="color:#7c5cff;">প্রশংসাপত্র</h1>
  <p>এই সনদপত্র প্রদান করা হচ্ছে</p>
  <h2 style="margin:30px 0;">{{student_name}}</h2>
  <p>যে {{school_name}}-এর একজন নিয়মিত ছাত্র/ছাত্রী ছিল।</p>
  <p>চরিত্র: ভাল · আচরণ: ভদ্র</p>
  <br /><br />
  <p>ইস্যুর তারিখ: {{date}}</p>
  <p>সিরিয়াল: {{serial_no}}</p>
</div>`;

export function AddTemplateForm({ schoolSlug }: { schoolSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addTemplateAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">নাম</Label>
        <Input id="name" name="name" required placeholder="যেমন: প্রশংসাপত্র (বাংলা)" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">ধরন</Label>
          <Select name="type" defaultValue="testimonial">
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="testimonial">প্রশংসাপত্র</SelectItem>
              <SelectItem value="tc">ট্রান্সফার</SelectItem>
              <SelectItem value="character">চরিত্র</SelectItem>
              <SelectItem value="completion">কমপ্লিশন</SelectItem>
              <SelectItem value="hifz_sanad">হিফজ সনদ</SelectItem>
              <SelectItem value="other">অন্যান্য</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orientation">অভিমুখ</Label>
          <Select name="orientation" defaultValue="portrait">
            <SelectTrigger id="orientation"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paper_size">কাগজ</Label>
        <Select name="paper_size" defaultValue="A4">
          <SelectTrigger id="paper_size"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="A5">A5</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="html_template">HTML টেমপ্লেট</Label>
        <Textarea
          id="html_template"
          name="html_template"
          rows={10}
          required
          defaultValue={sampleTemplate}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Supported variables: <code>{`{{student_name}}`}</code>, <code>{`{{student_code}}`}</code>, <code>{`{{school_name}}`}</code>, <code>{`{{date}}`}</code>, <code>{`{{serial_no}}`}</code>
        </p>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "টেমপ্লেট যোগ"}
      </Button>
    </form>
  );
}
