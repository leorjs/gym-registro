import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "green" | "lime" | "amber" | "red";

const tones: Record<BadgeTone, string> = {
  default: "border-transparent bg-[var(--surface-2)] text-[var(--label-2)]",
  green: "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]",
  lime: "border-transparent bg-[var(--accent)] text-black",
  amber: "border-transparent bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-[var(--orange)]",
  red: "border-transparent bg-[color-mix(in_srgb,var(--red)_16%,transparent)] text-[var(--red)]",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
