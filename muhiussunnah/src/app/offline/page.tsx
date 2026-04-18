import { WifiOff } from "lucide-react";

export const metadata = { title: "অফলাইন" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <WifiOff className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold">ইন্টারনেট নেই</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        আপনি এখন অফলাইনে। ইন্টারনেট ফিরে এলে পেইজ আপডেট হবে। আগে দেখা পেইজ cache থেকে দেখা যাবে।
      </p>
    </div>
  );
}
