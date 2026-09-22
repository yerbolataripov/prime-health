"use client";

import { cn, safeParseFloat } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Числовое поле с автосохранением. Держит свой текст, чтобы «12.» не превращалось в «12» при вводе.
 */
export function NumField({
  label,
  unit,
  value,
  onChange,
  target,
  step = "1",
  placeholder,
  lowerIsBetter,
  className,
  big,
}: {
  label: string;
  unit?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  target?: number;
  step?: string;
  placeholder?: string;
  lowerIsBetter?: boolean;
  className?: string;
  big?: boolean;
}) {
  const [text, setText] = useState(value != null ? String(value) : "");

  useEffect(() => {
    const parsed = safeParseFloat(text);
    if (parsed !== (value ?? null)) setText(value != null ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pct = target && value != null ? Math.min(100, (value / target) * 100) : null;
  const hit = target && value != null ? (lowerIsBetter ? value <= target * 1.05 : value >= target * 0.95) : null;

  return (
    <label className={cn("block rounded-xl border border-border bg-bg-subtle/60 px-3 py-2.5 focus-within:border-accent-blue transition", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</span>
        {target != null && (
          <span className={cn("text-[11px]", hit === true ? "text-accent-green" : hit === false ? "text-fg-subtle" : "text-fg-subtle")}>
            цель {target.toLocaleString("ru-RU")}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder={placeholder ?? "—"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(safeParseFloat(e.target.value) ?? undefined);
          }}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          className={cn(
            "w-full bg-transparent outline-none font-semibold tracking-tight text-fg placeholder:text-fg-subtle/60",
            big ? "text-2xl" : "text-xl"
          )}
        />
        {unit && <span className="text-xs text-fg-muted shrink-0">{unit}</span>}
      </div>
      {pct != null && (
        <div className="h-1 mt-2 rounded-full bg-border overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", hit ? "bg-accent-green" : lowerIsBetter && (value ?? 0) > (target ?? 0) ? "bg-accent-red" : "bg-accent-orange")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </label>
  );
}
