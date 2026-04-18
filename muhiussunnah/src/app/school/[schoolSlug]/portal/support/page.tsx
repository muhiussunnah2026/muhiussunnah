import Link from "next/link";
import { LifeBuoy, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BengaliDate } from "@/components/ui/bengali-date";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { PORTAL_ROLES } from "@/lib/auth/roles";
import { NewTicketForm } from "./new-ticket-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

const statusLabel: Record<string, string> = {
  open: "খোলা", in_progress: "চলমান", waiting: "অপেক্ষমান", resolved: "সমাধান", closed: "বন্ধ",
};

export default async function PortalSupportPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, PORTAL_ROLES);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("support_tickets")
    .select("id, subject, body, status, priority, created_at")
    .eq("school_id", membership.school_id)
    .eq("created_by", membership.school_user_id)
    .order("created_at", { ascending: false })
    .limit(50);

  const tickets = (data ?? []) as Array<{ id: string; subject: string; body: string; status: string; priority: string; created_at: string }>;

  return (
    <>
      <PageHeader
        title="সাপোর্ট"
        subtitle="কোন সমস্যা? স্কুলকে সরাসরি বলুন। আমরা দ্রুত উত্তর দেব।"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {tickets.length === 0 ? (
            <EmptyState
              icon={<LifeBuoy className="size-8" />}
              title="এখনও কোন টিকেট নেই"
              body="ডান পাশের ফর্ম থেকে আপনার প্রশ্ন বা অভিযোগ পাঠান।"
            />
          ) : (
            <div className="grid gap-3">
              {tickets.map((t) => (
                <Link key={t.id} href={`/school/${schoolSlug}/portal/support/${t.id}`} className="group">
                  <Card className="transition hover:shadow-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t.subject}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {statusLabel[t.status] ?? t.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground"><BengaliDate value={t.created_at} /></p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Plus className="size-4" /> নতুন টিকেট
              </h2>
              <NewTicketForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
