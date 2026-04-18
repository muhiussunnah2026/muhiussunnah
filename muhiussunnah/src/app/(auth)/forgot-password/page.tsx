import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড ভুলে গেছেন?",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="border-border/60 shadow-hover">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-2xl">পাসওয়ার্ড রিসেট</CardTitle>
        <p className="text-sm text-muted-foreground">
          আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হবে।
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ForgotPasswordForm />
        <div className="border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
          মনে পড়ে গেছে?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            লগইন করুন
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
