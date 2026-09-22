"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChartCard, ChartTooltipContent } from "@/components/ChartContainer";
import { NumField } from "@/components/NumField";
import { TrainingInput } from "@/components/TrainingInput";
import { WeekTracker } from "@/components/Tracker";
import { useApp } from "@/lib/store";
import {
  WEEKDAYS_SHORT,
  allWeeks,
  dayFeedback,
  daysSinceLastMeasurement,
  localTodayLabel,
  milestones,
  progressPct,
  weekDates,
  weekStartISO,
  weight7dAvg,
  weightSeries,
  weekdayIdx,
} from "@/lib/stats";
import { totalsForRation } from "@/lib/mealPlanner";
import { addDaysISO, cn, fmtDate, fmtNum, round, signed, todayISO } from "@/lib/utils";
import { Check, ChefHat, ChevronLeft, ChevronRight, Flag, Ruler } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

export default function TodayPage() {
  const profile = useApp((s) => s.profile);
  const entries = useApp((s) => s.dailyEntries);
  const measurements = useApp((s) => s.measurements);
  const rations = useApp((s) => s.rations);
  const patchDaily = useApp((s) => s.patchDaily);
  const startProgram = useApp((s) => s.startProgram);

  const today = todayISO();
  const [date, setDate] = useState(today);
  const [weekMonday, setWeekMonday] = useState(weekStartISO(today));
  const entry = entries.find((d) => d.date === date);
  const yesterday = entries.find((d) => d.date < date);

  const patch = (p: Parameters<typeof patchDaily>[1]) => patchDaily(date, p);

  const started = profile.started;
  const current = weight7dAvg(entries, profile);
  const lastWeight = entries.find((d) => d.weightKg != null)?.weightKg ?? profile.startWeightKg;
  const lost = round(profile.startWeightKg - lastWeight, 1);
  const left = round(lastWeight - profile.goalWeightKg, 1);
  const pct = progressPct(lastWeight, profile);
  const ms = milestones(entries, profile);
  const nextMs = ms.find((m) => !m.reached);

  const weeks = useMemo(() => allWeeks(entries, profile), [entries, profile]);
  const thisWeek = weeks[weeks.length - 1];
  const filledDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  const series = useMemo(
    () => weightSeries(entries, addDaysISO(today, -29), today).map((p) => ({ ...p, label: fmtDate(p.date) })),
    [entries, today]
  );
  const hasWeights = series.some((p) => p.w != null);

  const fb = dayFeedback(entry, profile);
  const sinceMeasure = daysSinceLastMeasurement(measurements);
  const measureDue = sinceMeasure == null || sinceMeasure >= 7;
  const ration = rations.find((r) => r.date === date);
  const rationTotals = ration ? totalsForRation(ration) : null;
  const isTrainingDayPlanned = profile.trainingDays.includes(weekdayIdx(date));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-fg-subtle">{localTodayLabel()}</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-0.5">Привет, {profile.name}</h1>
        </div>
        {started && (
          <div className="text-right">
            <div className="text-xs text-fg-muted">Неделя {thisWeek?.index ?? 1}</div>
            <div className="text-xs text-fg-subtle">с {fmtDate(profile.startDate)}</div>
          </div>
        )}
      </div>

      {/* Старт отсчёта или прогресс к цели */}
      {!started ? (
        <Card className="border-accent-orange/40">
          <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-accent-orange/10 text-accent-orange flex items-center justify-center shrink-0"><Flag className="h-5 w-5" /></span>
            <div className="flex-1">
              <div className="text-sm font-semibold">Отсчёт ещё не начат</div>
              <div className="text-xs text-fg-muted mt-0.5">
                В день старта введи вес ниже и нажми кнопку. Стартовый вес и дата зафиксируются, от них пойдут недели, рубежи и «сброшено».
                Цель — {profile.goalWeightKg} кг.
              </div>
            </div>
            <Button
              variant="primary"
              disabled={entry?.weightKg == null}
              onClick={() => entry?.weightKg != null && startProgram(date, entry.weightKg)}
              title={entry?.weightKg == null ? "Сначала введи вес" : ""}
            >
              <Flag className="h-4 w-4" /> Начать отсчёт {date === today ? "сегодня" : fmtDate(date)}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">Сейчас</div>
                <div className="text-3xl font-semibold tracking-tight">
                  {fmtNum(current, 1)}<span className="text-sm text-fg-muted ml-1">кг</span>
                </div>
                <div className="text-[11px] text-fg-subtle">среднее за 7 дней</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">Сброшено</div>
                <div className={cn("text-3xl font-semibold tracking-tight", lost > 0 ? "text-accent-green" : "")}>
                  {lost > 0 ? "−" : ""}{fmtNum(Math.abs(lost), 1)}<span className="text-sm text-fg-muted ml-1">кг</span>
                </div>
                <div className="text-[11px] text-fg-subtle">старт {profile.startWeightKg} кг</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">До цели</div>
                <div className="text-3xl font-semibold tracking-tight">
                  {fmtNum(Math.max(0, left), 1)}<span className="text-sm text-fg-muted ml-1">кг</span>
                </div>
                <div className="text-[11px] text-fg-subtle">цель {profile.goalWeightKg} кг</div>
              </div>
            </div>
            <div>
              <div className="h-2.5 rounded-full bg-bg-subtle overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-orange to-accent-green transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-fg-muted mt-1.5">
                <span>{Math.round(pct)}% пути</span>
                {nextMs && <span>следующий рубеж: <span className="text-fg font-medium">{nextMs.kg} кг</span> (ещё {fmtNum(round(lastWeight - nextMs.kg, 1), 1)})</span>}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Заполнение дня */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-base font-semibold">Заполнить день</div>
              <div className="text-xs text-fg-muted">Сохраняется автоматически при вводе</div>
            </div>
            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted" onClick={() => setWeekMonday(addDaysISO(weekMonday, -7))} aria-label="Предыдущая неделя">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-fg-muted w-[110px] text-center">
                {fmtDate(weekMonday)} — {fmtDate(addDaysISO(weekMonday, 6))}
              </span>
              <button
                className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted disabled:opacity-30"
                disabled={addDaysISO(weekMonday, 7) > today}
                onClick={() => setWeekMonday(addDaysISO(weekMonday, 7))}
                aria-label="Следующая неделя"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weekDates(weekMonday).map((d, i) => {
              const future = d > today;
              const selected = d === date;
              const filled = filledDates.has(d);
              const planned = profile.trainingDays.includes(i);
              return (
                <button
                  key={d}
                  disabled={future}
                  onClick={() => setDate(d)}
                  className={cn(
                    "rounded-xl border py-2 flex flex-col items-center gap-0.5 transition disabled:opacity-30",
                    selected ? "border-accent-orange bg-accent-orange/10 text-accent-orange" : "border-border bg-bg-subtle/50 text-fg-muted hover:text-fg",
                    d === today && !selected && "border-fg-subtle/50"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide">{WEEKDAYS_SHORT[i]}</span>
                  <span className="text-sm font-semibold">{parseInt(d.slice(8), 10)}</span>
                  <span className="flex items-center gap-0.5 h-2">
                    {filled && <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />}
                    {planned && <span className="h-1.5 w-1.5 rounded-full bg-accent-blue/70" />}
                  </span>
                </button>
              );
            })}
          </div>

          {date !== today && (
            <div className="text-xs text-accent-yellow">
              Редактируешь {fmtDate(date)}.{" "}
              <button className="underline" onClick={() => { setDate(today); setWeekMonday(weekStartISO(today)); }}>Вернуться к сегодня</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <NumField key={date + "w"} label="Вес" unit="кг" step="0.1" big value={entry?.weightKg} onChange={(v) => patch({ weightKg: v })} placeholder={lastWeight ? String(lastWeight) : undefined} />
            <NumField key={date + "s"} label="Шаги" big value={entry?.steps} target={profile.stepsTarget} onChange={(v) => patch({ steps: v })} />
            <NumField key={date + "k"} label="Калории" unit="ккал" big value={entry?.calories} target={profile.caloriesTarget} lowerIsBetter onChange={(v) => patch({ calories: v })} />
            <NumField key={date + "p"} label="Белки" unit="г" value={entry?.protein} target={profile.proteinTarget} onChange={(v) => patch({ protein: v })} />
            <NumField key={date + "f"} label="Жиры" unit="г" value={entry?.fat} target={profile.fatTarget} lowerIsBetter onChange={(v) => patch({ fat: v })} />
            <NumField key={date + "c"} label="Углеводы" unit="г" value={entry?.carbs} target={profile.carbsTarget} lowerIsBetter onChange={(v) => patch({ carbs: v })} />
          </div>

          <TrainingInput
            sessions={entry?.trainings ?? []}
            onChange={(t) => patch({ trainings: t.length ? t : undefined })}
            planned={isTrainingDayPlanned}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {yesterday && (yesterday.calories != null || yesterday.protein != null) && (
              <Button size="sm" variant="outline" onClick={() => patch({ calories: yesterday.calories, protein: yesterday.protein, fat: yesterday.fat, carbs: yesterday.carbs })}>
                КБЖУ как вчера
              </Button>
            )}
            {rationTotals && rationTotals.cal > 0 && (
              <Button size="sm" variant="outline" onClick={() => patch({ calories: rationTotals.cal, protein: rationTotals.p, fat: rationTotals.f, carbs: rationTotals.c })}>
                <ChefHat className="h-3.5 w-3.5" /> Из рациона: {rationTotals.cal} ккал
              </Button>
            )}
            <Link href="/meal-prep#constructor" className="text-xs text-fg-muted hover:text-fg underline-offset-2 hover:underline ml-auto">
              Собрать рацион →
            </Link>
          </div>

          {(fb.good.length > 0 || fb.improve.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {fb.good.length > 0 && <ul className="space-y-0.5 text-accent-green">{fb.good.map((g) => <li key={g}>✓ {g}</li>)}</ul>}
              {fb.improve.length > 0 && <ul className="space-y-0.5 text-fg-muted">{fb.improve.map((g) => <li key={g}>· {g}</li>)}</ul>}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Трекер недели */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base font-semibold">Трекер целей</div>
              <div className="text-xs text-fg-muted">Зелёная галочка — цель дня выполнена</div>
            </div>
            <Link href="/progress#tracker" className="text-xs text-accent-orange hover:underline">Месяц →</Link>
          </div>
          <WeekTracker entries={entries} profile={profile} monday={weekMonday} selected={date} onSelect={setDate} />
        </CardBody>
      </Card>

      {thisWeek && (
        <div>
          <div className="flex items-end justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Эта неделя</h2>
            <span className="text-xs text-fg-subtle">{thisWeek.daysFilled} из 7 дней заполнено</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            <WeekStat label="Ср. вес" value={thisWeek.weightAvg != null ? fmtNum(thisWeek.weightAvg, 1) : "—"} unit="кг" hint={thisWeek.weightDelta != null ? `${signed(thisWeek.weightDelta)} кг к прошлой` : "—"} tone={thisWeek.weightDelta != null ? (thisWeek.weightDelta < 0 ? "good" : "bad") : "neutral"} />
            <WeekStat label="Шаги / день" value={thisWeek.stepsAvg != null ? fmtNum(thisWeek.stepsAvg) : "—"} hint={`цель ${thisWeek.stepsDaysHit} дн. · всего ${fmtNum(thisWeek.stepsTotal)}`} tone={thisWeek.stepsAvg != null ? (thisWeek.stepsAvg >= profile.stepsTarget ? "good" : "neutral") : "neutral"} />
            <WeekStat label="Ккал / день" value={thisWeek.kcalAvg != null ? fmtNum(thisWeek.kcalAvg) : "—"} hint={`в коридоре ${thisWeek.kcalDaysOk} дн.`} tone={thisWeek.kcalAvg != null ? (thisWeek.kcalAvg <= profile.caloriesTarget * 1.05 ? "good" : "bad") : "neutral"} />
            <WeekStat label="Белок / день" value={thisWeek.proteinAvg != null ? fmtNum(thisWeek.proteinAvg) : "—"} unit="г" hint={`цель ${thisWeek.proteinDaysHit} дн.`} tone={thisWeek.proteinAvg != null ? (thisWeek.proteinAvg >= profile.proteinTarget * 0.95 ? "good" : "neutral") : "neutral"} />
            <WeekStat label="Тренировки" value={`${thisWeek.trainings} / ${profile.trainingsPerWeek}`} hint={thisWeek.trainings >= profile.trainingsPerWeek ? "план выполнен" : `осталось ${profile.trainingsPerWeek - thisWeek.trainings}`} tone={thisWeek.trainings >= profile.trainingsPerWeek ? "good" : "neutral"} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Вес за 30 дней" description="Точки — взвешивания, линия — среднее за 7 дней" height={220}>
            <ComposedChart data={series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={11} minTickGap={24} />
              <YAxis fontSize={11} domain={["dataMin - 0.5", "dataMax + 0.5"]} width={40} />
              <Tooltip content={<ChartTooltipContent unit="кг" />} />
              {hasWeights && <Line dataKey="w" name="Вес" stroke="rgb(var(--accent-orange))" strokeWidth={0} dot={{ r: 3, fill: "rgb(var(--accent-orange))", strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />}
              <Line dataKey="avg7" name="Среднее 7 дн." stroke="rgb(var(--accent-green))" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
            </ComposedChart>
          </ChartCard>
        </div>

        <div className="space-y-3">
          <Card className={measureDue ? "border-accent-yellow/40" : ""}>
            <CardBody className="flex items-start gap-3">
              <span className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", measureDue ? "bg-accent-yellow/10 text-accent-yellow" : "bg-accent-green/10 text-accent-green")}>
                {measureDue ? <Ruler className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{measureDue ? "Пора сделать замеры" : "Замеры сделаны"}</div>
                <div className="text-xs text-fg-muted mt-0.5">
                  {sinceMeasure == null ? "Ещё ни одного замера." : sinceMeasure === 0 ? "Сегодня." : `${sinceMeasure} дн. назад.`} Раз в неделю, утром натощак.
                </div>
                <Link href="/progress#measure" className="inline-block mt-2 text-xs text-accent-orange hover:underline">Внести замеры →</Link>
              </div>
            </CardBody>
          </Card>

          {started && (
            <Card>
              <CardBody>
                <div className="text-[11px] uppercase tracking-wide text-fg-muted mb-2">Рубежи</div>
                <div className="flex flex-wrap gap-1.5">
                  {ms.map((m) => (
                    <span key={m.kg} className={cn("px-2 py-1 rounded-md text-[11px] border", m.reached ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : m.kg === nextMs?.kg ? "border-accent-orange/40 text-accent-orange" : "border-border text-fg-subtle")}>
                      {m.reached ? "✓ " : ""}{m.kg}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekStat({ label, value, unit, hint, tone }: { label: string; value: string; unit?: string; hint: string; tone: "good" | "bad" | "neutral" }) {
  return (
    <div className={cn("rounded-2xl border bg-bg-card p-3.5", tone === "good" ? "border-accent-green/30" : tone === "bad" ? "border-accent-red/30" : "border-border")}>
      <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
      <div className="text-xl font-semibold tracking-tight mt-1">
        {value}{unit && <span className="text-xs text-fg-muted ml-1">{unit}</span>}
      </div>
      <div className={cn("text-[11px] mt-0.5", tone === "good" ? "text-accent-green" : tone === "bad" ? "text-accent-red" : "text-fg-subtle")}>{hint}</div>
    </div>
  );
}
