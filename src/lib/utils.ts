import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    ...opts,
  }).format(date);
}

export function fmtDateLong(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function pad2(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

export function localISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO(): string {
  return localISO(new Date());
}

export function isoToDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export function addDaysISO(iso: string, days: number): string {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + days);
  return localISO(d);
}

export function diffDaysISO(a: string, b: string): number {
  const ms = isoToDate(a).getTime() - isoToDate(b).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return (part / whole) * 100;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function bmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiLabel(b: number): { label: string; color: string } {
  if (b < 18.5) return { label: "Недостаточный", color: "text-accent-blue" };
  if (b < 25) return { label: "Норма", color: "text-accent-green" };
  if (b < 30) return { label: "Избыточный", color: "text-accent-yellow" };
  if (b < 35) return { label: "Ожирение I", color: "text-accent-orange" };
  if (b < 40) return { label: "Ожирение II", color: "text-accent-orange" };
  return { label: "Ожирение III", color: "text-accent-red" };
}

export function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

export function groupBy<T, K extends string | number>(
  arr: T[],
  fn: (t: T) => K
): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = fn(item);
      (acc[k] ||= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

export function trend(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const first = avg(values.slice(0, Math.max(1, Math.floor(values.length / 2))));
  const last = avg(values.slice(-Math.max(1, Math.floor(values.length / 2))));
  const diff = last - first;
  if (Math.abs(diff) < 0.001) return "flat";
  return diff > 0 ? "up" : "down";
}

export function safeParseFloat(v: string | number | undefined | null): number | null {
  if (v === "" || v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

export function fmtNum(n: number | null | undefined, digits = 0): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function signed(n: number, digits = 1): string {
  const s = n.toLocaleString("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  return n > 0 ? `+${s}` : s;
}
