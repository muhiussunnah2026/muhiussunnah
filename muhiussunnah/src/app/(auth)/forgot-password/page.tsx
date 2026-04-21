import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("forgotPassword");
  return { title: t("title") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("forgotPassword");
  return (
    <Card className="border-border/60 shadow-hover">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ForgotPasswordForm />
        <div className="border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
          {t("remembered")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("login_link")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
