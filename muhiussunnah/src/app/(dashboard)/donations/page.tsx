import { HeartHandshake } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddCampaignForm, AddDonationForm } from "./forms";

export default async function DonationsPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Independent — both keyed off school_id.
  const [campaignsRes, donationsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("donation_campaigns")
      .select("id, title, description, target_amount, start_date, end_date, status")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("donations")
      .select("id, donor_name, donor_phone, amount, method, receipt_no, received_at, is_anonymous, campaign_id, donation_campaigns ( title )")
      .eq("school_id", membership.school_id)
      .order("received_at", { ascending: false })
      .limit(200),
  ]);
  const { data: campaigns } = campaignsRes;
  const { data: donations } = donationsRes;

  const campaignList = (campaigns ?? []) as { id: string; title: string; description: string | null; target_amount: number | null; start_date: string | null; end_date: string | null; status: string }[];
  const donationList = (donations ?? []) as { id: string; donor_name: string | null; donor_phone: string | null; amount: number; method: string; receipt_no: string | null; received_at: string; is_anonymous: boolean; campaign_id: string | null; donation_campaigns: { title: string } | null }[];

  const totalReceived = donationList.reduce((s, d) => s + Number(d.amount), 0);

  // Per-campaign totals
  const campaignTotals = new Map<string, number>();
  for (const d of donationList) {
    if (!d.campaign_id) continue;
    campaignTotals.set(d.campaign_id, (campaignTotals.get(d.campaign_id) ?? 0) + Number(d.amount));
  }

  const t = await getTranslations("donations");

  return (
    <>
      <PageHeader
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: <>{t("impact_total")} · ৳ <BanglaDigit value={totalReceived.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <>{t("impact_active_campaigns")} · <BanglaDigit value={campaignList.filter((c) => c.status === "active").length} /></>, tone: "accent" },
        ]}
      />

      {campaignList.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("active_campaigns_heading")}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {campaignList.map((c) => {
              const raised = campaignTotals.get(c.id) ?? 0;
              const pct = c.target_amount ? Math.round((raised / Number(c.target_amount)) * 100) : null;
              return (
                <Card key={c.id}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{c.title}</h3>
                    {c.description ? <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.description}</p> : null}
                    <div className="mt-3">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold">৳ <BanglaDigit value={raised.toLocaleString("en-IN")} /></span>
                        {c.target_amount ? (
                          <span className="text-xs text-muted-foreground">
                            / ৳ <BanglaDigit value={Number(c.target_amount).toLocaleString("en-IN")} />
                          </span>
                        ) : null}
                      </div>
                      {pct !== null ? (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      ) : null}
                      {pct !== null ? <p className="mt-1 text-xs text-muted-foreground"><BanglaDigit value={pct} />{t("pct_complete_suffix")}</p> : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {donationList.length === 0 ? (
            <EmptyState
              icon={<HeartHandshake className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
              proTip={t("empty_tip")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_receipt")}</TableHead>
                      <TableHead>{t("col_donor")}</TableHead>
                      <TableHead>{t("col_campaign")}</TableHead>
                      <TableHead>{t("col_date")}</TableHead>
                      <TableHead className="text-right">{t("col_amount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donationList.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">{d.receipt_no}</TableCell>
                        <TableCell>
                          <div>{d.is_anonymous ? <span className="italic text-muted-foreground">{t("anonymous_donor")}</span> : d.donor_name ?? "—"}</div>
                          {!d.is_anonymous && d.donor_phone ? <div className="text-xs text-muted-foreground">{d.donor_phone}</div> : null}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.donation_campaigns?.title ?? "—"}</TableCell>
                        <TableCell className="text-xs"><BengaliDate value={d.received_at} /></TableCell>
                        <TableCell className="text-right">৳ <BanglaDigit value={Number(d.amount).toLocaleString("en-IN")} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">{t("sidebar_new_donation")}</h2>
              <AddDonationForm campaigns={campaignList.filter((c) => c.status === "active")} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">{t("sidebar_new_campaign")}</h2>
              <AddCampaignForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
