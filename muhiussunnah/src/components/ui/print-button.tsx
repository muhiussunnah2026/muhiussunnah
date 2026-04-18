"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  variant?: "default" | "outline";
  className?: string;
};

export function PrintButton({ label = "প্রিন্ট", variant = "default", className }: Props) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      onClick={() => window.print()}
      className={className ?? (variant === "default" ? "bg-gradient-primary text-white" : "")}
    >
      <Printer className="me-1 size-3.5" /> {label}
    </Button>
  );
}
