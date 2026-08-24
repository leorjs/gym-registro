import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--accent)] text-black hover:brightness-95",
        accent: "bg-[var(--accent)] text-black hover:brightness-95",
        secondary: "bg-[var(--surface-2)] text-white hover:brightness-110",
        ghost: "text-[var(--accent)] hover:bg-[var(--accent-soft)]",
        danger: "bg-[color-mix(in_srgb,var(--red)_16%,transparent)] text-[var(--red)]",
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
