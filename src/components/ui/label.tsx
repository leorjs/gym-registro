import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("grid gap-2 text-xs font-bold uppercase tracking-normal text-[#66706b]", className)}
      {...props}
    />
  );
}
