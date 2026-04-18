import Link from "next/link";
import { Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { SchoolSettingsForm } from "./settings-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function SchoolSettingsPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("schools")
    .select("slug, name_bn, name_en, eiin, type, address, phone, email, website, subscription_status, trial_ends_at")
    .eq("id", membership.school_id)
    .single();

  const school = data as {
    slug: string; name_bn: string; name_en: string | null; eiin: string | null;
    type: "school" | "madrasa" | "both"; address: string | null; phone: string | null;
    email: string | null; website: string | null;
    subscription_status: string; trial_ends_at: string | null;
  } | null;

  if (!school) return null;

  return (
    <>
      <PageHeader
        title="স্কুল সেটিংস"
        subtitle="প্রতিষ্ঠানের মৌলিক তথ্য, যোগাযোগ, সাবস্ক্রিপশন — সব এক জায়গায়।"
        impact={[
          { label: `সাবস্ক্রিপশন: ${subscriptionLabel(school.subscription_status)}`, tone: "accent" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold">মৌলিক তথ্য</h2>
            <SchoolSettingsForm schoolSlug={schoolSlug} initial={school} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="text-lg font-semibold">সাবস্ক্রিপশন</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted-foreground">স্ট্যাটাস</dt>
              <dd>{subscriptionLabel(school.subscription_status)}</dd>
              {school.trial_ends_at ? (
                <>
                  <dt className="text-muted-foreground">ট্রায়াল শেষ হবে</dt>
                  <dd>{new Date(school.trial_ends_at).toLocaleDateString("bn-BD")}</dd>
                </>
              ) : null}
              <dt className="text-muted-foreground">স্কুল URL</dt>
              <dd className="font-mono text-xs">/school/{school.slug}</dd>
            </dl>
            <p className="mt-4 rounded-md border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
              💡 আপনার ট্রায়াল শেষ হওয়ার আগে আপগ্রেড করুন, কোন ডেটা হারাবে না।
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="text-lg font-semibold">সুরক্ষা</h2>
            <p className="text-sm text-muted-foreground">
              দুই-স্তর প্রমাণীকরণ (2FA) চালু করলে আপনার অ্যাকাউন্টে অননুমোদিত লগইন প্রায় অসম্ভব হয়ে যাবে।
            </p>
            <Link href={`/school/${schoolSlug}/admin/settings/2fa`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Shield className="me-1.5 size-4" />
              2FA সেটিংস
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="text-lg font-semibold">SMS টেমপ্লেট</h2>
            <p className="text-sm text-muted-foreground">
              AI দিয়ে পেশাদার SMS টেমপ্লেট তৈরি করুন — ফি রিমাইন্ডার, অনুপস্থিতি, পরীক্ষার খবর — সব একই জায়গায়।
            </p>
            <Link href={`/school/${schoolSlug}/admin/messaging/templates`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              টেমপ্লেট ম্যানেজ করুন
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function subscriptionLabel(status: string): string {
  const map: Record<string, string> = {
    trial: "ফ্রি ট্রায়াল",
    active: "সক্রিয়",
    past_due: "বকেয়া",
    canceled: "বাতিল",
    suspended: "স্থগিত",
  };
  return map[status] ?? status;
}
