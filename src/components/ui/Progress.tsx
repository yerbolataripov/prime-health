"use client";

import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  tone = "blue",
  className,
}: {
  value: number;
  max?: number;
  tone?: "blue" | "green" | "orange" | "red" | "purple";
  className?: string;
}) {
  const pct = clamp((value / max) * 100, 0, 100);
  const color = {
    blue: "bg-accent-blue",
    green: "bg-accent-green",
    orange: "bg-accent-orange",
    red: "bg-accent-red",
    purple: "bg-accent-purple",
  }[tone];
  return (
    <div className={cn("h-2 w-full rounded-full bg-bg-subtle overflow-hidden", className)}>
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
