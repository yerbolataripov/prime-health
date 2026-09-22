"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="text-sm text-fg-muted mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || actions) && (
        <div className="flex items-end justify-between mb-3 gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">{title}</h2>}
            {description && <p className="text-xs text-fg-subtle mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
