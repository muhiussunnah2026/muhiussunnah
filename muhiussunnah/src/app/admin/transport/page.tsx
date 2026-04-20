import { Bus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddRouteForm, AddVehicleForm } from "./route-forms";

export default async function TransportPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: routes } = await (supabase as any)
    .from("transport_routes")
    .select("id, name, start_point, end_point, fare_per_month, is_active, transport_vehicles ( id, reg_no, driver_name, capacity )")
    .eq("school_id", membership.school_id)
    .order("name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentCount } = await (supabase as any)
    .from("transport_students")
    .select("id", { count: "exact" })
    .in("route_id", (routes ?? []).map((r: { id: string }) => r.id))
    .eq("is_active", true);

  type Vehicle = { id: string; reg_no: string; driver_name: string | null; capacity: number | null };
  type Route = { id: string; name: string; start_point: string | null; end_point: string | null; fare_per_month: number | null; is_active: boolean; transport_vehicles: Vehicle[] };
  const routeList = (routes ?? []) as Route[];
  const totalVehicles = routeList.reduce((s, r) => s + r.transport_vehicles.length, 0);

  return (
    <>
      <PageHeader
        title="পরিবহন"
        subtitle="রুট, গাড়ি ও ছাত্রদের পরিবহন ব্যবস্থাপনা।"
        impact={[
          { label: <><BanglaDigit value={routeList.length} /> রুট</>, tone: "default" },
          { label: <><BanglaDigit value={totalVehicles} /> গাড়ি</>, tone: "accent" },
          { label: <><BanglaDigit value={(studentCount as { id: string }[])?.length ?? 0} /> ছাত্র</>, tone: "success" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          {routeList.length === 0 ? (
            <EmptyState
              icon={<Bus className="size-8" />}
              title="কোন রুট নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম রুট যোগ করুন।"
            />
          ) : (
            <div className="space-y-4">
              {routeList.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{r.name}</h3>
                        {(r.start_point || r.end_point) && (
                          <p className="text-xs text-muted-foreground">{r.start_point} → {r.end_point}</p>
                        )}
                        {r.fare_per_month && (
                          <p className="text-xs text-muted-foreground">মাসিক ভাড়া: ৳ <BanglaDigit value={r.fare_per_month} /></p>
                        )}
                      </div>
                      <Badge variant={r.is_active ? "default" : "secondary"}>
                        {r.is_active ? "সক্রিয়" : "বন্ধ"}
                      </Badge>
                    </div>
                    {r.transport_vehicles.length > 0 && (
                      <Table className="mt-3">
                        <TableHeader>
                          <TableRow>
                            <TableHead>রেজিস্ট্রেশন</TableHead>
                            <TableHead>ড্রাইভার</TableHead>
                            <TableHead className="text-right">ধারণ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {r.transport_vehicles.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="text-sm font-mono">{v.reg_no}</TableCell>
                              <TableCell className="text-sm">{v.driver_name ?? "—"}</TableCell>
                              <TableCell className="text-right text-sm">{v.capacity ? <BanglaDigit value={v.capacity} /> : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">নতুন রুট</h2>
              <AddRouteForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">গাড়ি যোগ করুন</h2>
              <AddVehicleForm routes={routeList} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
