"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full bg-bg-card border border-border md:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden flex flex-col",
          "max-h-[90vh] md:my-0",
          widths[size]
        )}
      >
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
            <div>
              {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-fg-muted mt-0.5">{description}</p>}
            </div>
            <button onClick={onClose} className="text-fg-muted hover:text-fg p-1" aria-label="Закрыть">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
