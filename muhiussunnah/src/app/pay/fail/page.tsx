import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pay");
  return { title: t("fail_title_meta") };
}

export default async function PayFailPage({ searchParams }: { searchParams: Promise<{ code?: string; tran?: string }> }) {
  const { code, tran } = await searchParams;
  const t = await getTranslations("pay");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="size-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold">{t("fail_heading")}</h1>
      <p className="max-w-md text-muted-foreground">
        {t("fail_body")}
      </p>
      {code || tran ? (
        <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs">
          {code ? <>{t("fail_code")}: {code}</> : null}
          {tran ? <> · TXN: {tran}</> : null}
        </p>
      ) : null}
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        {t("fail_retry")}
      </Link>
    </div>
  );
}
