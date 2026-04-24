"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactAction, type ContactResult } from "@/server/actions/contact";

type Labels = {
  name: string;
  school: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Placeholders = {
  name: string;
  school: string;
  email: string;
  phone: string;
  message: string;
};

type Props = {
  labels: Labels;
  placeholders: Placeholders;
  subjectOptions: string[];
  submitCta: string;
  /** Shown while the server action is running. Caller passes their
   *  locale-appropriate "Sending…" copy. */
  submittingCta?: string;
};

export function ContactForm({
  labels,
  placeholders,
  subjectOptions,
  submitCta,
  submittingCta = "পাঠানো হচ্ছে…",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(
    submitContactAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message, { icon: <CheckCircle2 className="size-4" /> });
      formRef.current?.reset();
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{labels.name}</Label>
          <Input id="name" name="name" placeholder={placeholders.name} required minLength={2} />
        </div>
        <div>
          <Label htmlFor="school">{labels.school}</Label>
          <Input id="school" name="school" placeholder={placeholders.school} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={placeholders.email}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input id="phone" name="phone" type="tel" placeholder={placeholders.phone} />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">{labels.subject}</Label>
        <select
          id="subject"
          name="subject"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={subjectOptions[0]}
        >
          {subjectOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="message">{labels.message}</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder={placeholders.message}
          required
          minLength={5}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-gradient-primary animate-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-70"
      >
        <Send className="me-2 size-4" />
        {pending ? submittingCta : submitCta}
      </Button>
    </form>
  );
}
