"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Tone = "default" | "green" | "orange" | "red" | "blue" | "yellow" | "purple";

const tones: Record<Tone, string> = {
  default: "bg-bg-subtle text-fg-muted border-border",
  green: "bg-accent-green/10 text-accent-green border-accent-green/30",
  orange: "bg-accent-orange/10 text-accent-orange border-accent-orange/30",
  red: "bg-accent-red/10 text-accent-red border-accent-red/30",
  blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
  yellow: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30",
  purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/30",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
