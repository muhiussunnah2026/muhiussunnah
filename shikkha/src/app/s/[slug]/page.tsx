import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Globe, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Public school website — each school gets a shareable page at /s/[slug].
 * Shows: school info, recent public notices, admissions contact.
 * No auth required.
 */
export default async function PublicSchoolPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (supabase as any)
    .from("schools")
    .select("id, name_bn, name_en, eiin, type, address, phone, email, website, logo_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!school) return notFound();

  // Public notices only (those marked public_web)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notices } = await (supabase as any)
    .from("notices")
    .select("id, title_bn, body_bn, created_at, priority")
    .eq("school_id", school.id)
    .contains("audience", ["public"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Student count (rough public stat)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: studentCount } = await (supabase as any)
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", school.id)
    .eq("is_active", true);

  const noticeList = (notices ?? []) as Array<{ id: string; title_bn: string; body_bn: string; created_at: string; priority: string }>;
  const typeLabel = { school: "স্কুল", madrasa: "মাদ্রাসা", both: "স্কুল ও মাদ্রাসা" }[school.type as string] ?? "প্রতিষ্ঠান";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-primary text-white">
        <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-start gap-4 flex-wrap">
            {school.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logo_url} alt="" className="size-20 rounded-lg bg-white/10 p-2" />
            )}
            <div className="flex-1 min-w-0">
              <Badge className="bg-white/20 text-white border-white/20 mb-2">{typeLabel}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold">{school.name_bn}</h1>
              {school.name_en && <p className="text-white/80 text-lg mt-1">{school.name_en}</p>}
              {school.eiin && <p className="text-sm text-white/70 mt-2">EIIN: <BanglaDigit value={school.eiin} /></p>}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/school/${slug}/login`} className="rounded-md bg-white text-primary px-5 py-2.5 text-sm font-medium hover:bg-white/90">
              অভিভাবক / ছাত্র পোর্টাল
            </Link>
            <Link href={`/school/${slug}/admin/admission-inquiry`} className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium hover:bg-white/10">
              ভর্তি জিজ্ঞাসা
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        {/* Info sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold">যোগাযোগ</h2>
              {school.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <span>{school.address}</span>
                </div>
              )}
              {school.phone && (
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <a href={`tel:${school.phone}`} className="hover:underline">{school.phone}</a>
                </div>
              )}
              {school.email && (
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <a href={`mailto:${school.email}`} className="hover:underline">{school.email}</a>
                </div>
              )}
              {school.website && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <a href={school.website} target="_blank" rel="noreferrer" className="hover:underline">{school.website}</a>
                </div>
              )}
            </CardContent>
          </Card>

          {(studentCount ?? 0) > 0 && (
            <Card>
              <CardContent className="p-5 text-center">
                <div className="text-3xl font-bold"><BanglaDigit value={studentCount ?? 0} /></div>
                <div className="text-sm text-muted-foreground">সক্রিয় শিক্ষার্থী</div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Notices */}
        <main className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Megaphone className="size-5" />সাম্প্রতিক নোটিশ
            </h2>
          </div>

          {noticeList.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                এখনো কোন প্রকাশিত নোটিশ নেই।
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {noticeList.map((n) => (
                <Card key={n.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <h3 className="font-semibold">{n.title_bn}</h3>
                      {n.priority === "urgent" && <Badge variant="destructive">জরুরি</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{n.body_bn}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(n.created_at).toLocaleDateString("bn-BD")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t mt-10 py-6 text-center text-xs text-muted-foreground">
        <p>এই ওয়েবসাইট <Link href="/" className={buttonVariants({ variant: "link", size: "sm" }) + " !p-0 !h-auto"}>Muhius Sunnah</Link>-এ তৈরি — বাংলাদেশের স্কুল ও মাদ্রাসার জন্য।</p>
      </footer>
    </div>
  );
}
