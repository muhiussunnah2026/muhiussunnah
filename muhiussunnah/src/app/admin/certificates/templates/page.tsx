import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddTemplateForm } from "./add-template-form";

const typeLabel: Record<string, string> = {
  testimonial: "প্রশংসাপত্র", tc: "ট্রান্সফার", character: "চরিত্র",
  completion: "কমপ্লিশন", hifz_sanad: "হিফজ সনদ", other: "অন্যান্য",
};

export default async function TemplatesPage() {
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("certificate_templates")
    .select("id, name, type, orientation, paper_size, is_active, variables")
    .eq("school_id", membership.school_id)
    .order("type");

  const list = (data ?? []) as Array<{
    id: string; name: string; type: string; orientation: string; paper_size: string;
    is_active: boolean; variables: string[];
  }>;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/certificates`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> সার্টিফিকেট
          </Link>
        }
        title="সার্টিফিকেট টেমপ্লেট"
        subtitle="HTML টেমপ্লেটে {{variable}} দিয়ে প্লেসহোল্ডার রাখুন — ইস্যু করার সময় ছাত্রের তথ্য দিয়ে ফিল হয়ে যাবে।"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-8" />}
              title="এখনও কোন টেমপ্লেট নেই"
              body="ডান পাশ থেকে প্রথম টেমপ্লেট তৈরি করুন। HTML + CSS লিখে যেকোন ডিজাইন বানাতে পারেন।"
              proTip="মাদ্রাসার জন্য 'হিফজ সনদ' টেমপ্লেট তৈরি করে স্বয়ংক্রিয় serial সহ ইস্যু করুন।"
            />
          ) : (
            <div className="grid gap-3">
              {list.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{t.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {typeLabel[t.type] ?? t.type} · {t.orientation} · {t.paper_size}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <BanglaDigit value={t.variables?.length ?? 0} /> টি variable
                      </div>
                    </div>
                    {t.variables && t.variables.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.variables.map((v) => (
                          <span key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন টেমপ্লেট</h2>
              <AddTemplateForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
