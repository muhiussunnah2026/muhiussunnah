import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CreditCard, FileSpreadsheet, ScrollText, User2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ShiftForm } from "./shift-form";

type PageProps = { params: Promise<{ schoolSlug: string; id: string }> };

export default async function StudentDetailPage({ params }: PageProps) {
  const { schoolSlug, id } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();
  // Independent queries — student, attendance, ledger all keyed off the same student id;
  // sections are keyed off school_id. All can run in parallel.
  const [sRes, attendanceRes, ledgerRes, sectionsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select(`
        id, student_code, name_bn, name_en, name_ar, roll, gender, photo_url,
        blood_group, religion, date_of_birth, admission_date, guardian_phone,
        address_present, address_permanent, previous_school, status,
        section_id, sections ( id, name, classes ( id, name_bn ) ),
        student_guardians ( id, name_bn, phone, relation, is_primary )
      `)
      .eq("id", id)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("attendance")
      .select("date, status")
      .eq("student_id", id)
      .order("date", { ascending: false })
      .limit(30),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("student_ledger_entries")
      .select("id, date, ref_type, debit, credit, running_balance, note")
      .eq("student_id", id)
      .order("date", { ascending: false })
      .limit(50),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id, name, class_id, classes!inner(name_bn, school_id)")
      .eq("classes.school_id", membership.school_id),
  ]);
  const { data: s } = sRes;
  const { data: attendance } = attendanceRes;
  const { data: ledger } = ledgerRes;
  const { data: sections } = sectionsRes;

  if (!s) notFound();

  const student = s as {
    id: string; student_code: string; name_bn: string; name_en: string | null; name_ar: string | null;
    roll: number | null; gender: string | null; photo_url: string | null;
    blood_group: string | null; religion: string | null; date_of_birth: string | null;
    admission_date: string | null; guardian_phone: string | null;
    address_present: string | null; address_permanent: string | null; previous_school: string | null;
    status: string;
    section_id: string | null;
    sections: { id: string; name: string; classes: { id: string; name_bn: string } } | null;
    student_guardians: { id: string; name_bn: string; phone: string | null; relation: string; is_primary: boolean }[];
  };

  const attendanceList = (attendance ?? []) as { date: string; status: string }[];
  const presentDays = attendanceList.filter((a) => a.status === "present" || a.status === "late").length;
  const attendancePct = attendanceList.length > 0
    ? Math.round((presentDays / attendanceList.length) * 100)
    : 0;

  const ledgerList = (ledger ?? []) as Array<{ id: string; date: string; ref_type: string; debit: number; credit: number; running_balance: number | null; note: string | null }>;
  const balance = ledgerList[0]?.running_balance ?? 0;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> ছাত্র তালিকা
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            <Avatar className="size-12">
              {student.photo_url ? <AvatarImage src={student.photo_url} alt={student.name_bn} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">{student.name_bn.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{student.name_bn}</span>
          </span>
        }
        subtitle={
          <>
            {student.sections ? <>{student.sections.classes.name_bn} — {student.sections.name} · </> : null}
            {student.roll ? <>রোল: <BanglaDigit value={student.roll} /> · </> : null}
            ID: <span className="font-mono">{student.student_code}</span>
          </>
        }
        impact={[
          { label: <>উপস্থিতি · <BanglaDigit value={attendancePct} />%</>, tone: "success" },
          { label: <>ব্যালেন্স · ৳ <BanglaDigit value={Number(balance).toLocaleString("en-IN")} /></>, tone: balance > 0 ? "warning" : "accent" },
          { label: student.status === "active" ? "সক্রিয়" : student.status, tone: "default" },
        ]}
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><User2 className="me-1.5 size-3.5" />প্রোফাইল</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="me-1.5 size-3.5" />উপস্থিতি</TabsTrigger>
          <TabsTrigger value="marks"><ScrollText className="me-1.5 size-3.5" />মার্ক্স</TabsTrigger>
          <TabsTrigger value="ledger"><CreditCard className="me-1.5 size-3.5" />লেজার</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">মৌলিক তথ্য</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <dt className="text-muted-foreground">নাম (ইংরেজি)</dt>
                  <dd>{student.name_en ?? "—"}</dd>
                  <dt className="text-muted-foreground">জন্মতারিখ</dt>
                  <dd>{student.date_of_birth ? <BengaliDate value={student.date_of_birth} /> : "—"}</dd>
                  <dt className="text-muted-foreground">লিঙ্গ</dt>
                  <dd>{student.gender === "male" ? "ছেলে" : student.gender === "female" ? "মেয়ে" : "—"}</dd>
                  <dt className="text-muted-foreground">রক্তের গ্রুপ</dt>
                  <dd>{student.blood_group ?? "—"}</dd>
                  <dt className="text-muted-foreground">ধর্ম</dt>
                  <dd>{student.religion ?? "—"}</dd>
                  <dt className="text-muted-foreground">ভর্তির তারিখ</dt>
                  <dd>{student.admission_date ? <BengaliDate value={student.admission_date} /> : "—"}</dd>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">অভিভাবক</h3>
                {student.student_guardians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">কোন অভিভাবক রেকর্ড নেই।</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {student.student_guardians.map((g) => (
                      <li key={g.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{g.name_bn}</div>
                          <div className="text-xs text-muted-foreground">{g.relation}</div>
                        </div>
                        {g.phone ? <a href={`tel:${g.phone}`} className="text-xs text-primary">{g.phone}</a> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">ঠিকানা</h3>
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">বর্তমান</dt>
                    <dd className="mt-1">{student.address_present ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">স্থায়ী</dt>
                    <dd className="mt-1">{student.address_permanent ?? "—"}</dd>
                  </div>
                </dl>
                {student.previous_school ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    পূর্ববর্তী স্কুল: {student.previous_school}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">ক্লাস/সেকশন স্থানান্তর</h3>
                <ShiftForm schoolSlug={schoolSlug} studentId={student.id} currentSectionId={student.section_id} sections={sections ?? []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">সর্বশেষ ৩০ দিন</h3>
              {attendanceList.length === 0 ? (
                <p className="text-sm text-muted-foreground">এখনও কোন attendance রেকর্ড নেই।</p>
              ) : (
                <div className="grid grid-cols-10 gap-1 md:grid-cols-15 lg:grid-cols-30">
                  {attendanceList.map((a) => {
                    const color =
                      a.status === "present" ? "bg-success/70" :
                      a.status === "late" ? "bg-warning/70" :
                      a.status === "absent" ? "bg-destructive/60" :
                      "bg-muted";
                    return (
                      <div
                        key={a.date}
                        title={`${a.date} · ${a.status}`}
                        className={`size-6 rounded ${color}`}
                        aria-label={`${a.date} ${a.status}`}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              🚧 মার্ক্স সেকশন Phase 2-এ আসছে।
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardContent className="p-0">
              {ledgerList.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  এখনও কোন লেজার এন্ট্রি নেই।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs">
                      <tr>
                        <th className="p-3 text-left">তারিখ</th>
                        <th className="p-3 text-left">ধরন</th>
                        <th className="p-3 text-left">নোট</th>
                        <th className="p-3 text-right">ডেবিট</th>
                        <th className="p-3 text-right">ক্রেডিট</th>
                        <th className="p-3 text-right">ব্যালেন্স</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerList.map((e) => (
                        <tr key={e.id} className="border-t border-border/60">
                          <td className="p-3"><BengaliDate value={e.date} /></td>
                          <td className="p-3 text-xs"><span className="rounded-full bg-muted px-2 py-0.5">{e.ref_type}</span></td>
                          <td className="p-3 text-xs text-muted-foreground">{e.note ?? "—"}</td>
                          <td className="p-3 text-right">{e.debit > 0 ? <>৳ <BanglaDigit value={Number(e.debit).toLocaleString("en-IN")} /></> : "—"}</td>
                          <td className="p-3 text-right">{e.credit > 0 ? <>৳ <BanglaDigit value={Number(e.credit).toLocaleString("en-IN")} /></> : "—"}</td>
                          <td className="p-3 text-right font-medium">{e.running_balance !== null ? <>৳ <BanglaDigit value={Number(e.running_balance).toLocaleString("en-IN")} /></> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          <Link href={`/school/${schoolSlug}/admin/students/${id}/ledger`} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
            <FileSpreadsheet className="me-1.5 size-3.5" />
            সম্পূর্ণ লেজার দেখুন
          </Link>
        </TabsContent>
      </Tabs>
    </>
  );
}
