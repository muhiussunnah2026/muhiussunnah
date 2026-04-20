import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { BulkImportUploader } from "./uploader";

export default async function BulkImportPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);
  const schoolSlug = membership.school_slug;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> ছাত্র তালিকা
          </Link>
        }
        title="Excel থেকে বাল্ক import"
        subtitle="একটা ফাইলে ১০০+ ছাত্র ভর্তি করুন ৩০ সেকেন্ডে। ক্লাস/সেকশন আগেই তৈরি থাকতে হবে।"
        impact={[
          { label: "⚡ একসাথে ২,০০০ ছাত্র", tone: "accent" },
          { label: "✓ সেকশনের নাম দিয়ে ম্যাচ হবে", tone: "default" },
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
              <h2 className="mb-3 text-base font-semibold">📋 Excel format</h2>
              <p className="text-xs text-muted-foreground mb-3">
                প্রথম সারিতে column header রাখুন। সাপোর্টেড columns:
              </p>
              <ul className="text-xs font-mono space-y-1">
                <li><strong>name_bn</strong> — নাম (আবশ্যক)</li>
                <li><strong>name_en</strong> — English name</li>
                <li><strong>roll</strong> — রোল নম্বর</li>
                <li><strong>class_name</strong> — ক্লাসের নাম (name_bn)</li>
                <li><strong>section_name</strong> — সেকশন (যেমন: ক)</li>
                <li><strong>date_of_birth</strong> — YYYY-MM-DD</li>
                <li><strong>gender</strong> — male / female / other</li>
                <li><strong>guardian_phone</strong></li>
                <li><strong>address_present</strong></li>
              </ul>
              <a href="/student-import-template.csv" className="mt-4 inline-block text-xs text-primary underline">
                📥 Template ডাউনলোড
              </a>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 text-xs">
              <strong>💡 Pro Tip:</strong> প্রতিটা ক্লাস-সেকশন আগে তৈরি করে নিন। Student কোড স্বয়ংক্রিয়ভাবে তৈরি হবে।
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
