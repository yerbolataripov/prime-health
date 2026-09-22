"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PageHeader, Section } from "@/components/ui/PageHeader";
import { ChartCard, ChartTooltipContent } from "@/components/ChartContainer";
import { uid, useApp } from "@/lib/store";
import { WEEKDAYS_SHORT, allTimeStats, sessionsOf, weekDates, weekStartISO } from "@/lib/stats";
import { PROGRAM_LABEL, TRAINING_KINDS, WORKOUT_PROGRAMS } from "@/lib/templates";
import type { Exercise, Program, Workout } from "@/lib/types";
import { addDaysISO, cn, fmtDate, fmtNum, safeParseFloat, todayISO } from "@/lib/utils";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

export default function TrainingPage() {
  const profile = useApp((s) => s.profile);
  const updateProfile = useApp((s) => s.updateProfile);
  const entries = useApp((s) => s.dailyEntries);
  const workouts = useApp((s) => s.workouts);
  const addWorkout = useApp((s) => s.addWorkout);
  const deleteWorkout = useApp((s) => s.deleteWorkout);
  const patchDaily = useApp((s) => s.patchDaily);

  const today = todayISO();
  const monday = weekStartISO(today);
  const week = weekDates(monday);
  const entryOf = (d: string) => entries.find((e) => e.date === d);
  const sessionsThisWeek = week.reduce((a, d) => a + sessionsOf(entryOf(d)).length, 0);
  const gymThisWeek = week.reduce((a, d) => a + sessionsOf(entryOf(d)).filter((s) => s.kind === "gym").length, 0);
  const programs: Program[] = ["full_a", "full_b", "full_c"];
  const todayProgram = programs[gymThisWeek % 3];
  const stats = useMemo(() => allTimeStats(entries), [entries]);

  const weeklyChart = useMemo(() => {
    const out: { w: string; c: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = addDaysISO(monday, -7 * i);
      out.push({ w: fmtDate(start), c: weekDates(start).reduce((a, d) => a + sessionsOf(entryOf(d)).length, 0) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, monday]);

  function toggleDay(i: number) {
    const set = new Set(profile.trainingDays);
    set.has(i) ? set.delete(i) : set.add(i);
    const days = Array.from(set).sort();
    updateProfile({ trainingDays: days, trainingsPerWeek: days.length || profile.trainingsPerWeek });
  }

  // === подробный лог ===
  const [logOpen, setLogOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [program, setProgram] = useState<Program>(todayProgram);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [comment, setComment] = useState("");
  const lastSame = workouts.find((w) => w.program === program);

  function loadTemplate() {
    if (program === "other") {
      setExercises([{ name: "Упражнение", sets: [{ weightKg: 0, reps: 10 }] }]);
      return;
    }
    const tpl = WORKOUT_PROGRAMS[program];
    setExercises(
      tpl.exercises.map((e) => {
        const prev = lastSame?.exercises.find((x) => x.name === e.name);
        const n = prev?.sets.length ?? parseInt(e.sets, 10) ?? 3;
        return { name: e.name, sets: Array.from({ length: n }).map((_, i) => ({ weightKg: prev?.sets[i]?.weightKg ?? 0, reps: prev?.sets[i]?.reps ?? parseInt(e.reps, 10) ?? 10 })) };
      })
    );
  }
  function save() {
    const w: Workout = { id: uid("workout"), date, program, exercises, comment: comment || undefined };
    addWorkout(w);
    const cur = sessionsOf(entryOf(date));
    if (!cur.some((s) => s.kind === "gym")) patchDaily(date, { trainings: [...cur, { id: uid("tr"), kind: "gym", note: PROGRAM_LABEL[program] }] });
    setExercises([]);
    setComment("");
  }

  return (
    <div>
      <PageHeader
        title="Тренировки"
        description="Силовые full body держат мышцы на дефиците, всё остальное — хайкинг, бассейн, падел, бокс — добавляет расход. Отмечай на главной, здесь — план и статистика."
      />

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <Card className="md:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Эта неделя</div>
                <div className="text-xs text-fg-muted">Нажми на день, чтобы включить его в расписание</div>
              </div>
              <div className="text-2xl font-semibold">{sessionsThisWeek}<span className="text-sm text-fg-muted"> / {profile.trainingsPerWeek}</span></div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d, i) => {
                const ss = sessionsOf(entryOf(d));
                const planned = profile.trainingDays.includes(i);
                const done = ss.length > 0;
                return (
                  <button
                    key={d}
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "rounded-xl border py-2 flex flex-col items-center gap-1 transition min-h-[74px]",
                      done ? "border-accent-green bg-accent-green/10" : planned ? "border-accent-blue/50 bg-accent-blue/5" : "border-border bg-bg-subtle/40",
                      d === today && "ring-1 ring-accent-orange/60"
                    )}
                  >
                    <span className="text-[10px] uppercase tracking-wide text-fg-muted">{WEEKDAYS_SHORT[i]}</span>
                    <span className="text-base leading-none">{done ? ss.map((s) => TRAINING_KINDS[s.kind].emoji).join("") : planned ? "•" : " "}</span>
                    <span className="text-[10px] text-fg-subtle text-center leading-tight px-0.5">
                      {done ? ss.map((s) => TRAINING_KINDS[s.kind].label).join(" + ") : planned ? "план" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
        <ChartCard title="По неделям" description="Тренировок за 8 недель" height={150}>
          <BarChart data={weeklyChart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="w" fontSize={10} />
            <YAxis fontSize={10} allowDecimals={false} width={20} />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={profile.trainingsPerWeek} stroke="rgb(var(--accent-blue))" strokeDasharray="4 4" />
            <Bar dataKey="c" fill="rgb(var(--accent-green))" radius={[6, 6, 0, 0]} name="Тренировок" />
          </BarChart>
        </ChartCard>
      </div>

      <Section title="За всё время">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          <Stat label="Тренировок" value={fmtNum(stats.sessionsTotal)} hint={`в этом месяце ${stats.sessionsMonth}`} />
          <Stat label="Минут" value={fmtNum(stats.minutesTotal)} hint={stats.minutesTotal ? `≈ ${fmtNum(stats.minutesTotal / 60, 1)} ч` : "укажи минуты в записи дня"} />
          <Stat label="Километров" value={fmtNum(stats.kmTotal, 1)} hint="ходьба, бег, вело, бассейн" />
          <Stat label="Дней записано" value={fmtNum(stats.daysTracked)} hint={`серия ${stats.streak} дн.`} />
        </div>
        {stats.byKind.length > 0 && (
          <Card>
            <CardBody className="space-y-2">
              {stats.byKind.map((k) => {
                const m = TRAINING_KINDS[k.kind];
                const pct = (k.count / stats.sessionsTotal) * 100;
                return (
                  <div key={k.kind}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{m.emoji} {m.label}</span>
                      <span className="text-fg-muted text-xs">
                        <span className="text-fg font-medium">{k.count}</span> раз{k.minutes ? ` · ${fmtNum(k.minutes)} мин` : ""}{k.km ? ` · ${fmtNum(k.km, 1)} км` : ""}
                      </span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-bg-subtle overflow-hidden"><div className="h-full bg-accent-green rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        )}
      </Section>

      <Section title="Программа зала" description={`Чередуй A → B → C. Следующая по очереди: ${PROGRAM_LABEL[todayProgram]}.`}>
        <div className="grid md:grid-cols-3 gap-3">
          {programs.map((p) => {
            const tpl = WORKOUT_PROGRAMS[p as Exclude<Program, "other">];
            const next = p === todayProgram;
            return (
              <Card key={p} className={next ? "border-accent-orange/50" : ""}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{tpl.title}</div>
                      <div className="text-xs text-fg-muted">{tpl.focus}</div>
                    </div>
                    {next && <span className="text-[10px] uppercase tracking-wider text-accent-orange">следующая</span>}
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {tpl.exercises.map((e) => (
                      <li key={e.name} className="flex justify-between gap-2 border-b border-border py-1">
                        <span>{e.name}</span>
                        <span className="text-xs text-fg-muted whitespace-nowrap">{e.sets} × {e.reps}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            );
          })}
        </div>
        <div className="text-xs text-fg-muted mt-2">Правила: 1–2 повтора в запасе, не до отказа. Если повторы растут — добавляй вес. Разгрузочная неделя каждые 5–6 недель.</div>
      </Section>

      <Section title="Подробный лог зала" description="По желанию: веса и повторы, чтобы видеть прогресс силы">
        <Card>
          <CardBody>
            <button className="w-full flex items-center justify-between text-sm" onClick={() => setLogOpen((v) => !v)}>
              <span className="font-medium">{logOpen ? "Скрыть" : "Записать тренировку с весами"}</span>
              {logOpen ? <ChevronUp className="h-4 w-4 text-fg-muted" /> : <ChevronDown className="h-4 w-4 text-fg-muted" />}
            </button>
            {logOpen && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-end">
                  <Field label="Дата"><Input type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" /></Field>
                  <Field label="Программа">
                    <Select value={program} onChange={(e) => setProgram(e.target.value as Program)} className="w-auto">
                      {Object.entries(PROGRAM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                  </Field>
                  <Button size="md" variant="outline" onClick={loadTemplate}>Загрузить {lastSame ? "с прошлыми весами" : "шаблон"}</Button>
                </div>
                {exercises.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Input value={ex.name} onChange={(e) => setExercises((arr) => arr.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} className="font-medium" />
                      <Button variant="ghost" size="icon" onClick={() => setExercises((arr) => arr.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-fg-muted" /></Button>
                    </div>
                    <div className="space-y-1.5">
                      {ex.sets.map((s, j) => (
                        <div key={j} className="grid grid-cols-[70px_1fr_1fr] gap-2 items-center">
                          <span className="text-xs text-fg-muted">Подход {j + 1}</span>
                          <Input type="number" inputMode="decimal" placeholder="кг" value={s.weightKg ?? ""} onChange={(e) => setExercises((arr) => arr.map((x, idx) => (idx === i ? { ...x, sets: x.sets.map((y, sj) => (sj === j ? { ...y, weightKg: safeParseFloat(e.target.value) ?? undefined } : y)) } : x)))} />
                          <Input type="number" inputMode="numeric" placeholder="повт." value={s.reps ?? ""} onChange={(e) => setExercises((arr) => arr.map((x, idx) => (idx === i ? { ...x, sets: x.sets.map((y, sj) => (sj === j ? { ...y, reps: safeParseFloat(e.target.value) ?? undefined } : y)) } : x)))} />
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="ghost" className="mt-2" onClick={() => setExercises((arr) => arr.map((x, idx) => (idx === i ? { ...x, sets: [...x.sets, { ...x.sets[x.sets.length - 1] }] } : x)))}>
                      <Plus className="h-3.5 w-3.5" /> Подход
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setExercises((arr) => [...arr, { name: "Упражнение", sets: [{ weightKg: 0, reps: 10 }] }])}><Plus className="h-3.5 w-3.5" /> Упражнение</Button>
                <Textarea placeholder="Комментарий: самочувствие, что было тяжело…" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                <div className="flex justify-end">
                  <Button variant="primary" onClick={save} disabled={exercises.length === 0}>Сохранить тренировку</Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {workouts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {workouts.slice(0, 9).map((w) => (
              <Card key={w.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-fg-subtle uppercase tracking-wider">{fmtDate(w.date)}</div>
                      <div className="font-semibold mt-0.5">{PROGRAM_LABEL[w.program]}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)}><Trash2 className="h-4 w-4 text-fg-muted" /></Button>
                  </div>
                  <div className="mt-2 text-xs text-fg-muted space-y-0.5">
                    {w.exercises.map((e, i) => (
                      <div key={i}>• {e.name} · {e.sets.map((s) => `${s.reps ?? "—"}×${s.weightKg ?? "—"}`).join(", ")}</div>
                    ))}
                  </div>
                  {w.comment && <div className="text-xs mt-2 text-fg-muted italic">{w.comment}</div>}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
      <div className="text-xl font-semibold tracking-tight mt-1">{value}</div>
      <div className="text-[11px] text-fg-subtle mt-0.5">{hint}</div>
    </div>
  );
}
