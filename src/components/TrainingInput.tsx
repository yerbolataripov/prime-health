"use client";

import { uid } from "@/lib/store";
import { TRAINING_KINDS, TRAINING_KIND_ORDER } from "@/lib/templates";
import type { TrainingKind, TrainingSession } from "@/lib/types";
import { cn, safeParseFloat } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * Несколько тренировок за день. Чип включает/выключает вид; параметры (минуты, км, заметка) — по желанию.
 */
export function TrainingInput({
  sessions,
  onChange,
  planned,
}: {
  sessions: TrainingSession[];
  onChange: (next: TrainingSession[]) => void;
  planned?: boolean;
}) {
  const has = (k: TrainingKind) => sessions.some((s) => s.kind === k);
  function toggle(k: TrainingKind) {
    if (has(k)) onChange(sessions.filter((s) => s.kind !== k));
    else onChange([...sessions, { id: uid("tr"), kind: k }]);
  }
  function patch(id: string, p: Partial<TrainingSession>) {
    onChange(sessions.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wide text-fg-muted">Тренировки</span>
        {planned && sessions.length === 0 && <span className="text-[11px] text-accent-blue">сегодня по плану</span>}
        {sessions.length > 0 && <span className="text-[11px] text-accent-green">{sessions.length} за день</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TRAINING_KIND_ORDER.map((k) => {
          const m = TRAINING_KINDS[k];
          const on = has(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg border text-xs transition",
                on ? "bg-accent-orange/15 border-accent-orange text-accent-orange font-medium" : "bg-bg-subtle border-border text-fg-muted hover:text-fg"
              )}
            >
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>

      {sessions.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {sessions.map((s) => {
            const m = TRAINING_KINDS[s.kind];
            return (
              <div key={s.id} className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle/50 px-3 py-2">
                <span className="text-sm w-[120px] shrink-0 truncate">{m.emoji} {m.label}</span>
                <Small
                  placeholder="мин"
                  value={s.durationMin}
                  onChange={(v) => patch(s.id, { durationMin: v })}
                />
                {m.distance && (
                  <Small
                    placeholder="км"
                    step="0.1"
                    value={s.distanceKm}
                    onChange={(v) => patch(s.id, { distanceKm: v })}
                  />
                )}
                <input
                  value={s.note ?? ""}
                  onChange={(e) => patch(s.id, { note: e.target.value || undefined })}
                  placeholder="заметка"
                  className="flex-1 min-w-0 bg-transparent text-xs outline-none placeholder:text-fg-subtle/70 border-b border-transparent focus:border-border"
                />
                <button type="button" onClick={() => onChange(sessions.filter((x) => x.id !== s.id))} className="text-fg-subtle hover:text-accent-red p-0.5" aria-label="Убрать">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <div className="text-[11px] text-fg-subtle">Минуты, километры и заметка — по желанию.</div>
        </div>
      )}
    </div>
  );
}

function Small({ value, onChange, placeholder, step = "1" }: { value: number | undefined; onChange: (v: number | undefined) => void; placeholder: string; step?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(safeParseFloat(e.target.value) ?? undefined)}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      className="w-[58px] shrink-0 rounded-md border border-border bg-bg-card px-2 py-1 text-xs outline-none focus:border-accent-blue placeholder:text-fg-subtle/70"
    />
  );
}
