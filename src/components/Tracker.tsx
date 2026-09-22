"use client";

import { CHECK_KEYS, WEEKDAYS_SHORT, dayChecks, monthGrid, programStart, weekDates, type CheckStatus } from "@/lib/stats";
import type { DailyEntry, Profile } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";
import { Check, Minus, X } from "lucide-react";

function Cell({ s, small }: { s: CheckStatus; small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-6 w-6";
  const icon = small ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  if (s === "ok") return <span className={cn(size, "rounded-md bg-accent-green/20 text-accent-green flex items-center justify-center")}><Check className={icon} strokeWidth={3} /></span>;
  if (s === "miss") return <span className={cn(size, "rounded-md bg-accent-red/10 text-accent-red/80 flex items-center justify-center")}><X className={icon} strokeWidth={2.5} /></span>;
  if (s === "na") return <span className={cn(size, "rounded-md text-fg-subtle/40 flex items-center justify-center")}><Minus className={icon} /></span>;
  return <span className={cn(size, "rounded-md bg-bg-subtle flex items-center justify-center")}><span className="h-1 w-1 rounded-full bg-fg-subtle/50" /></span>;
}

/** Трекер недели: строки — цели, столбцы — дни */
export function WeekTracker({ entries, profile, monday, selected, onSelect }: { entries: DailyEntry[]; profile: Profile; monday: string; selected?: string; onSelect?: (d: string) => void }) {
  const today = todayISO();
  const dates = weekDates(monday);
  const from = programStart(entries, profile);
  const checks = dates.map((d) => dayChecks(entries.find((e) => e.date === d), profile, d, from));
  const weekScore = checks.reduce((a, c) => a + c.score, 0);
  const weekMax = checks.reduce((a, c) => a + c.max, 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-normal text-fg-subtle pb-1.5 w-[84px]"></th>
            {dates.map((d, i) => (
              <th key={d} className="pb-1.5 font-normal">
                <button
                  onClick={() => onSelect?.(d)}
                  disabled={d > today}
                  className={cn("flex flex-col items-center mx-auto rounded-md px-1.5 py-0.5 disabled:opacity-30", d === selected ? "text-accent-orange" : d === today ? "text-fg" : "text-fg-muted")}
                >
                  <span className="text-[10px] uppercase">{WEEKDAYS_SHORT[i]}</span>
                  <span className="font-semibold">{parseInt(d.slice(8), 10)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CHECK_KEYS.map((k) => (
            <tr key={k.key}>
              <td className="py-0.5 text-fg-muted">{k.label}</td>
              {checks.map((c, i) => (
                <td key={i} className="py-0.5"><div className="flex justify-center"><Cell s={c[k.key]} /></div></td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-border">
            <td className="pt-1.5 text-fg-muted">Итого</td>
            {checks.map((c, i) => (
              <td key={i} className="pt-1.5 text-center">
                <span className={cn("font-semibold", c.max === 0 ? "text-fg-subtle/40" : c.score === c.max ? "text-accent-green" : c.score >= c.max - 1 ? "text-fg" : "text-fg-muted")}>
                  {c.max ? `${c.score}/${c.max}` : "·"}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="text-[11px] text-fg-subtle mt-2">
        За неделю выполнено {weekScore} из {weekMax}{weekMax ? ` (${Math.round((weekScore / weekMax) * 100)}%)` : ""}. Тренировка в незапланированный день считается бонусом и не штрафуется.
      </div>
    </div>
  );
}

/** Календарь месяца: в каждой клетке — счёт дня и пять точек по целям */
export function MonthTracker({ entries, profile, month }: { entries: DailyEntry[]; profile: Profile; month: string }) {
  const today = todayISO();
  const dates = monthGrid(month);
  const from = programStart(entries, profile);
  const rows: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) rows.push(dates.slice(i, i + 7));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((w) => <div key={w} className="text-center text-[10px] uppercase text-fg-subtle">{w}</div>)}
      </div>
      <div className="space-y-1">
        {rows.map((r, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-1">
            {r.map((d) => {
              const inMonth = d.startsWith(month);
              const c = dayChecks(entries.find((e) => e.date === d), profile, d, from);
              const future = d > today;
              const ratio = c.max ? c.score / c.max : 0;
              return (
                <div
                  key={d}
                  className={cn(
                    "rounded-lg border p-1.5 min-h-[52px] flex flex-col justify-between",
                    !inMonth && "opacity-30",
                    future || !c.max ? "border-border bg-bg-subtle/30" : ratio === 1 ? "border-accent-green/40 bg-accent-green/10" : ratio >= 0.6 ? "border-accent-yellow/30 bg-accent-yellow/5" : "border-accent-red/20 bg-accent-red/5",
                    d === today && "ring-1 ring-accent-orange/60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[11px] font-medium", d === today ? "text-accent-orange" : "text-fg-muted")}>{parseInt(d.slice(8), 10)}</span>
                    {c.max > 0 && <span className={cn("text-[10px] font-semibold", ratio === 1 ? "text-accent-green" : "text-fg-muted")}>{c.score}/{c.max}</span>}
                  </div>
                  <div className="flex gap-0.5 justify-center">
                    {CHECK_KEYS.map((k) => {
                      const s = c[k.key];
                      if (s === "na" || future) return <span key={k.key} className="h-1.5 w-1.5 rounded-full bg-transparent" />;
                      return <span key={k.key} title={k.label} className={cn("h-1.5 w-1.5 rounded-full", s === "ok" ? "bg-accent-green" : s === "miss" ? "bg-accent-red/70" : "bg-fg-subtle/40")} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-fg-subtle mt-2">
        {CHECK_KEYS.map((k, i) => <span key={k.key}>{i + 1}-я точка — {k.label.toLowerCase()}</span>)}
      </div>
    </div>
  );
}
