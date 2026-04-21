import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WifiOff } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("offline");
  return { title: t("title_meta") };
}

export default async function OfflinePage() {
  const t = await getTranslations("offline");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <WifiOff className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold">{t("heading")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {t("body")}
      </p>
    </div>
  );
}
