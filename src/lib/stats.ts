import type { DailyEntry, Measurement, Profile, TrainingKind, TrainingSession } from "./types";
import { addDaysISO, avg, diffDaysISO, isoToDate, localISO, round, todayISO } from "./utils";

export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** 0 = Пн … 6 = Вс */
export function weekdayIdx(iso: string): number {
  return (isoToDate(iso).getDay() + 6) % 7;
}

export function weekStartISO(iso: string): string {
  return addDaysISO(iso, -weekdayIdx(iso));
}

export function weekDates(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i));
}

const num = (v: number | undefined | null): v is number => typeof v === "number" && !isNaN(v);

export interface WeekStats {
  index: number; // номер недели с начала программы, начиная с 1
  start: string;
  end: string;
  daysFilled: number;
  weightAvg: number | null;
  weightMin: number | null;
  weightMax: number | null;
  weightDelta: number | null; // vs предыдущая неделя (средний вес)
  stepsAvg: number | null;
  stepsTotal: number;
  stepsDaysHit: number;
  kcalAvg: number | null;
  kcalDaysOk: number;
  proteinAvg: number | null;
  proteinDaysHit: number;
  trainings: number; // сессий
  trainingDays: number; // дней с тренировкой
}

export function weekStats(
  entries: DailyEntry[],
  profile: Profile,
  monday: string,
  index: number,
  prevWeightAvg: number | null
): WeekStats {
  const dates = new Set(weekDates(monday));
  const rows = entries.filter((e) => dates.has(e.date));
  const weights = rows.map((r) => r.weightKg).filter(num);
  const steps = rows.map((r) => r.steps).filter(num);
  const kcal = rows.map((r) => r.calories).filter(num);
  const prot = rows.map((r) => r.protein).filter(num);
  const weightAvg = weights.length ? round(avg(weights), 1) : null;
  return {
    index,
    start: monday,
    end: addDaysISO(monday, 6),
    daysFilled: rows.length,
    weightAvg,
    weightMin: weights.length ? Math.min(...weights) : null,
    weightMax: weights.length ? Math.max(...weights) : null,
    weightDelta: weightAvg != null && prevWeightAvg != null ? round(weightAvg - prevWeightAvg, 1) : null,
    stepsAvg: steps.length ? Math.round(avg(steps)) : null,
    stepsTotal: steps.reduce((a, b) => a + b, 0),
    stepsDaysHit: steps.filter((s) => s >= profile.stepsTarget).length,
    kcalAvg: kcal.length ? Math.round(avg(kcal)) : null,
    kcalDaysOk: kcal.filter((k) => k <= profile.caloriesTarget * 1.05).length,
    proteinAvg: prot.length ? Math.round(avg(prot)) : null,
    proteinDaysHit: prot.filter((p) => p >= profile.proteinTarget * 0.95).length,
    trainings: rows.reduce((a, r) => a + sessionsOf(r).length, 0),
    trainingDays: rows.filter((r) => trainedOn(r)).length,
  };
}

export function sessionsOf(e: DailyEntry | undefined): TrainingSession[] {
  return e?.trainings ?? [];
}
export function trainedOn(e: DailyEntry | undefined): boolean {
  return sessionsOf(e).length > 0;
}

/** Дата, от которой считаем недели: старт программы, а до старта — первая запись */
export function programStart(entries: DailyEntry[], profile: Profile): string {
  if (profile.started) return profile.startDate;
  const first = entries.length ? entries[entries.length - 1].date : todayISO();
  return first < todayISO() ? first : todayISO();
}

/** Все недели от старта программы до текущей (включительно), от старой к новой */
export function allWeeks(entries: DailyEntry[], profile: Profile): WeekStats[] {
  const first = weekStartISO(programStart(entries, profile));
  const last = weekStartISO(todayISO());
  const out: WeekStats[] = [];
  let prev: number | null = null;
  let monday = first;
  let i = 1;
  while (monday <= last) {
    const w = weekStats(entries, profile, monday, i, prev);
    if (w.weightAvg != null) prev = w.weightAvg;
    out.push(w);
    monday = addDaysISO(monday, 7);
    i++;
  }
  return out;
}

