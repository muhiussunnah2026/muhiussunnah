import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { supabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { TwoFactorSetup } from "./setup-client";

export default async function TwoFactorPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT", "CLASS_TEACHER", "SUBJECT_TEACHER"]);
  const schoolSlug = membership.school_slug;
  const session = await getSession(schoolSlug);
  if (!session) return null;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("user_totp_secrets")
    .select("verified_at")
    .eq("user_id", session.userId)
    .maybeSingle();

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/settings`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> সেটিংস
          </Link>
        }
        title="দুই-স্তর প্রমাণীকরণ (2FA)"
        subtitle="আপনার অ্যাকাউন্টে বাড়তি সুরক্ষা — প্রতিবার লগইনে Authenticator app থেকে ৬-ডিজিট কোড দিতে হবে।"
      />

      <div className="max-w-2xl">
        <TwoFactorSetup
          existing={existing ? { verified: !!existing.verified_at } : null}
        schoolSlug={schoolSlug} />
      </div>
    </>
  );
}
