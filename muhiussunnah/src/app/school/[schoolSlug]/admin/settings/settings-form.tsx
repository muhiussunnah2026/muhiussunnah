"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSchoolAction } from "@/server/actions/school";
import type { ActionResult } from "@/server/actions/_helpers";

type HeaderFieldKey = "name_bn" | "name_en" | "name_ar" | "address" | "phone" | "email" | "website";

const HEADER_FIELD_LABELS: Record<HeaderFieldKey, string> = {
  name_bn: "বাংলা নাম",
  name_en: "English নাম",
  name_ar: "العربية (আরবি নাম)",
  address: "ঠিকানা",
  phone: "ফোন",
  email: "ইমেইল",
  website: "ওয়েবসাইট",
};

const ALL_KEYS: HeaderFieldKey[] = [
  "name_bn",
  "name_en",
  "name_ar",
  "address",
  "phone",
  "email",
  "website",
];

type Props = {
  schoolSlug: string;
  initial: {
    name_bn: string;
    name_en: string | null;
    name_ar?: string | null;
    eiin: string | null;
    type: "school" | "madrasa" | "both";
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo_url?: string | null;
    display_name_locale?: "bn" | "en" | null;
    header_display_fields?: string | null;
  };
};

function parseHeaderFields(raw: string | null | undefined): HeaderFieldKey[] {
  if (!raw) return ["name_bn"];
  const allowed = new Set<string>(ALL_KEYS);
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is HeaderFieldKey => allowed.has(s));
  return parts.length ? parts : ["name_bn"];
}

export function SchoolSettingsForm({ schoolSlug, initial }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateSchoolAction, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logo_url ?? null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [headerFields, setHeaderFields] = useState<HeaderFieldKey[]>(() =>
    parseHeaderFields(initial.header_display_fields),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট হয়েছে");
    else toast.error(state.error);
  }, [state]);

  function toggleHeaderField(k: HeaderFieldKey) {
    setHeaderFields((prev) => {
      if (prev.includes(k)) {
        // Don't let the admin end up with zero fields — keep at least one.
        const next = prev.filter((x) => x !== k);
        return next.length === 0 ? prev : next;
      }
      // Preserve the canonical field order so the header reads naturally.
      return ALL_KEYS.filter((key) => prev.includes(key) || key === k);
    });
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("লোগো ২ MB এর বেশি হতে পারে না।");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoPreview(null);
    setLogoDataUrl("__REMOVE__");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="logo_data_url" value={logoDataUrl} />
      <input type="hidden" name="header_display_fields" value={headerFields.join(",")} />

      {/* Logo uploader */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <Label className="text-sm font-semibold mb-3 block">প্রতিষ্ঠানের লোগো</Label>
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={80}
                height={80}
                className="size-full object-contain"
                unoptimized
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">م</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={onPickFile}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                লোগো আপলোড
              </Button>
              {logoPreview ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={removeLogo}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="size-3.5" />
                  সরান
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              PNG / JPG / SVG · সর্বোচ্চ ২ MB · এই লোগো header, certificate, invoice, marksheet — সব জায়গায় দেখা যাবে।
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">প্রতিষ্ঠানের নাম (বাংলা)</Label>
        <Input id="name_bn" name="name_bn" required defaultValue={initial.name_bn} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">Institution name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={initial.name_en ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_ar">
          اسم المؤسسة (العربية) <span className="text-xs text-muted-foreground ms-1">আরবি নাম · ঐচ্ছিক</span>
        </Label>
        <Input
          id="name_ar"
          name="name_ar"
          dir="rtl"
          lang="ar"
          defaultValue={initial.name_ar ?? ""}
          placeholder="اسم المؤسسة بالعربية"
        />
      </div>

      {/* Display name in header — multi-checkbox composition */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Label className="mb-1 block text-sm font-semibold">
          Display name in header
        </Label>
        <p className="mb-3 text-xs text-muted-foreground">
          💡 যেগুলো বাছাই করবেন, সেগুলোই admin হেডারে দেখাবে। প্রথমে বাছাই করা ফিল্ডটি বড় করে আসবে, বাকিগুলো নিচে subtitle হিসেবে।
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {ALL_KEYS.map((k) => {
            const checked = headerFields.includes(k);
            const order = headerFields.indexOf(k);
            return (
              <label
                key={k}
                className={
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition " +
                  (checked
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-background hover:border-primary/30 hover:bg-primary/5")
                }
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checked}
                  onChange={() => toggleHeaderField(k)}
                />
                <span className="flex-1">{HEADER_FIELD_LABELS[k]}</span>
                {checked ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {order + 1}
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">ধরন</Label>
          <Select name="type" defaultValue={initial.type}>
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="school">স্কুল</SelectItem>
              <SelectItem value="madrasa">মাদ্রাসা</SelectItem>
              <SelectItem value="both">স্কুল + মাদ্রাসা</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eiin">EIIN</Label>
          <Input id="eiin" name="eiin" defaultValue={initial.eiin ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">ঠিকানা</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={initial.address ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">ফোন</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initial.phone ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">ওয়েবসাইট</Label>
        <Input id="website" name="website" type="url" placeholder="https://" defaultValue={initial.website ?? ""} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2 bg-gradient-primary text-white">
        {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
