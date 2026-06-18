import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:pointer-events-none disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6b57]",
  {
    variants: {
      variant: {
        primary: "bg-[#151917] text-white hover:bg-[#222a26]",
        accent: "bg-[#b9ff45] text-[#151917] hover:bg-[#a9ef36]",
        secondary: "border border-[#d8ded5] bg-white text-[#151917] hover:bg-[#f4f6f0]",
        ghost: "text-[#151917] hover:bg-[#e8ebe3]",
        danger: "bg-[#f7dfdc] text-[#8f251f] hover:bg-[#f1cbc6]",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3",
        lg: "h-13 px-5 text-base",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
