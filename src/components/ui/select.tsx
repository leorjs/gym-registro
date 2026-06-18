import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-[#d8ded5] bg-white px-3 text-sm font-semibold text-[#151917] shadow-sm outline-none transition focus:border-[#1d6b57] focus:ring-4 focus:ring-[#1d6b57]/10",
        className,
      )}
      {...props}
    />
  );
}
