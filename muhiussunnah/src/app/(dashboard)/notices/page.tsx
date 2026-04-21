import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export default async function NoticesListPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const t = await getTranslations("notices");

  const audienceLabel: Record<string, string> = {
    all: t("aud_all"), staff: t("aud_staff"), teachers: t("aud_teachers"), students: t("aud_students"),
    parents: t("aud_parents"), class: t("aud_class"), section: t("aud_section"), individual: t("aud_individual"),
  };

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  const [noticesRes, schoolRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("notices")
      .select("id, title, body, audience, channels, scheduled_for, sent_at, created_at")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false })
      .limit(200),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("schools")
      .select("sms_credit_balance_bdt")
      .eq("id", membership.school_id)
      .single(),
  ]);
  const { data: notices } = noticesRes;
  const { data: school } = schoolRes;

  const list = (notices ?? []) as Array<{
    id: string; title: string; body: string; audience: string;
    channels: string[]; scheduled_for: string | null; sent_at: string | null; created_at: string;
  }>;

  const sent = list.filter((n) => n.sent_at).length;
  const scheduled = list.filter((n) => n.scheduled_for && !n.sent_at).length;
  const balance = Number(school?.sms_credit_balance_bdt ?? 0);

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: <>{t("tally_sent")} · <BanglaDigit value={sent} /></>, tone: "success" },
          { label: <>{t("tally_scheduled")} · <BanglaDigit value={scheduled} /></>, tone: "accent" },
          { label: <>{t("tally_sms_balance")} · ৳ <BanglaDigit value={balance.toLocaleString("en-IN")} /></>, tone: balance > 100 ? "default" : "warning" },
        ]}
        actions={
          <Link
            href={`/notices/new`}
            className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
          >
            <Plus className="me-1 size-3.5" /> {t("new_cta")}
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-8" />}
          title={t("empty_title")}
          body={t("empty_body")}
          primaryAction={
            <Link href={`/notices/new`} className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
              {t("empty_primary")}
            </Link>
          }
          proTip={t("empty_tip")}
        />
      ) : (
        <div className="grid gap-3">
          {list.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex flex-col gap-2 p-5 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {audienceLabel[n.audience] ?? n.audience}
                    </span>
                    {n.channels.map((c) => (
                      <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {n.sent_at ? (
                      <>{t("status_sent_prefix")} · <BengaliDate value={n.sent_at} /></>
                    ) : n.scheduled_for ? (
                      <>{t("status_scheduled_prefix")} · <BengaliDate value={n.scheduled_for} /></>
                    ) : (
                      <>{t("status_draft")}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
