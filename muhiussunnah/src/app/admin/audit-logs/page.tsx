import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ action?: string; resource?: string; days?: string }>;
};

const actionVariant = (a: string): "default" | "secondary" | "destructive" | "outline" =>
  a.startsWith("delete") ? "destructive" : a.startsWith("create") ? "default" : a.startsWith("update") ? "secondary" : "outline";

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const days = Number(search.days ?? 30);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const supabase = await supabaseServer();

  let query = (supabase as unknown as { from: (t: string) => unknown }).from("audit_logs") as unknown as {
    select: (s: string) => {
      eq: (k: string, v: string) => {
        gte: (k: string, v: string) => {
          order: (k: string, o: { ascending: boolean }) => {
            limit: (n: number) => Promise<{ data: unknown }>;
          };
        };
      };
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase as any)
    .from("audit_logs")
    .select("id, action, resource_type, resource_id, meta, created_at, user_id")
    .eq("school_id", membership.school_id)
    .gte("created_at", fromDate.toISOString());

  if (search.action) q = q.eq("action", search.action);
  if (search.resource) q = q.eq("resource_type", search.resource);

  const { data: logs } = await q.order("created_at", { ascending: false }).limit(500);

  // Fetch user names for the logs (prevent N+1 by bulk query)
  const userIds = [...new Set(((logs ?? []) as Array<{ user_id: string | null }>).map((l) => l.user_id).filter(Boolean))] as string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: users } = userIds.length > 0
    ? await (supabase as any).from("school_users").select("user_id, full_name_bn, full_name_en").in("user_id", userIds)
    : { data: [] };
  const userMap = new Map<string, string>();
  for (const u of ((users ?? []) as Array<{ user_id: string; full_name_bn: string | null; full_name_en: string | null }>)) {
    userMap.set(u.user_id, u.full_name_bn ?? u.full_name_en ?? u.user_id.slice(0, 8));
  }

  type Log = {
    id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    meta: Record<string, unknown>;
    created_at: string;
    user_id: string | null;
  };
  const list = (logs ?? []) as Log[];

  const actionCounts = new Map<string, number>();
  const resourceCounts = new Map<string, number>();
  for (const l of list) {
    actionCounts.set(l.action, (actionCounts.get(l.action) ?? 0) + 1);
    resourceCounts.set(l.resource_type, (resourceCounts.get(l.resource_type) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader
        title="অডিট লগ"
        subtitle="গত ৩০ দিনের সব ব্যবহারকারীর কার্যকলাপ — কে কী তৈরি, পরিবর্তন বা মুছেছে, সবকিছুর trail।"
        impact={[
          { label: <>মোট · <BanglaDigit value={list.length} /></>, tone: "default" },
          { label: <>Actions · <BanglaDigit value={actionCounts.size} /></>, tone: "accent" },
          { label: <>Resources · <BanglaDigit value={resourceCounts.size} /></>, tone: "accent" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title="কোন লগ নেই"
          body={`গত ${days} দিনে কোন কার্যকলাপ রেকর্ড করা হয়নি।`}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>সময়</TableHead>
                  <TableHead>ব্যবহারকারী</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Meta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString("bn-BD", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.user_id ? (userMap.get(l.user_id) ?? <code className="text-xs">{l.user_id.slice(0, 8)}</code>) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionVariant(l.action)} className="text-xs">{l.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{l.resource_type}</div>
                      {l.resource_id && <div className="text-muted-foreground"><code>{l.resource_id.slice(0, 8)}</code></div>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {Object.keys(l.meta ?? {}).length > 0 ? JSON.stringify(l.meta) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
