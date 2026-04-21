"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Lock, Mail, Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  updateProfileNameAction,
  updateProfileEmailAction,
  updateProfilePasswordAction,
  updateProfilePhotoAction,
} from "@/server/actions/profile";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = {
  schoolSlug: string;
  currentEmail: string;
  currentFullName: string;
  currentPhotoUrl: string | null;
};

type Tab = "photo" | "name" | "email" | "password";

export function ProfileForm({ schoolSlug, currentEmail, currentFullName, currentPhotoUrl }: Props) {
  const t = useTranslations("settings");
  const [tab, setTab] = useState<Tab>("photo");

  const labels: Record<Tab, string> = {
    photo: t("profile_tab_photo"),
    name: t("profile_tab_name"),
    email: t("profile_tab_email"),
    password: t("profile_tab_password"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-card/60 p-1">
        {(["photo", "name", "email", "password"] as const).map((k) => (
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
            {k === "photo" ? <Camera className="size-3.5" /> : null}
            {k === "name" ? <User className="size-3.5" /> : null}
            {k === "email" ? <Mail className="size-3.5" /> : null}
            {k === "password" ? <Lock className="size-3.5" /> : null}
            {labels[k]}
          </button>
        ))}
      </div>

      {tab === "photo" ? (
        <PhotoForm schoolSlug={schoolSlug} current={currentPhotoUrl} name={currentFullName} />
      ) : null}
      {tab === "name" ? (
        <NameForm current={currentFullName} schoolSlug={schoolSlug} />
      ) : null}
      {tab === "email" ? (
        <EmailForm current={currentEmail} schoolSlug={schoolSlug} />
      ) : null}
      {tab === "password" ? <PasswordForm schoolSlug={schoolSlug} /> : null}
    </div>
  );
}

function PhotoForm({
  schoolSlug,
  current,
  name,
}: {
  schoolSlug: string;
  current: string | null;
  name: string;
}) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfilePhotoAction,
    null,
  );
  const [preview, setPreview] = useState<string | null>(current);
  const [dataUrl, setDataUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("profile_photo_updated"));
      setDataUrl("");
    } else {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile_photo_image_only"));
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error(t("profile_photo_size_error"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      setDataUrl(url);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPreview(null);
    setDataUrl("__REMOVE__");
    if (fileRef.current) fileRef.current.value = "";
  }

  const initials = buildInitials(name);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="photo_data_url" value={dataUrl} />

      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-primary/10 to-accent/10">
            {preview ? (
              <Image
                src={preview}
                alt="Profile preview"
                width={96}
                height={96}
                className="size-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {initials}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPickFile}
            className="hidden"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-3.5 me-1" />
              {t("profile_photo_upload")}
            </Button>
            {preview ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={removePhoto}
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="size-3.5 me-1" />
                {t("profile_photo_remove")}
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("profile_photo_help")}
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending || !dataUrl}
        className="bg-gradient-primary text-white w-fit"
      >
        {pending ? t("profile_saving") : t("profile_save")}
      </Button>
    </form>
  );
}

function NameForm({ schoolSlug, current }: { schoolSlug: string; current: string }) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileNameAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("form_updated"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name_bn">{t("profile_name_label")}</Label>
        <Input id="full_name_bn" name="full_name_bn" required defaultValue={current} />
      </div>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white w-fit">
        {pending ? t("profile_saving") : t("profile_save")}
      </Button>
    </form>
  );
}

function EmailForm({ schoolSlug, current }: { schoolSlug: string; current: string }) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileEmailAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("profile_link_sent"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label>{t("profile_email_current")}</Label>
        <Input value={current} disabled className="opacity-60" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_email">{t("profile_email_new")}</Label>
        <Input id="new_email" name="new_email" type="email" required autoComplete="email" />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("profile_email_help")}
      </p>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white w-fit">
        {pending ? t("profile_email_sending") : t("profile_email_cta")}
      </Button>
    </form>
  );
}

function PasswordForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateProfilePasswordAction,
    null,
  );
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("profile_password_updated"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_password">{t("profile_password_new")}</Label>
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
        <Label htmlFor="confirm_password">{t("profile_password_confirm")}</Label>
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
        {pending ? t("profile_saving") : t("profile_password_cta")}
      </Button>
    </form>
  );
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
