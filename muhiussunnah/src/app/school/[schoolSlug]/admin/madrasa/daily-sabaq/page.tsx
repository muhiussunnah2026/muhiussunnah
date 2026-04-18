import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { formatDualDate } from "@/lib/utils/date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireMadrasaRole } from "@/lib/auth/require-madrasa";
import { ADMIN_ROLES, TEACHER_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function DailySabaqIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const { active } = await requireMadrasaRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT", ...TEACHER_ROLES, "MADRASA_USTADH"]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sections } = await (supabase as any)
    .from("sections")
    .select("id, name, classes!inner(name_bn, school_id, stream)")
    .eq("classes.school_id", active.school_id);

  // Prefer hifz/kitab streams; fall back to all if none
  const all = (sections ?? []) as Array<{ id: string; name: string; classes: { name_bn: string; stream: string } }>;
  const madrasa = all.filter((s) => ["hifz", "kitab", "nazera"].includes(s.classes.stream));
  const display = madrasa.length > 0 ? madrasa : all;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="দৈনিক সবক-সবকী-মানজিল"
        subtitle={`আজকের তারিখ: ${formatDualDate(today, { withWeekday: true, withHijri: true })} · সেকশন বেছে নিয়ে এন্ট্রি শুরু করুন।`}
        impact={[{ label: <>সেকশন · <BanglaDigit value={display.length} /></>, tone: "accent" }]}
      />

      {display.length === 0 ? (
        <EmptyState
          icon={<BookOpenText className="size-8" />}
          title="কোন সেকশন নেই"
          body="আগে ক্লাস + সেকশন তৈরি করুন, তারপর এখানে সবক এন্ট্রি করতে পারবেন।"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {display.map((s) => (
            <Link
              key={s.id}
              href={`/school/${schoolSlug}/admin/madrasa/daily-sabaq/${s.id}?date=${today}`}
              className="group"
            >
              <Card className="transition hover:shadow-hover">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{s.classes.name_bn} — সেকশন {s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">স্ট্রিম: {s.classes.stream}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
