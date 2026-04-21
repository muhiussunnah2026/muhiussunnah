import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pay");
  return { title: t("success_title_meta") };
}

export default async function PaySuccessPage() {
  const t = await getTranslations("pay");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-10 text-success" />
      </div>
      <h1 className="text-3xl font-bold">{t("success_heading")}</h1>
      <p className="max-w-md text-muted-foreground">
        {t("success_body")}
      </p>
      <Link href="/" className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
        {t("success_back_home")}
      </Link>
    </div>
  );
}
