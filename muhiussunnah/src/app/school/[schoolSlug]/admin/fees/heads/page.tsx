import { CoinsIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddFeeHeadForm } from "./add-head-form";
import { UpdateAmountForm } from "./update-amount-form";
import { FeesSubNav } from "../nav";

type PageProps = { params: Promise<{ schoolSlug: string }> };

const typeLabel: Record<string, string> = {
  general: "সাধারণ", admission: "ভর্তি", session: "সেশন",
  exam: "পরীক্ষা", transport: "পরিবহন", hostel: "হোস্টেল",
  canteen: "ক্যান্টিন", other: "অন্যান্য",
};

const freqLabel: Record<string, string> = {
  monthly: "মাসিক", quarterly: "ত্রৈমাসিক", annual: "বার্ষিক", one_time: "একবার",
};

export default async function FeeHeadsPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("fee_heads")
    .select("id, name_bn, name_en, type, default_amount, frequency, is_recurring, display_order")
    .eq("school_id", membership.school_id)
    .order("display_order", { ascending: true });

  const heads = (data ?? []) as Array<{
    id: string; name_bn: string; name_en: string | null; type: string;
    default_amount: number; frequency: string | null; is_recurring: boolean; display_order: number;
  }>;

  return (
    <>
      <PageHeader
        title="ফি হেড"
        subtitle="স্কুল রেজিস্ট্রেশনের সময় ৩০টি ফি হেড স্বয়ংক্রিয়ভাবে seed হয়েছে। এখানে amount update করুন বা custom হেড যোগ করুন।"
        impact={[{ label: <>মোট · <BanglaDigit value={heads.length} /></>, tone: "accent" }]}
      />
      <FeesSubNav schoolSlug={schoolSlug} active="heads" />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead className="hidden md:table-cell">ধরন</TableHead>
                  <TableHead className="hidden md:table-cell">ফ্রিকোয়েন্সি</TableHead>
                  <TableHead className="text-right">ডিফল্ট amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heads.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="font-medium">{h.name_bn}</div>
                      {h.name_en ? <div className="text-xs text-muted-foreground">{h.name_en}</div> : null}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      <span className="rounded-full bg-muted px-2 py-0.5">{typeLabel[h.type] ?? h.type}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {h.frequency ? freqLabel[h.frequency] : "—"}
                    </TableCell>
                    <TableCell>
                      <UpdateAmountForm schoolSlug={schoolSlug} id={h.id} defaultAmount={Number(h.default_amount)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <CoinsIcon className="size-4" /> নতুন ফি হেড
              </h2>
              <AddFeeHeadForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
