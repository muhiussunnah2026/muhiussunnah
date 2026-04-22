import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { BulkImportUploader } from "./uploader";

export default async function BulkImportPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);
  const t = await getTranslations("studentsExtra");
  const schoolSlug = membership.school_slug;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> {t("bulk_back")}
          </Link>
        }
        title={t("bulk_page_title")}
        subtitle={t("bulk_page_subtitle")}
        impact={[
          { label: t("bulk_impact_batch"), tone: "accent" },
          { label: t("bulk_impact_match"), tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="p-5 md:p-6">
            <BulkImportUploader schoolSlug={schoolSlug} />
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-3">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-base font-semibold">{t("bulk_format_heading")}</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {t("bulk_format_body")}
              </p>
              <ul className="text-xs font-mono space-y-1">
                <li><strong>name_bn</strong> — {t("bulk_name_bn")}</li>
                <li><strong>name_en</strong> — {t("bulk_name_en")}</li>
                <li><strong>roll</strong> — {t("bulk_roll")}</li>
                <li><strong>class_name</strong> — {t("bulk_class_name")}</li>
                <li><strong>date_of_birth</strong> — {t("bulk_dob")}</li>
                <li><strong>admission_date</strong> — {t("bulk_admission_date")}</li>
                <li><strong>gender</strong> — {t("bulk_gender")}</li>
                <li><strong>guardian_phone</strong></li>
                <li><strong>address_present</strong></li>
              </ul>
              <a href="/student-import-template.csv" className="mt-4 inline-block text-xs text-primary underline">
                {t("bulk_template")}
              </a>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 text-xs">
              {t("bulk_tip")}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
