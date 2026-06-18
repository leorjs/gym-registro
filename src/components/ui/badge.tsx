import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "green" | "lime" | "amber" | "red";

const tones: Record<BadgeTone, string> = {
  default: "border-[#d8ded5] bg-white text-[#151917]",
  green: "border-[#c3dfd5] bg-[#dcefe8] text-[#124b3e]",
  lime: "border-[#d3f589] bg-[#efffcb] text-[#263d00]",
  amber: "border-[#f1d5ab] bg-[#fff1dc] text-[#8a4b08]",
  red: "border-[#efc5c0] bg-[#f7dfdc] text-[#8f251f]",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-extrabold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
