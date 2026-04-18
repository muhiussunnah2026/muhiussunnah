import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function FeesIndexPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  redirect(`/school/${schoolSlug}/admin/fees/invoices`);
}
