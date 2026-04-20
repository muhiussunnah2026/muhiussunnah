import { Home } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddHostelForm, AddRoomForm, AllocateForm } from "./hostel-forms";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function HostelPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES]);

  const supabase = await supabaseServer();

  // Hostels + students are independent (both keyed off school_id). Allocations depend on hostels' room ids.
  const [hostelsRes, studentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("hostels")
      .select("id, name, type, warden_name, capacity, hostel_rooms ( id, room_no, capacity )")
      .eq("school_id", membership.school_id)
      .order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, name_en")
      .eq("school_id", membership.school_id)
      .eq("is_active", true)
      .order("name_bn"),
  ]);
  const { data: hostels } = hostelsRes;
  const { data: students } = studentsRes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allocations } = await (supabase as any)
    .from("hostel_allocations")
    .select("id, bed_no, from_date, hostel_rooms ( room_no, hostels ( name ) ), students ( name_bn, name_en )")
    .in("room_id", (hostels ?? []).flatMap((h: { hostel_rooms: { id: string }[] }) => h.hostel_rooms.map((r) => r.id)))
    .is("to_date", null)
    .order("from_date", { ascending: false });

  type Room = { id: string; room_no: string; capacity: number };
  type Hostel = { id: string; name: string; type: string; warden_name: string | null; capacity: number | null; hostel_rooms: Room[] };
  const hostelList = (hostels ?? []) as Hostel[];
  const totalRooms = hostelList.reduce((s, h) => s + h.hostel_rooms.length, 0);
  const totalResidents = (allocations ?? []).length;

  const roomsFlat = hostelList.flatMap((h) =>
    h.hostel_rooms.map((r) => ({ id: r.id, room_no: r.room_no, hostel_name: h.name }))
  );

  const typeLabel = (t: string) => ({ boys: "ছেলে", girls: "মেয়ে", mixed: "মিশ্র" }[t] ?? t);

  return (
    <>
      <PageHeader
        title="হোস্টেল"
        subtitle="আবাসিক ভবন, রুম ও ছাত্র বরাদ্দ ব্যবস্থাপনা।"
        impact={[
          { label: <><BanglaDigit value={hostelList.length} /> হোস্টেল · <BanglaDigit value={totalRooms} /> রুম</>, tone: "default" },
          { label: <><BanglaDigit value={totalResidents} /> আবাসিক ছাত্র</>, tone: "accent" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {hostelList.length === 0 ? (
            <EmptyState
              icon={<Home className="size-8" />}
              title="কোন হোস্টেল নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম হোস্টেল যোগ করুন।"
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {hostelList.map((h) => (
                  <Card key={h.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{h.name}</h3>
                        <Badge variant="outline">{typeLabel(h.type)}</Badge>
                      </div>
                      {h.warden_name && <p className="text-xs text-muted-foreground mt-1">তত্ত্বাবধায়ক: {h.warden_name}</p>}
                      <p className="text-xs text-muted-foreground">
                        <BanglaDigit value={h.hostel_rooms.length} /> রুম
                        {h.capacity ? <> · ধারণক্ষমতা <BanglaDigit value={h.capacity} /></> : null}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(allocations ?? []).length > 0 && (
                <>
                  <h2 className="text-base font-semibold">বর্তমান আবাসিক ছাত্র</h2>
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ছাত্র</TableHead>
                            <TableHead>হোস্টেল / রুম</TableHead>
                            <TableHead>বেড</TableHead>
                            <TableHead>তারিখ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(allocations as Array<{ id: string; bed_no: string | null; from_date: string; hostel_rooms: { room_no: string; hostels: { name: string } } | null; students: { name_bn: string | null; name_en: string | null } | null }>).map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="text-sm">{a.students?.name_bn ?? a.students?.name_en ?? "—"}</TableCell>
                              <TableCell className="text-sm">{a.hostel_rooms?.hostels?.name} — রুম {a.hostel_rooms?.room_no}</TableCell>
                              <TableCell className="text-sm">{a.bed_no ?? "—"}</TableCell>
                              <TableCell className="text-xs">{a.from_date}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">নতুন হোস্টেল</h2>
              <AddHostelForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">রুম যোগ</h2>
              <AddRoomForm schoolSlug={schoolSlug} hostels={hostelList} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">ছাত্র বরাদ্দ</h2>
              <AllocateForm
                schoolSlug={schoolSlug}
                rooms={roomsFlat}
                students={(students ?? []) as Array<{ id: string; name_bn: string | null; name_en: string | null }>}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
