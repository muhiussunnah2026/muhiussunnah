import { getTranslations } from "next-intl/server";
import { Settings2, Shield, MessageSquare, Database, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function SuperAdminSettingsPage() {
  const t = await getTranslations("superAdmin");

  const hasSmsKey = Boolean(process.env.SMS_BD_API_KEY);
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const environment = process.env.NODE_ENV ?? "development";

  return (
    <>
      <PageHeader
        title={t("plat_settings_page_title")}
        subtitle={t("plat_settings_page_subtitle")}
        impact={[
          { label: t("plat_settings_impact_readonly"), tone: "accent" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform info */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/25">
                <Info className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{t("plat_settings_info_heading")}</h2>
                <p className="text-xs text-muted-foreground">{t("plat_settings_info_sub")}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted-foreground">{t("plat_settings_env_label")}</dt>
              <dd className="font-mono">{environment}</dd>
              <dt className="text-muted-foreground">{t("plat_settings_version_label")}</dt>
              <dd className="font-mono">Next 16 · Supabase</dd>
              <dt className="text-muted-foreground">{t("plat_settings_locales_label")}</dt>
              <dd>বাংলা · English</dd>
            </dl>
          </CardContent>
        </Card>

        {/* Integrations health */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/25">
                <Database className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{t("plat_settings_int_heading")}</h2>
                <p className="text-xs text-muted-foreground">{t("plat_settings_int_sub")}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <HealthRow
                label={t("plat_settings_int_supabase")}
                ok={hasSupabaseUrl && hasServiceRole}
              />
              <HealthRow label={t("plat_settings_int_sms")} ok={hasSmsKey} />
            </ul>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/25">
                <Shield className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{t("plat_settings_sec_heading")}</h2>
                <p className="text-xs text-muted-foreground">{t("plat_settings_sec_sub")}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("plat_settings_sec_body")}</p>
          </CardContent>
        </Card>

        {/* Messaging defaults */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/25">
                <MessageSquare className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{t("plat_settings_msg_heading")}</h2>
                <p className="text-xs text-muted-foreground">{t("plat_settings_msg_sub")}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("plat_settings_msg_body")}</p>
          </CardContent>
        </Card>

        {/* Coming soon */}
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-5">
            <Settings2 className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("plat_settings_soon")}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          ok
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        }`}
      >
        {ok ? "OK" : "—"}
      </span>
    </li>
  );
}
