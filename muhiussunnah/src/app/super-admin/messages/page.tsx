import { getTranslations } from "next-intl/server";
import { Mail, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  name: string;
  school: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
};

export default async function ContactInboxPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data } = await admin
    .from("contact_messages")
    .select("id, name, school, email, phone, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const messages = (data ?? []) as MessageRow[];
  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <>
      <PageHeader
        title={t("inbox_page_title")}
        subtitle={t("inbox_page_subtitle")}
        impact={[
          {
            label: (
              <>
                {t("inbox_tally_total")} · <BanglaDigit value={messages.length} />
              </>
            ),
            tone: "accent",
          },
          {
            label: (
              <>
                {t("inbox_tally_new")} · <BanglaDigit value={newCount} />
              </>
            ),
            tone: newCount > 0 ? "warning" : "success",
          },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("inbox_metric_total")} value={messages.length} />
        <MetricCard label={t("inbox_metric_new")} value={newCount} tone={newCount > 0 ? "warning" : "default"} />
        <MetricCard
          label={t("inbox_metric_read")}
          value={messages.filter((m) => m.status === "read").length}
          tone="success"
        />
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="size-8" />}
          title={t("inbox_empty_title")}
          body={t("inbox_empty_body")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{m.name}</h3>
                      {m.school ? (
                        <span className="text-sm text-muted-foreground">· {m.school}</span>
                      ) : null}
                      {m.status === "new" ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {t("inbox_badge_new")}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="size-3" /> {m.email}
                      </a>
                      {m.phone ? (
                        <a
                          href={`tel:${m.phone}`}
                          className="hover:text-primary"
                        >
                          {m.phone}
                        </a>
                      ) : null}
                      {m.subject ? <span>· {m.subject}</span> : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                    <time className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </time>
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "")}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      {t("inbox_reply_cta")} <ExternalLink className="size-3" />
                    </a>
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
