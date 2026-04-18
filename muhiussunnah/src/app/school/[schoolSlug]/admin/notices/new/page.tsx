import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { channelsAvailable } from "@/lib/messaging/dispatcher";
import { NoticeComposer } from "./composer";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function NewNoticePage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classes } = await (supabase as any)
    .from("classes")
    .select("id, name_bn, sections(id, name)")
    .eq("school_id", membership.school_id)
    .order("display_order");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (supabase as any)
    .from("schools")
    .select("sms_credit_balance_bdt, sms_per_msg_bdt_bn, sms_per_msg_bdt_en, whatsapp_per_msg_bdt")
    .eq("id", membership.school_id)
    .single();

  const available = channelsAvailable();

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/notices`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> নোটিশ তালিকা
          </Link>
        }
        title="নতুন নোটিশ তৈরি করুন"
        subtitle="এক ক্লিকে SMS + WhatsApp + App notification + Email পাঠান। Live cost estimate পান, যে পর্যন্ত পাঠান ো হয়নি ততক্ষণ edit করা যাবে।"
      />

      <Card>
        <CardContent className="p-5 md:p-6">
          <NoticeComposer
            schoolSlug={schoolSlug}
            classes={(classes ?? []) as { id: string; name_bn: string; sections: { id: string; name: string }[] }[]}
            available={available}
            costs={{
              sms_bn: Number(school?.sms_per_msg_bdt_bn ?? 0.4),
              sms_en: Number(school?.sms_per_msg_bdt_en ?? 0.25),
              whatsapp: Number(school?.whatsapp_per_msg_bdt ?? 0.5),
              balance: Number(school?.sms_credit_balance_bdt ?? 0),
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
