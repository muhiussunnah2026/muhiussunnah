import { Video, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ScheduleClassForm } from "./schedule-form";

export default async function OnlineClassesPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "CLASS_TEACHER", "SUBJECT_TEACHER"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  const now = new Date().toISOString();

  const [{ data: classes }, { data: sections }, { data: subjects }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("online_classes")
      .select("id, title, scheduled_at, duration_mins, meet_url, provider, recording_url, sections ( name_bn, classes ( name_bn ) ), subjects ( name_bn )")
      .eq("school_id", membership.school_id)
      .order("scheduled_at", { ascending: false })
      .limit(50),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("sections").select("id, name_bn, classes ( name_bn )").eq("school_id", membership.school_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("subjects").select("id, name_bn").eq("school_id", membership.school_id),
  ]);

  type Row = {
    id: string;
    title: string | null;
    scheduled_at: string;
    duration_mins: number | null;
    meet_url: string;
    provider: string;
    recording_url: string | null;
    sections: { name_bn: string; classes: { name_bn: string } } | null;
    subjects: { name_bn: string } | null;
  };
  const list = (classes ?? []) as Row[];

  const upcoming = list.filter((c) => c.scheduled_at >= now);
  const past = list.filter((c) => c.scheduled_at < now);

  const sectionOpts = ((sections ?? []) as Array<{ id: string; name_bn: string; classes: { name_bn: string } | null }>).map((s) => ({
    id: s.id, name_bn: s.name_bn, class_bn: s.classes?.name_bn ?? "",
  }));

  const providerLabel = (p: string) => ({ zoom: "Zoom", google_meet: "Meet", teams: "Teams", other: "অন্যান্য" }[p] ?? p);

  return (
    <>
      <PageHeader
        title="অনলাইন ক্লাস"
        subtitle="Zoom / Google Meet / Teams ক্লাস শিডিউল করুন। ছাত্ররা portal থেকে যোগ দিতে পারবে।"
        impact={[
          { label: <>আসন্ন · <BanglaDigit value={upcoming.length} /></>, tone: "accent" },
          { label: <>সম্পন্ন · <BanglaDigit value={past.length} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {upcoming.length > 0 && (
            <>
              <h2 className="text-base font-semibold">আসন্ন ক্লাস</h2>
              <div className="space-y-2">
                {upcoming.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{c.title ?? c.subjects?.name_bn ?? "ক্লাস"}</h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.sections ? `${c.sections.classes?.name_bn} — ${c.sections.name_bn}` : "—"} · {c.subjects?.name_bn ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          🗓️ {new Date(c.scheduled_at).toLocaleString("bn-BD")}
                          {c.duration_mins && <> · <BanglaDigit value={c.duration_mins} /> মিনিট</>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{providerLabel(c.provider)}</Badge>
                        <a href={c.meet_url} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm" })}>
                          <ExternalLink className="me-1.5 size-3.5" />
                          যোগ দিন
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <h2 className="text-base font-semibold text-muted-foreground">অতীত ক্লাস</h2>
              <div className="space-y-2">
                {past.slice(0, 20).map((c) => (
                  <Card key={c.id} className="opacity-75">
                    <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex-1">
                        <div className="text-sm">{c.title ?? c.subjects?.name_bn}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.sections ? `${c.sections.classes?.name_bn} — ${c.sections.name_bn}` : "—"} · {new Date(c.scheduled_at).toLocaleDateString("bn-BD")}
                        </div>
                      </div>
                      {c.recording_url && (
                        <a href={c.recording_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                          📹 রেকর্ডিং
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {list.length === 0 && (
            <EmptyState
              icon={<Video className="size-8" />}
              title="কোন অনলাইন ক্লাস নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম ক্লাস শিডিউল করুন।"
            />
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">ক্লাস শিডিউল</h2>
              <ScheduleClassForm
                sections={sectionOpts}
                subjects={(subjects ?? []) as Array<{ id: string; name_bn: string }>}
              schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