/** Последний известный вес (или стартовый) */
export function currentWeight(entries: DailyEntry[], profile: Profile): number {
  const e = entries.find((d) => num(d.weightKg));
  return e?.weightKg ?? profile.startWeightKg;
}

/** Средний вес за последние 7 дней с записями (сглаживает колебания воды) */
export function weight7dAvg(entries: DailyEntry[], profile: Profile, upTo = todayISO()): number {
  const from = addDaysISO(upTo, -6);
  const w = entries.filter((d) => d.date >= from && d.date <= upTo && num(d.weightKg)).map((d) => d.weightKg as number);
  if (!w.length) return currentWeight(entries, profile);
  return round(avg(w), 1);
}

export interface WeightPoint {
  date: string;
  w: number | null;
  avg7: number | null;
}

/** Ряд для графика: вес по дням + скользящее среднее 7 дней */
export function weightSeries(entries: DailyEntry[], fromISO: string, toISO = todayISO()): WeightPoint[] {
  const byDate = new Map(entries.filter((e) => num(e.weightKg)).map((e) => [e.date, e.weightKg as number]));
  const out: WeightPoint[] = [];
  const window: number[] = [];
  const windowDates: string[] = [];
  for (let d = fromISO; d <= toISO; d = addDaysISO(d, 1)) {
    const w = byDate.get(d) ?? null;
    if (w != null) {
      window.push(w);
      windowDates.push(d);
    }
    // держим только последние 7 календарных дней
    while (windowDates.length && diffDaysISO(d, windowDates[0]) > 6) {
      window.shift();
      windowDates.shift();
    }
    out.push({ date: d, w, avg7: window.length ? round(avg(window), 1) : null });
  }
  return out;
}

/** Скорость похудения, кг/неделю, по линейной регрессии за последние N дней (отрицательное = снижение) */
export function lossRatePerWeek(entries: DailyEntry[], days = 28): number | null {
  const from = addDaysISO(todayISO(), -days);
  const pts = entries
    .filter((e) => e.date >= from && num(e.weightKg))
    .map((e) => ({ x: diffDaysISO(e.date, from), y: e.weightKg as number }));
  if (pts.length < 4) return null;
  const n = pts.length;
  const mx = avg(pts.map((p) => p.x));
  const my = avg(pts.map((p) => p.y));
  let sxy = 0;
  let sxx = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) * (p.x - mx);
  }
  if (sxx === 0) return null;
  const slopePerDay = sxy / sxx;
  return round(slopePerDay * 7, 2);
}

export interface Forecast {
  weeks: number;
  date: string;
}

export function forecastToGoal(current: number, goal: number, ratePerWeek: number | null): Forecast | null {
  if (ratePerWeek == null || ratePerWeek >= -0.05) return null;
  const weeks = Math.ceil((current - goal) / -ratePerWeek);
  if (!isFinite(weeks) || weeks <= 0) return null;
  return { weeks, date: addDaysISO(todayISO(), weeks * 7) };
}

/** Здоровый темп: 0.5–1 % массы тела в неделю */
export function healthyRateRange(weightKg: number): { min: number; max: number } {
  return { min: round(weightKg * 0.005, 1), max: round(weightKg * 0.01, 1) };
}

export interface Milestone {
  kg: number;
  reached: boolean;
  reachedAt?: string;
}

/** Промежуточные цели каждые 5 кг от старта к цели */
export function milestones(entries: DailyEntry[], profile: Profile): Milestone[] {
  const out: Milestone[] = [];
  const first = Math.floor((profile.startWeightKg - 0.001) / 5) * 5;
  const asc = [...entries].filter((e) => num(e.weightKg)).sort((a, b) => (a.date < b.date ? -1 : 1));
  for (let kg = first; kg >= profile.goalWeightKg; kg -= 5) {
    const hit = asc.find((e) => (e.weightKg as number) <= kg);
    out.push({ kg, reached: !!hit, reachedAt: hit?.date });
  }
  if (out[out.length - 1]?.kg !== profile.goalWeightKg) {
    const hit = asc.find((e) => (e.weightKg as number) <= profile.goalWeightKg);
    out.push({ kg: profile.goalWeightKg, reached: !!hit, reachedAt: hit?.date });
  }
  return out;
}

