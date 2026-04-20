"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishExamAction, unpublishExamAction } from "@/server/actions/exams";

type Props = { schoolSlug: string; examId: string; published: boolean };

export function PublishButton({ schoolSlug, examId, published }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (published) {
      if (!confirm("ফলাফল unpublish করবেন? অভিভাবকরা আর দেখতে পাবে না।")) return;
      startTransition(async () => {
        const res = await unpublishExamAction(schoolSlug, examId);
        if (res.ok) toast.success(res.message ?? "Unpublished");
        else toast.error(res.error);
      });
    } else {
      if (!confirm("ফলাফল প্রকাশ করবেন? প্রতিটি ছাত্রের জন্য report card তৈরি হবে ও অভিভাবকরা দেখতে পাবে।")) return;
      startTransition(async () => {
        const res = await publishExamAction(schoolSlug, examId);
        if (res.ok) toast.success(res.message ?? "প্রকাশিত");
        else toast.error(res.error);
      });
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className={published ? "" : "bg-gradient-primary text-white"}
      variant={published ? "outline" : "default"}
    >
      {pending ? (
        "..."
      ) : published ? (
        <><EyeOff className="me-1 size-3.5" /> Unpublish</>
      ) : (
        <><CheckCircle2 className="me-1 size-3.5" /> ফলাফল প্রকাশ করুন</>
      )}
    </Button>
  );
}
