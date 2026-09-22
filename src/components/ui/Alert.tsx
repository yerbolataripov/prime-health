"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, ShieldAlert, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

type Level = "info" | "warn" | "danger" | "success";

const levels: Record<
  Level,
  { box: string; icon: ReactNode }
> = {
  info: {
    box: "bg-accent-blue/10 border-accent-blue/30 text-fg",
    icon: <Info className="h-4 w-4 text-accent-blue" />,
  },
  warn: {
    box: "bg-accent-yellow/10 border-accent-yellow/30 text-fg",
    icon: <AlertTriangle className="h-4 w-4 text-accent-yellow" />,
  },
  danger: {
    box: "bg-accent-red/10 border-accent-red/40 text-fg",
    icon: <ShieldAlert className="h-4 w-4 text-accent-red" />,
  },
  success: {
    box: "bg-accent-green/10 border-accent-green/30 text-fg",
    icon: <CheckCircle className="h-4 w-4 text-accent-green" />,
  },
};

export function Alert({
  level = "info",
  title,
  children,
  className,
}: {
  level?: Level;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const cfg = levels[level];
  return (
    <div className={cn("rounded-xl border p-3 flex gap-3", cfg.box, className)}>
      <div className="mt-0.5">{cfg.icon}</div>
      <div className="flex-1">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {children && <div className="text-xs text-fg-muted leading-relaxed mt-0.5">{children}</div>}
      </div>
    </div>
  );
}
