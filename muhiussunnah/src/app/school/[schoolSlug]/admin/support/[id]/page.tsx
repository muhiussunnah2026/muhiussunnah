import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ReplyForm } from "./reply-form";
import { StatusButtons } from "./status-buttons";

type PageProps = { params: Promise<{ schoolSlug: string; id: string }> };

export default async function TicketDetailPage({ params }: PageProps) {
  const { schoolSlug, id } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();
  // Independent queries — ticket + its messages both keyed off the ticket id.
  const [ticketRes, messagesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("support_tickets")
      .select("id, subject, body, priority, status, category, created_at, created_by, school_id")
      .eq("id", id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("support_messages")
      .select("id, user_id, body, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
  ]);
  const { data: ticket } = ticketRes;
  const { data: messages } = messagesRes;

  if (!ticket || ticket.school_id !== membership.school_id) notFound();

  const msgs = (messages ?? []) as { id: string; user_id: string; body: string; created_at: string }[];

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/support`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> টিকেট তালিকা
          </Link>
        }
        title={ticket.subject}
        subtitle={<>Priority: {ticket.priority} · Status: {ticket.status} · <BengaliDate value={ticket.created_at} /></>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 text-xs text-muted-foreground">
                প্রাথমিক বিবরণ
              </div>
              <p className="whitespace-pre-line text-sm">{ticket.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                <BengaliDate value={ticket.created_at} />
              </p>
            </CardContent>
          </Card>

          {msgs.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {m.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="whitespace-pre-line text-sm">{m.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground"><BengaliDate value={m.created_at} /></p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">উত্তর</h3>
              <ReplyForm schoolSlug={schoolSlug} ticketId={id} />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">স্ট্যাটাস</h3>
              <StatusButtons schoolSlug={schoolSlug} ticketId={id} currentStatus={ticket.status} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
