"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { PageHeader, Section } from "@/components/ui/PageHeader";
import { ChartCard, ChartTooltipContent } from "@/components/ChartContainer";
import { MonthTracker } from "@/components/Tracker";
import { ShareCardButton } from "@/components/ShareCard";
import { useApp } from "@/lib/store";
import {
  addMonths,
  allTimeStats,
  allWeeks,
  monthLabel,
  stepsByMonth,
  forecastToGoal,
  healthyRateRange,
  lossRatePerWeek,
  milestones,
  progressPct,
  weight7dAvg,
  weightSeries,
} from "@/lib/stats";
import type { Measurement, MeasurementKey } from "@/lib/types";
import { addDaysISO, cn, fmtDate, fmtDateLong, fmtNum, round, safeParseFloat, signed, todayISO } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { TRAINING_KINDS } from "@/lib/templates";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

const M_FIELDS: { key: MeasurementKey; label: string }[] = [
  { key: "weightKg", label: "Вес, кг" },
  { key: "neckCm", label: "Шея" },
  { key: "chestCm", label: "Грудь" },
  { key: "shouldersCm", label: "Плечи" },
  { key: "waistCm", label: "Талия" },
  { key: "bellyCm", label: "Живот" },
  { key: "hipsCm", label: "Таз / ягодицы" },
  { key: "bicepsCm", label: "Бицепс" },
  { key: "forearmCm", label: "Предплечье" },
  { key: "thighCm", label: "Бедро" },
  { key: "calfCm", label: "Голень" },
];