export function progressPct(current: number, profile: Profile): number {
  const total = profile.startWeightKg - profile.goalWeightKg;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, ((profile.startWeightKg - current) / total) * 100));
}

export function daysSinceLastMeasurement(measurements: Measurement[]): number | null {
  const last = measurements[0];
  if (!last) return null;
  return diffDaysISO(todayISO(), last.date);
}

// === Ежедневный трекер (галочки) ===

export type CheckStatus = "ok" | "miss" | "none" | "na";

export interface DayChecks {
  weight: CheckStatus;
  steps: CheckStatus;
  kcal: CheckStatus;
  protein: CheckStatus;
  training: CheckStatus;
  score: number; // выполнено
  max: number; // из скольки
}

export const CHECK_KEYS: { key: keyof Omit<DayChecks, "score" | "max">; label: string; short: string }[] = [
  { key: "weight", label: "Взвесился", short: "Вес" },
  { key: "steps", label: "Шаги", short: "Шаги" },
  { key: "kcal", label: "Калории", short: "Ккал" },
  { key: "protein", label: "Белок", short: "Белок" },
  { key: "training", label: "Тренировка", short: "Трен." },
];

export function dayChecks(e: DailyEntry | undefined, profile: Profile, date: string, from?: string): DayChecks {
  const future = date > todayISO();
  const planned = profile.trainingDays.includes(weekdayIdx(date));
  const c: DayChecks = { weight: "none", steps: "none", kcal: "none", protein: "none", training: planned ? "none" : "na", score: 0, max: 0 };
  // будущее и дни до старта не считаем
  if (future || (from && date < from && !e)) return c;
  if (e) {
    if (num(e.weightKg)) c.weight = "ok";
    if (num(e.steps)) c.steps = e.steps >= profile.stepsTarget ? "ok" : "miss";
    if (num(e.calories)) c.kcal = e.calories <= profile.caloriesTarget * 1.05 ? "ok" : "miss";
    if (num(e.protein)) c.protein = e.protein >= profile.proteinTarget * 0.95 ? "ok" : "miss";
    if (trainedOn(e)) c.training = "ok";
  }
  // прошедший день без записи — пропуск
  const past = date < todayISO();
  if (past) {
    if (c.weight === "none") c.weight = "miss";
    if (c.steps === "none") c.steps = "miss";
    if (c.kcal === "none") c.kcal = "miss";
    if (c.protein === "none") c.protein = "miss";
    if (c.training === "none") c.training = "miss";
  }
  const vals = [c.weight, c.steps, c.kcal, c.protein, c.training];
  c.max = vals.filter((v) => v !== "na").length;
  c.score = vals.filter((v) => v === "ok").length;
  return c;
}

// === Статистика за всё время ===

export interface KindStat {
  kind: TrainingKind;
  count: number;
  minutes: number;
  km: number;
}

export interface AllTimeStats {
  daysTracked: number;
  streak: number; // подряд дней с записью, считая от сегодня/вчера
  stepsTotal: number;
  stepsBest: { date: string; steps: number } | null;
  stepsMonth: number;
  stepsMonthAvg: number | null;
  stepsMonthDays: number;
  sessionsTotal: number;
  sessionsMonth: number;
  minutesTotal: number;
  kmTotal: number;
  byKind: KindStat[];
}

