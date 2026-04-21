import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Ban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pay");
  return { title: t("cancel_title_meta") };
}

export default async function PayCancelPage() {
  const t = await getTranslations("pay");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Ban className="size-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold">{t("cancel_heading")}</h1>
      <p className="max-w-md text-muted-foreground">
        {t("cancel_body")}
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        {t("cancel_back")}
      </Link>
    </div>
  );
}
