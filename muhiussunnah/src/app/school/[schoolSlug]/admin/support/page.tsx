import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

const statusLabel: Record<string, string> = {
  open: "খোলা", in_progress: "চলমান", waiting: "অপেক্ষমান", resolved: "সমাধান", closed: "বন্ধ",
};
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

export default async function SupportInboxPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

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

  const open = list.filter((t) => ["open", "in_progress", "waiting"].includes(t.status)).length;

  return (
    <>
      <PageHeader
        title="সাপোর্ট টিকেট"
        subtitle="শিক্ষক, অভিভাবক, বা কর্মচারীরা যে ইস্যু জানান — এক জায়গায় ট্র্যাক করুন।"
        impact={[
          { label: <>খোলা · <BanglaDigit value={open} /></>, tone: open > 0 ? "warning" : "success" },
          { label: <>মোট · <BanglaDigit value={list.length} /></>, tone: "default" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="size-8" />}
          title="কোন টিকেট নেই"
          body="শিক্ষক-অভিভাবকরা portal থেকে টিকেট খুলতে পারবেন। এখানে inbox দেখা যাবে।"
        />
      ) : (
        <div className="grid gap-3">
          {list.map((t) => (
            <Link key={t.id} href={`/school/${schoolSlug}/admin/support/${t.id}`} className="group">
              <Card className="transition hover:shadow-hover">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{t.subject}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusTones[t.status]}`}>
                        {statusLabel[t.status]}
                      </span>
                      {t.priority !== "normal" ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${priorityTones[t.priority]}`}>
                          {t.priority}
                        </span>
                      ) : null}
                      {t.category ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t.category}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground"><BengaliDate value={t.created_at} /></p>
                  </div>
                  <span className={buttonVariants({ variant: "ghost", size: "sm" })}>দেখুন →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
