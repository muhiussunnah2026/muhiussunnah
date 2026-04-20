import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "পেমেন্ট সফল" };

export default function PaySuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-10 text-success" />
      </div>
      <h1 className="text-3xl font-bold">পেমেন্ট সফল! 🎉</h1>
      <p className="max-w-md text-muted-foreground">
        আপনার পেমেন্ট গ্রহণ করা হয়েছে। রশিদ তৈরি হয়েছে এবং স্কুলে ইনভয়েস আপডেট হয়ে গেছে।
      </p>
      <Link href="/" className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