export default function ProgressPage() {
  const profile = useApp((s) => s.profile);
  const entries = useApp((s) => s.dailyEntries);
  const measurements = useApp((s) => s.measurements);
  const addMeasurement = useApp((s) => s.addMeasurement);
  const deleteMeasurement = useApp((s) => s.deleteMeasurement);
  const patchDaily = useApp((s) => s.patchDaily);

  const today = todayISO();
  const lastWeight = entries.find((d) => d.weightKg != null)?.weightKg ?? profile.startWeightKg;
  const avg7 = weight7dAvg(entries, profile);
  const pct = progressPct(lastWeight, profile);
  const ms = milestones(entries, profile);
  const rate = lossRatePerWeek(entries, 28);
  const fc = forecastToGoal(avg7, profile.goalWeightKg, rate);
  const healthy = healthyRateRange(avg7);

  const weeks = useMemo(() => allWeeks(entries, profile), [entries, profile]);
  const series = useMemo(() => {
    const from = profile.startDate < addDaysISO(today, -90) ? addDaysISO(today, -90) : profile.startDate;
    return weightSeries(entries, from, today).map((p) => ({ ...p, label: fmtDate(p.date) }));
  }, [entries, profile.startDate, today]);

  const [month, setMonth] = useState(today.slice(0, 7));
  const stats = useMemo(() => allTimeStats(entries), [entries]);
  const months = useMemo(() => stepsByMonth(entries), [entries]);
  const started = profile.started;

  const [m, setM] = useState<Measurement>({ date: today });
  const thisWeek = weeks[weeks.length - 1];
  const lostAvg = round(profile.startWeightKg - avg7, 1);
  const shareData = {
    brand: "ТОЧКА Б",
    title: `Неделя ${thisWeek?.index ?? 1} · ${fmtDate(today)}`,
    subtitle: `Точка А ${profile.startWeightKg} кг → точка Б ${profile.goalWeightKg} кг`,
    big: `${lostAvg > 0 ? "−" : lostAvg < 0 ? "+" : ""}${fmtNum(Math.abs(lostAvg), 1)} кг`,
    bigLabel: `сброшено · сейчас ${fmtNum(avg7, 1)} кг`,
    rows: [
      { label: "Шаги в день", value: thisWeek?.stepsAvg != null ? fmtNum(thisWeek.stepsAvg) : "—" },
      { label: "Калории в день", value: thisWeek?.kcalAvg != null ? fmtNum(thisWeek.kcalAvg) : "—" },
      { label: "Белок в день", value: thisWeek?.proteinAvg != null ? `${fmtNum(thisWeek.proteinAvg)} г` : "—" },
      { label: "Тренировок за неделю", value: `${thisWeek?.trainings ?? 0}` },
      { label: "Дней записано", value: `${stats.daysTracked}` },
    ],
    level: `${Math.round(pct)}% пути · ещё ${fmtNum(Math.max(0, round(avg7 - profile.goalWeightKg, 1)), 1)} кг`,
    progressPct: pct,
    footer: `${profile.name} · путь от ${profile.startWeightKg} до ${profile.goalWeightKg} кг`,
  };
  const last = measurements[0];
  const first = measurements[measurements.length - 1];

  useEffect(() => {
    // если на выбранную дату уже есть замер — подставить его для редактирования
    const ex = measurements.find((x) => x.date === m.date);
    if (ex) setM(ex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.date]);

  const measSeries = [...measurements]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((x) => ({ label: fmtDate(x.date), waist: x.waistCm, belly: x.bellyCm, chest: x.chestCm, hips: x.hipsCm }));

  function saveMeasurement() {
    addMeasurement(m);
    if (m.weightKg != null) patchDaily(m.date, { weightKg: m.weightKg });
    setM({ date: today });
  }

  return (
    <div>
      <div className="flex justify-end -mb-3">{started && <ShareCardButton data={shareData} fileName={`tochka-b-${today}.png`} />}</div>
      <PageHeader title="Прогресс" description={started ? `Путь ${profile.startWeightKg} → ${profile.goalWeightKg} кг. Считаем по среднему за 7 дней, а не по одному взвешиванию.` : `Цель ${profile.goalWeightKg} кг. Отсчёт начнётся, когда нажмёшь «Начать отсчёт» на главной.`} />

      {started && <div className="grid md:grid-cols-3 gap-3 mb-5">
        <Card className="md:col-span-2">
          <CardBody>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">Старт</div>
                <div className="text-xl font-semibold">{profile.startWeightKg} кг</div>
                <div className="text-[11px] text-fg-subtle">{fmtDate(profile.startDate)}</div>
              </div>
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">Сейчас</div>
                <div className="text-4xl font-semibold tracking-tight">{fmtNum(avg7, 1)} <span className="text-base text-fg-muted">кг</span></div>
                <div className="text-[11px] text-accent-green">−{fmtNum(round(profile.startWeightKg - avg7, 1), 1)} кг · последнее {fmtNum(lastWeight, 1)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wide text-fg-muted">Цель</div>
                <div className="text-xl font-semibold">{profile.goalWeightKg} кг</div>
                <div className="text-[11px] text-fg-subtle">ещё {fmtNum(round(avg7 - profile.goalWeightKg, 1), 1)} кг</div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="h-2.5 rounded-full bg-bg-subtle overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-orange to-accent-green" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-fg-muted mt-1.5"><span>{Math.round(pct)}%</span><span>100%</span></div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ms.map((x) => {
                const next = ms.find((y) => !y.reached)?.kg === x.kg;
                return (
                  <span key={x.kg} title={x.reachedAt ? fmtDateLong(x.reachedAt) : ""} className={cn("px-2 py-1 rounded-md text-[11px] border", x.reached ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : next ? "border-accent-orange/40 text-accent-orange" : "border-border text-fg-subtle")}>
                    {x.reached ? "✓ " : ""}{x.kg}
                  </span>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-fg-muted">Темп за 4 недели</div>
            {rate == null ? (
              <div className="text-sm text-fg-muted">Нужно минимум 4 взвешивания за последние 28 дней.</div>
            ) : (
              <>
                <div className={cn("text-3xl font-semibold tracking-tight", rate < 0 ? "text-accent-green" : "text-accent-red")}>
                  {signed(rate, 2)} <span className="text-sm text-fg-muted">кг/нед</span>
                </div>
                <div className="text-xs text-fg-muted">
                  Здоровый темп при {fmtNum(avg7, 0)} кг: <span className="text-fg">−{healthy.min}…−{healthy.max} кг/нед</span>
                  {rate < -healthy.max * 1.3 && <span className="block text-accent-yellow mt-1">Быстрее нормы — следи за белком и силовыми, чтобы не терять мышцы.</span>}
                  {rate > -healthy.min && rate < 0 && <span className="block text-accent-yellow mt-1">Медленнее нормы — проверь калории и шаги.</span>}
                </div>
                {fc ? (
                  <div className="text-xs text-fg-muted pt-1 border-t border-border">
                    При таком темпе {profile.goalWeightKg} кг — примерно <span className="text-fg font-medium">{fmtDateLong(fc.date)}</span> ({fc.weeks} нед.).
                  </div>
                ) : (
                  <div className="text-xs text-fg-muted pt-1 border-t border-border">Вес не снижается — прогноз пока не построить.</div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>}

      <div className="mb-6">
        <ChartCard title="Вес" description={series.length > 60 ? "Последние 90 дней" : "С начала программы"} height={260}>
          <ComposedChart data={series}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={11} minTickGap={28} />
            <YAxis fontSize={11} domain={["dataMin - 1", "dataMax + 1"]} width={40} />
            <Tooltip content={<ChartTooltipContent unit="кг" />} />
            <Line dataKey="w" name="Вес" stroke="rgb(var(--accent-orange))" strokeWidth={0} dot={{ r: 2.5, fill: "rgb(var(--accent-orange))", strokeWidth: 0 }} isAnimationActive={false} />
            <Line dataKey="avg7" name="Среднее 7 дн." stroke="rgb(var(--accent-green))" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ChartCard>
      </div>

      <div id="tracker" />
      <Section
        title="Трекер по дням"
        description="Счёт дня: взвесился, шаги, калории, белок, тренировка"
        actions={
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted" onClick={() => setMonth(addMonths(month, -1))} aria-label="Предыдущий месяц"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-xs text-fg w-[130px] text-center capitalize">{monthLabel(month)}</span>
            <button className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted disabled:opacity-30" disabled={addMonths(month, 1) > today.slice(0, 7)} onClick={() => setMonth(addMonths(month, 1))} aria-label="Следующий месяц"><ChevronRight className="h-4 w-4" /></button>
          </div>
        }
      >
        <Card><CardBody><MonthTracker entries={entries} profile={profile} month={month} /></CardBody></Card>
      </Section>

      <Section title="Статистика" description="Шаги и тренировки за месяц и за всё время">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          <StatBox label="Шаги за месяц" value={fmtNum(stats.stepsMonth)} hint={stats.stepsMonthAvg != null ? `${fmtNum(stats.stepsMonthAvg)} в день · ${stats.stepsMonthDays} дн.` : "нет записей"} />
          <StatBox label="Шаги за всё время" value={fmtNum(stats.stepsTotal)} hint={stats.stepsBest ? `рекорд ${fmtNum(stats.stepsBest.steps)} (${fmtDate(stats.stepsBest.date)})` : "—"} />
          <StatBox label="Тренировок всего" value={fmtNum(stats.sessionsTotal)} hint={`в этом месяце ${stats.sessionsMonth}${stats.kmTotal ? ` · ${fmtNum(stats.kmTotal, 1)} км` : ""}`} />
          <StatBox label="Дней записано" value={fmtNum(stats.daysTracked)} hint={`серия ${stats.streak} дн. подряд`} />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Card>
            <CardBody>
              <div className="text-[11px] uppercase tracking-wide text-fg-muted mb-2">Какие тренировки были</div>
              {stats.byKind.length === 0 ? (
                <div className="text-sm text-fg-muted">Пока нет тренировок. Отмечай их на главной.</div>
              ) : (
                <div className="space-y-2">
                  {stats.byKind.map((k) => {
                    const meta = TRAINING_KINDS[k.kind];
                    return (
                      <div key={k.kind}>
                        <div className="flex items-center justify-between text-sm">
                          <span>{meta.emoji} {meta.label}</span>
                          <span className="text-xs text-fg-muted"><span className="text-fg font-medium">{k.count}</span> раз{k.minutes ? ` · ${fmtNum(k.minutes)} мин` : ""}{k.km ? ` · ${fmtNum(k.km, 1)} км` : ""}</span>
                        </div>
                        <div className="h-1.5 mt-1 rounded-full bg-bg-subtle overflow-hidden"><div className="h-full bg-accent-green rounded-full" style={{ width: `${(k.count / stats.sessionsTotal) * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-[11px] uppercase tracking-wide text-fg-muted mb-2">Шаги по месяцам</div>
              {months.length === 0 ? (
                <div className="text-sm text-fg-muted">Пока нет записей шагов.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-fg-muted"><tr><th className="text-left font-normal pb-1">Месяц</th><th className="text-right font-normal pb-1">Всего</th><th className="text-right font-normal pb-1">В день</th><th className="text-right font-normal pb-1">Дней</th></tr></thead>
                  <tbody>
                    {[...months].reverse().map((r) => (
                      <tr key={r.month} className="border-t border-border">
                        <td className="py-1 capitalize">{monthLabel(r.month)}</td>
                        <td className="py-1 text-right font-medium">{fmtNum(r.steps)}</td>
                        <td className={cn("py-1 text-right", r.avg >= profile.stepsTarget ? "text-accent-green" : "text-fg-muted")}>{fmtNum(r.avg)}</td>
                        <td className="py-1 text-right text-fg-muted">{r.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="По неделям" description="Как в твоей таблице: средний вес, изменение, шаги, калории, тренировки">
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-card">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-[11px] uppercase tracking-wider text-fg-muted bg-bg-subtle">
              <tr>
                <th className="px-3 py-2 text-left">Нед.</th>
                <th className="px-3 py-2 text-left">Даты</th>
                <th className="px-3 py-2 text-right">Ср. вес</th>
                <th className="px-3 py-2 text-right">Δ</th>
                <th className="px-3 py-2 text-right">Мин / макс</th>
                <th className="px-3 py-2 text-right">Шаги/д</th>
                <th className="px-3 py-2 text-right">Ккал/д</th>
                <th className="px-3 py-2 text-right">Белок/д</th>
                <th className="px-3 py-2 text-right">Трен.</th>
                <th className="px-3 py-2 text-right">Дней</th>
              </tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map((w) => (
                <tr key={w.start} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{w.index}</td>
                  <td className="px-3 py-2 text-fg-muted whitespace-nowrap">{fmtDate(w.start)} — {fmtDate(w.end)}</td>
                  <td className="px-3 py-2 text-right font-medium">{w.weightAvg != null ? fmtNum(w.weightAvg, 1) : "—"}</td>
                  <td className={cn("px-3 py-2 text-right", w.weightDelta != null && (w.weightDelta < 0 ? "text-accent-green" : "text-accent-red"))}>
                    {w.weightDelta != null ? signed(w.weightDelta) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-fg-muted whitespace-nowrap">
                    {w.weightMin != null ? `${fmtNum(w.weightMin, 1)} / ${fmtNum(w.weightMax, 1)}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{w.stepsAvg != null ? fmtNum(w.stepsAvg) : "—"}</td>
                  <td className="px-3 py-2 text-right">{w.kcalAvg != null ? fmtNum(w.kcalAvg) : "—"}</td>
                  <td className="px-3 py-2 text-right">{w.proteinAvg != null ? fmtNum(w.proteinAvg) : "—"}</td>
                  <td className="px-3 py-2 text-right">{w.trainings}</td>
                  <td className="px-3 py-2 text-right text-fg-muted">{w.daysFilled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div id="measure" />
      <Section title="Замеры тела" description="Раз в неделю, утром натощак, в одно и то же время. Сантиметры честнее весов.">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="col-span-2 md:col-span-1">
                  <Field label="Дата">
                    <Input type="date" max={today} value={m.date} onChange={(e) => setM((x) => ({ ...x, date: e.target.value }))} className="min-w-0" />
                  </Field>
                </div>
                {M_FIELDS.map((f) => (
                  <Field key={f.key} label={f.label} hint={f.key === "weightKg" ? undefined : "см"}>
                    <Input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      placeholder={last?.[f.key] != null ? String(last[f.key]) : "—"}
                      value={(m[f.key] as number | undefined) ?? ""}
                      onChange={(e) => setM((x) => ({ ...x, [f.key]: safeParseFloat(e.target.value) ?? undefined }))}
                    />
                  </Field>
                ))}
              </div>
              <Field label="Комментарий">
                <Textarea rows={2} value={m.comment ?? ""} onChange={(e) => setM((x) => ({ ...x, comment: e.target.value }))} />
              </Field>
              <div className="flex justify-end">
                <Button variant="primary" onClick={saveMeasurement}>Сохранить замер</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-[11px] uppercase tracking-wide text-fg-muted mb-2">Изменения от первого замера</div>
              {!first || !last || first.date === last.date ? (
                <div className="text-sm text-fg-muted">Нужно минимум два замера.</div>
              ) : (
                <div className="space-y-1.5">
                  {M_FIELDS.map((f) => {
                    const a = first[f.key] as number | undefined;
                    const b = last[f.key] as number | undefined;
                    if (a == null || b == null) return null;
                    const d = round(b - a, 1);
                    return (
                      <div key={f.key} className="flex items-center justify-between text-sm border-b border-border pb-1">
                        <span className="text-fg-muted">{f.label}</span>
                        <span>
                          <span className="text-fg-subtle text-xs mr-2">{a} → {b}</span>
                          <span className={cn("font-medium", d < 0 ? "text-accent-green" : d > 0 ? "text-accent-red" : "text-fg-muted")}>{signed(d)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {measSeries.length >= 2 && (
          <div className="mt-4">
            <ChartCard title="Талия, живот, грудь, таз" height={220}>
              <LineChart data={measSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} width={40} />
                <Tooltip content={<ChartTooltipContent unit="см" />} />
                <Line dataKey="waist" name="Талия" stroke="rgb(var(--accent-blue))" dot strokeWidth={2} connectNulls isAnimationActive={false} />
                <Line dataKey="belly" name="Живот" stroke="rgb(var(--accent-orange))" dot strokeWidth={2} connectNulls isAnimationActive={false} />
                <Line dataKey="chest" name="Грудь" stroke="rgb(var(--accent-green))" dot strokeWidth={2} connectNulls isAnimationActive={false} />
                <Line dataKey="hips" name="Таз" stroke="rgb(var(--accent-purple))" dot strokeWidth={2} connectNulls isAnimationActive={false} />
              </LineChart>
            </ChartCard>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-card mt-4">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-[11px] uppercase tracking-wider text-fg-muted bg-bg-subtle">
              <tr>
                <th className="px-3 py-2 text-left">Дата</th>
                {M_FIELDS.map((f) => <th key={f.key} className="px-3 py-2 text-right">{f.label.replace(", кг", "")}</th>)}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {measurements.length === 0 && (
                <tr><td colSpan={M_FIELDS.length + 2} className="px-3 py-6 text-center text-fg-muted">Пока нет замеров</td></tr>
              )}
              {measurements.map((row) => (
                <tr key={row.date} className="border-t border-border">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{fmtDate(row.date)}</td>
                  {M_FIELDS.map((f) => <td key={f.key} className="px-3 py-2 text-right text-fg-muted">{row[f.key] != null ? fmtNum(row[f.key] as number, 1) : "—"}</td>)}
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMeasurement(row.date)} aria-label="Удалить"><Trash2 className="h-4 w-4 text-fg-muted" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function StatBox({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
      <div className="text-xl font-semibold tracking-tight mt-1">{value}</div>
      <div className="text-[11px] text-fg-subtle mt-0.5">{hint}</div>
    </div>
  );
}
