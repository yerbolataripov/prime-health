"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { ReactNode } from "react";

export interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  delta?: { value: number; positive?: "good" | "bad"; suffix?: string };
  status?: "ok" | "warn" | "danger" | "neutral" | "info";
  icon?: ReactNode;
  className?: string;
}

const statusBorder: Record<NonNullable<StatProps["status"]>, string> = {
  ok: "border-accent-green/30",
  warn: "border-accent-yellow/40",
  danger: "border-accent-red/40",
  neutral: "border-border",
  info: "border-accent-blue/30",
};

const statusBg: Record<NonNullable<StatProps["status"]>, string> = {
  ok: "bg-accent-green/10 text-accent-green",
  warn: "bg-accent-yellow/10 text-accent-yellow",
  danger: "bg-accent-red/10 text-accent-red",
  neutral: "bg-bg-subtle text-fg-muted",
  info: "bg-accent-blue/10 text-accent-blue",
};

export function Stat({ label, value, unit, hint, delta, status = "neutral", icon, className }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-bg-card p-4 flex flex-col gap-2",
        statusBorder[status],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-fg-muted">{label}</span>
        {icon && (
          <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center", statusBg[status])}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-fg">{value}</span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>{hint}</span>
        {delta && <DeltaTag delta={delta} />}
      </div>
    </div>
  );
}

function DeltaTag({ delta }: { delta: NonNullable<StatProps["delta"]> }) {
  const isUp = delta.value > 0;
  const isDown = delta.value < 0;
  const isFlat = delta.value === 0;
  const directionGood =
    delta.positive === "bad"
      ? isDown
      : delta.positive === "good"
      ? isUp
      : false;
  const tone = isFlat
    ? "text-fg-muted bg-bg-subtle"
    : directionGood
    ? "text-accent-green bg-accent-green/10"
    : "text-accent-red bg-accent-red/10";
  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px]", tone)}>
      <Icon className="h-3 w-3" />
      {Math.abs(delta.value).toFixed(1)}
      {delta.suffix}
    </span>
  );
}
