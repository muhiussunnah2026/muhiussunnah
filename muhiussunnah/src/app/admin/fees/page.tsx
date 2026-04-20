import { redirect } from "next/navigation";

export default async function FeesIndexPage() {
  redirect(`/admin/fees/invoices`);
}
