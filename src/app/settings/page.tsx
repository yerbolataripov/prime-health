"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { PageHeader, Section } from "@/components/ui/PageHeader";
import { useApp } from "@/lib/store";
import { WEEKDAYS_SHORT } from "@/lib/stats";
import type { AppData, Profile } from "@/lib/types";
import { cn, safeParseFloat, todayISO } from "@/lib/utils";
import { Download, Moon, Sun, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function SettingsPage() {
  const state = useApp();
  const { profile, updateProfile, setTheme, resetData, importData } = state;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = safeParseFloat(e.target.value);
    if (v != null) updateProfile({ [k]: v } as Partial<Profile>);
  };

  function exportJson() {
    const data: AppData = {
      profile: state.profile,
      dailyEntries: state.dailyEntries,
      measurements: state.measurements,
      workouts: state.workouts,
      mealPlans: state.mealPlans,
      rations: state.rations,
      favoriteMeals: state.favoriteMeals,
      ui: state.ui,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prime-health-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      try {
        const d = JSON.parse(t);
        if (!d.profile || !Array.isArray(d.dailyEntries)) throw new Error("bad");
        importData({ ...d, ui: { ...d.ui, migratedV1: true } });
        setMsg("Данные импортированы.");
      } catch {
        setMsg("Не удалось прочитать файл.");
      }
    });
    e.target.value = "";
  }

  const kcalFromMacros = profile.proteinTarget * 4 + profile.fatTarget * 9 + profile.carbsTarget * 4;

  return (
    <div>
      <PageHeader title="Настройки" description="Цели и профиль. Сохраняется сразу." />

      <Section title="Цель">
        <Card>
          <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Имя"><Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} /></Field>
            <Field label="Рост" hint="см"><Input type="number" value={profile.heightCm} onChange={num("heightCm")} /></Field>
            <Field label="Стартовый вес" hint="кг"><Input type="number" step="0.1" value={profile.startWeightKg} onChange={num("startWeightKg")} /></Field>
            <Field label="Дата старта"><Input type="date" value={profile.startDate} onChange={(e) => updateProfile({ startDate: e.target.value })} /></Field>
            <Field label="Целевой вес" hint="кг"><Input type="number" step="0.1" value={profile.goalWeightKg} onChange={num("goalWeightKg")} /></Field>
            <div className="col-span-2 md:col-span-4 flex flex-wrap items-center gap-3 pt-1 text-xs text-fg-muted">
              {profile.started ? (
                <>
                  <span>Отсчёт начат {profile.startDate} с {profile.startWeightKg} кг.</span>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Сбросить старт? Записи дней останутся, а стартовый вес и дата зафиксируются заново по кнопке на главной.")) updateProfile({ started: false }); }}>
                    Начать отсчёт заново
                  </Button>
                </>
              ) : (
                <span>Отсчёт ещё не начат — нажми «Начать отсчёт» на главной в день старта.</span>
              )}
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Дневные цели" description="По твоей таблице: 2000 ккал, 180 г белка, 10 000 шагов. Шаги можно поднимать на 500 каждую неделю, когда стабильно выполняешь.">
        <Card>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Field label="Калории"><Input type="number" value={profile.caloriesTarget} onChange={num("caloriesTarget")} /></Field>
              <Field label="Белки" hint="г"><Input type="number" value={profile.proteinTarget} onChange={num("proteinTarget")} /></Field>
              <Field label="Жиры" hint="г"><Input type="number" value={profile.fatTarget} onChange={num("fatTarget")} /></Field>
              <Field label="Углеводы" hint="г"><Input type="number" value={profile.carbsTarget} onChange={num("carbsTarget")} /></Field>
              <Field label="Шаги"><Input type="number" step="500" value={profile.stepsTarget} onChange={num("stepsTarget")} /></Field>
            </div>
            <div className={cn("text-xs", Math.abs(kcalFromMacros - profile.caloriesTarget) > 120 ? "text-accent-yellow" : "text-fg-muted")}>
              БЖУ дают {kcalFromMacros} ккал (белки и углеводы ×4, жиры ×9){Math.abs(kcalFromMacros - profile.caloriesTarget) > 120 ? ` — расходится с целью ${profile.caloriesTarget}.` : "."}
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Тренировки">
        <Card>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="В неделю"><Input type="number" min={0} max={7} value={profile.trainingsPerWeek} onChange={num("trainingsPerWeek")} className="w-24" /></Field>
              <Field label="Дни">
                <div className="flex gap-1">
                  {WEEKDAYS_SHORT.map((w, i) => {
                    const on = profile.trainingDays.includes(i);
                    return (
                      <button
                        key={w}
                        onClick={() => {
                          const set = new Set(profile.trainingDays);
                          on ? set.delete(i) : set.add(i);
                          updateProfile({ trainingDays: Array.from(set).sort() });
                        }}
                        className={cn("h-10 w-10 rounded-lg border text-xs", on ? "bg-accent-blue/15 border-accent-blue text-accent-blue" : "border-border text-fg-muted")}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Данные">
        <Card>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setTheme(state.ui.theme === "dark" ? "light" : "dark")}>
                {state.ui.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {state.ui.theme === "dark" ? "Светлая тема" : "Тёмная тема"}
              </Button>
              <Button variant="outline" onClick={exportJson}><Download className="h-4 w-4" /> Экспорт JSON</Button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Импорт JSON</Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm("Удалить все записи и вернуть настройки по умолчанию?")) {
                    resetData();
                    setMsg("Данные сброшены.");
                  }
                }}
              >
                Сбросить всё
              </Button>
            </div>
            {msg && <Alert level="info">{msg}</Alert>}
            <div className="text-xs text-fg-muted">
              Данные хранятся только в этом браузере. Раз в неделю делай экспорт, чтобы не потерять историю: {state.dailyEntries.length} дн. записей, {state.measurements.length} замеров, {state.workouts.length} тренировок.
            </div>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
