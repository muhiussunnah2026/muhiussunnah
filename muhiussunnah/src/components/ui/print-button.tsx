"use client";

import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  variant?: "default" | "outline";
  className?: string;
};

export function PrintButton({ label, variant = "default", className }: Props) {
  const t = useTranslations("printBtn");
  const displayLabel = label ?? t("default_label");
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      onClick={() => window.print()}
      className={className ?? (variant === "default" ? "bg-gradient-primary text-white" : "")}
    >
      <Printer className="me-1 size-3.5" /> {displayLabel}
    </Button>
  );
}
