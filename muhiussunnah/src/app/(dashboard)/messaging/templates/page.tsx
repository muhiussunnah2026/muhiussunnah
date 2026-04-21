import { getTranslations } from "next-intl/server";
import { MessageSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { TemplateForm } from "./template-form";
import { DeleteTemplateButton } from "./delete-template-button";

export default async function SmsTemplatesPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);
  const t = await getTranslations("messaging");

  const categoryLabel = (c: string | null) =>
    ({
      fee_reminder: t("tpl_cat_fee_reminder"),
      absent_alert: t("tpl_cat_absent_alert"),
      exam_reminder: t("tpl_cat_exam_reminder"),
      result_announce: t("tpl_cat_result_announce"),
      holiday: t("tpl_cat_holiday"),
      general: t("tpl_cat_general"),
      custom: t("tpl_cat_custom"),
    }[c ?? "general"] ?? t("tpl_cat_general"));

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templates } = await (supabase as any)
    .from("sms_templates")
    .select("id, name, category, body, language, variables, is_ai_generated, use_count, created_at")
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    name: string;
    category: string | null;
    body: string;
    language: string;
    variables: string[];
    is_ai_generated: boolean;
    use_count: number;
    created_at: string;
  };
  const list = (templates ?? []) as Row[];
  const aiCount = list.filter((tpl) => tpl.is_ai_generated).length;

  return (
    <>
      <PageHeader
        title={t("tpl_title")}
        subtitle={t("tpl_subtitle")}
        impact={[
          { label: <><BanglaDigit value={list.length} /> {t("tpl_count_suffix")}</>, tone: "default" },
          ...(aiCount > 0 ? [{ label: <><Sparkles className="me-1 inline size-3" /> <BanglaDigit value={aiCount} /> {t("tpl_ai_count")}</>, tone: "accent" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-8" />}
              title={t("tpl_empty_title")}
              body={t("tpl_empty_body")}
              proTip={t("tpl_empty_tip")}
            />
          ) : (
            <div className="space-y-3">
              {list.map((tpl) => (
                <Card key={tpl.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{tpl.name}</h3>
                          <Badge variant="outline" className="text-xs">{categoryLabel(tpl.category)}</Badge>
                          <Badge variant="secondary" className="text-xs">{tpl.language.toUpperCase()}</Badge>
                          {tpl.is_ai_generated && (
                            <Badge className="text-xs bg-gradient-primary text-white">
                              <Sparkles className="me-1 size-3" />AI
                            </Badge>
                          )}
                          {tpl.use_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {t("tpl_use_count", { count: tpl.use_count })}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-2">{tpl.body}</p>
                        {tpl.variables.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Variables: {tpl.variables.map((v) => <code key={v} className="mx-0.5 rounded bg-muted px-1 py-0.5">{`{{${v}}}`}</code>)}
                          </p>
                        )}
                      </div>
                      <DeleteTemplateButton id={tpl.id} schoolSlug={schoolSlug} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold">{t("tpl_new_heading")}</h2>
              <TemplateForm
                schoolName={membership.school_name_bn ?? membership.school_name_en ?? ""} schoolSlug={schoolSlug}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
