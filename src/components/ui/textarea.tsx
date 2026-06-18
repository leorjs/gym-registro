import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-[#d8ded5] bg-white px-3 py-3 text-sm text-[#151917] shadow-sm outline-none transition placeholder:text-[#8b948f] focus:border-[#1d6b57] focus:ring-4 focus:ring-[#1d6b57]/10",
        className,
      )}
      {...props}
    />
  );
}
