"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-bg hover:opacity-90",
  secondary: "bg-bg-subtle text-fg hover:bg-border",
  ghost: "bg-transparent text-fg hover:bg-bg-subtle",
  outline: "border border-border bg-bg-card text-fg hover:bg-bg-subtle",
  danger: "bg-accent-red text-white hover:bg-accent-red/90",
  success: "bg-accent-green text-white hover:bg-accent-green/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-12 px-6 text-[15px] rounded-full",
  icon: "h-9 w-9 rounded-full flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "secondary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
