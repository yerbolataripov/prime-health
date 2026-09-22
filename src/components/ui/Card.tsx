"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-bg-card shadow-card dark:shadow-cardDark",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("flex items-start justify-between gap-3 px-5 pt-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold tracking-tight text-fg", className)}>{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-xs text-fg-muted mt-0.5">{children}</p>;
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("border-t border-border px-5 py-3 text-xs text-fg-muted", className)}>{children}</div>;
}
