import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "পেমেন্ট ব্যর্থ" };

export default async function PayFailPage({ searchParams }: { searchParams: Promise<{ code?: string; tran?: string }> }) {
  const { code, tran } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="size-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold">পেমেন্ট সম্পন্ন হয়নি</h1>
      <p className="max-w-md text-muted-foreground">
        কিছু একটা ভুল হয়েছে। আপনার ব্যাংক / MFS অ্যাকাউন্ট থেকে টাকা কাটা হয়নি।
      </p>
      {code || tran ? (
        <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs">
          {code ? <>কোড: {code}</> : null}
          {tran ? <> · TXN: {tran}</> : null}
        </p>
      ) : null}
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        আবার চেষ্টা করুন
      </Link>
    </div>
  );
}
