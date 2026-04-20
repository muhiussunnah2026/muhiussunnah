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

const categoryLabel = (c: string | null) =>
  ({
    fee_reminder: "ফি রিমাইন্ডার",
    absent_alert: "অনুপস্থিতি",
    exam_reminder: "পরীক্ষা",
    result_announce: "রেজাল্ট",
    holiday: "ছুটি",
    general: "সাধারণ",
    custom: "কাস্টম",
  }[c ?? "general"] ?? "সাধারণ");

export default async function SmsTemplatesPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);

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
  const aiCount = list.filter((t) => t.is_ai_generated).length;

  return (
    <>
      <PageHeader
        title="SMS টেমপ্লেট"
        subtitle="পুনরায় ব্যবহারযোগ্য SMS টেমপ্লেট — AI দিয়ে তৈরি করুন, variables দিয়ে personalize করুন, নোটিশ কম্পোজারে ব্যবহার করুন।"
        impact={[
          { label: <><BanglaDigit value={list.length} /> টেমপ্লেট</>, tone: "default" },
          ...(aiCount > 0 ? [{ label: <><Sparkles className="me-1 inline size-3" /> <BanglaDigit value={aiCount} /> AI-তৈরি</>, tone: "accent" as const }] : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-8" />}
              title="এখনো কোন টেমপ্লেট নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম টেমপ্লেট তৈরি করুন। AI অপশন ব্যবহার করে সেকেন্ডে পেশাদার কপি পাবেন।"
              proTip="variable placeholder হিসেবে {{student_name}}, {{amount}}, {{month}} ব্যবহার করুন — নোটিশ পাঠানোর সময় auto-fill হবে।"
            />
          ) : (
            <div className="space-y-3">
              {list.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{t.name}</h3>
                          <Badge variant="outline" className="text-xs">{categoryLabel(t.category)}</Badge>
                          <Badge variant="secondary" className="text-xs">{t.language.toUpperCase()}</Badge>
                          {t.is_ai_generated && (
                            <Badge className="text-xs bg-gradient-primary text-white">
                              <Sparkles className="me-1 size-3" />AI
                            </Badge>
                          )}
                          {t.use_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <BanglaDigit value={t.use_count} /> বার ব্যবহৃত
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-2">{t.body}</p>
                        {t.variables.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Variables: {t.variables.map((v) => <code key={v} className="mx-0.5 rounded bg-muted px-1 py-0.5">{`{{${v}}}`}</code>)}
                          </p>
                        )}
                      </div>
                      <DeleteTemplateButton id={t.id} schoolSlug={schoolSlug} />
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
              <h2 className="mb-4 text-base font-semibold">নতুন টেমপ্লেট</h2>
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
