import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

const statusTones: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  waiting: "bg-warning/10 text-warning-foreground dark:text-warning",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};
const priorityTones: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "",
  high: "bg-warning/10 text-warning-foreground dark:text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

export default async function SupportInboxPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const t = await getTranslations("tickets");

  const statusLabel: Record<string, string> = {
    open: t("status_open"), in_progress: t("status_in_progress"), waiting: t("status_waiting"),
    resolved: t("status_resolved"), closed: t("status_closed"),
  };

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tickets } = await (supabase as any)
    .from("support_tickets")
    .select("id, subject, body, priority, status, category, created_at, created_by")
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (tickets ?? []) as Array<{
    id: string; subject: string; body: string; priority: string; status: string;
    category: string | null; created_at: string; created_by: string;
  }>;

  const open = list.filter((tk) => ["open", "in_progress", "waiting"].includes(tk.status)).length;

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: <>{t("tally_open")} · <BanglaDigit value={open} /></>, tone: open > 0 ? "warning" : "success" },
          { label: <>{t("tally_total")} · <BanglaDigit value={list.length} /></>, tone: "default" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="size-8" />}
          title={t("empty_title")}
          body={t("empty_body")}
        />
      ) : (
        <div className="grid gap-3">
          {list.map((tk) => (
            <Link key={tk.id} href={`/tickets/${tk.id}`} className="group">
              <Card className="transition hover:shadow-hover">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{tk.subject}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusTones[tk.status]}`}>
                        {statusLabel[tk.status]}
                      </span>
                      {tk.priority !== "normal" ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${priorityTones[tk.priority]}`}>
                          {tk.priority}
                        </span>
                      ) : null}
                      {tk.category ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tk.category}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tk.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground"><BengaliDate value={tk.created_at} /></p>
                  </div>
                  <span className={buttonVariants({ variant: "ghost", size: "sm" })}>{t("view_cta")}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
