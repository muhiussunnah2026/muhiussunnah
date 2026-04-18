import Link from "next/link";
import { Ban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "পেমেন্ট বাতিল" };

export default function PayCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Ban className="size-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold">পেমেন্ট বাতিল করেছেন</h1>
      <p className="max-w-md text-muted-foreground">
        আপনার কোন টাকা কাটা হয়নি। চাইলে আবার চেষ্টা করুন।
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        ফিরে যান
      </Link>
    </div>
  );
}