export function allTimeStats(entries: DailyEntry[], monthISO = todayISO().slice(0, 7)): AllTimeStats {
  let stepsTotal = 0;
  let stepsBest: AllTimeStats["stepsBest"] = null;
  let stepsMonth = 0;
  let stepsMonthDays = 0;
  let sessionsTotal = 0;
  let sessionsMonth = 0;
  let minutesTotal = 0;
  let kmTotal = 0;
  const byKind = new Map<TrainingKind, KindStat>();
  for (const e of entries) {
    const inMonth = e.date.startsWith(monthISO);
    if (num(e.steps)) {
      stepsTotal += e.steps;
      if (!stepsBest || e.steps > stepsBest.steps) stepsBest = { date: e.date, steps: e.steps };
      if (inMonth) {
        stepsMonth += e.steps;
        stepsMonthDays++;
      }
    }
    for (const s of sessionsOf(e)) {
      sessionsTotal++;
      if (inMonth) sessionsMonth++;
      minutesTotal += s.durationMin ?? 0;
      kmTotal += s.distanceKm ?? 0;
      const k = byKind.get(s.kind) ?? { kind: s.kind, count: 0, minutes: 0, km: 0 };
      k.count++;
      k.minutes += s.durationMin ?? 0;
      k.km += s.distanceKm ?? 0;
      byKind.set(s.kind, k);
    }
  }
  // серия
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  let d = todayISO();
  if (!dates.has(d)) d = addDaysISO(d, -1);
  while (dates.has(d)) {
    streak++;
    d = addDaysISO(d, -1);
  }
  return {
    daysTracked: entries.length,
    streak,
    stepsTotal,
    stepsBest,
    stepsMonth,
    stepsMonthAvg: stepsMonthDays ? Math.round(stepsMonth / stepsMonthDays) : null,
    stepsMonthDays,
    sessionsTotal,
    sessionsMonth,
    minutesTotal,
    kmTotal: round(kmTotal, 1),
    byKind: Array.from(byKind.values()).sort((a, b) => b.count - a.count),
  };
}

/** Шаги по месяцам (от старых к новым) */
export function stepsByMonth(entries: DailyEntry[]): { month: string; steps: number; days: number; avg: number }[] {
  const m = new Map<string, { steps: number; days: number }>();
  for (const e of entries) {
    if (!num(e.steps)) continue;
    const k = e.date.slice(0, 7);
    const cur = m.get(k) ?? { steps: 0, days: 0 };
    cur.steps += e.steps;
    cur.days++;
    m.set(k, cur);
  }
  return Array.from(m.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, v]) => ({ month, steps: v.steps, days: v.days, avg: Math.round(v.steps / v.days) }));
}

/** Все даты календарного месяца, дополненные до полных недель (Пн–Вс) */
export function monthGrid(monthISO: string): string[] {
  const first = monthISO + "-01";
  const start = weekStartISO(first);
  const [y, mo] = monthISO.split("-").map(Number);
  const lastDay = new Date(y, mo, 0).getDate();
  const last = `${monthISO}-${String(lastDay).padStart(2, "0")}`;
  const end = addDaysISO(weekStartISO(last), 6);
  const out: string[] = [];
  for (let d = start; d <= end; d = addDaysISO(d, 1)) out.push(d);
  return out;
}

export function monthLabel(monthISO: string): string {
  const [y, m] = monthISO.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

export function addMonths(monthISO: string, n: number): string {
  const [y, m] = monthISO.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function localTodayLabel(): string {
  const d = new Date();
  const wd = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"][d.getDay()];
  const date = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(d);
  return `${wd}, ${date}`;
}

export function fmtISO(d: Date): string {
  return localISO(d);
}

export interface DayFeedback {
  good: string[];
  improve: string[];
}

export function dayFeedback(e: DailyEntry | undefined, profile: Profile): DayFeedback {
  const good: string[] = [];
  const improve: string[] = [];
  if (!e) return { good, improve };
  if (num(e.protein)) {
    if (e.protein >= profile.proteinTarget * 0.95) good.push(`Белок ${e.protein} г — цель выполнена`);
    else improve.push(`Белок ${e.protein} из ${profile.proteinTarget} г`);
  }
  if (num(e.calories)) {
    if (e.calories <= profile.caloriesTarget * 1.05) good.push(`Калории ${e.calories} — в коридоре`);
    else improve.push(`Калории ${e.calories} — выше цели ${profile.caloriesTarget}`);
  }
  if (num(e.steps)) {
    if (e.steps >= profile.stepsTarget) good.push(`Шаги ${e.steps.toLocaleString("ru-RU")} — цель выполнена`);
    else improve.push(`Шаги ${e.steps.toLocaleString("ru-RU")} из ${profile.stepsTarget.toLocaleString("ru-RU")}`);
  }
  const n = sessionsOf(e).length;
  if (n === 1) good.push("Тренировка засчитана");
  else if (n > 1) good.push(`${n} тренировки за день`);
  return { good, improve };
}
