"use client";

import { Button } from "./ui/Button";
import { Card, CardBody } from "./ui/Card";
import { MealPicker } from "./MealPicker";
import { RecipeModal } from "./RecipeModal";
import { CATEGORY_LABEL, autoFillRation, byId, totalsForRation } from "@/lib/mealPlanner";
import { uid, useApp } from "@/lib/store";
import type { DayRation, MealCategory, MealPrepTemplate, RationSlot } from "@/lib/types";
import { addDaysISO, cn, fmtDate, todayISO } from "@/lib/utils";
import { BookOpen, Check, ChevronLeft, ChevronRight, Minus, Plus, RefreshCw, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CATS: MealCategory[] = ["breakfast", "lunch", "snack", "dinner"];

function emptyRation(date: string): DayRation {
  return { date, slots: DEFAULT_CATS.map((c) => ({ id: uid("slot"), category: c, portion: 1 })) };
}

export function RationBuilder({ initialDate }: { initialDate?: string }) {
  const profile = useApp((s) => s.profile);
  const rations = useApp((s) => s.rations);
  const setRation = useApp((s) => s.setRation);
  const deleteRation = useApp((s) => s.deleteRation);
  const favorites = useApp((s) => s.favoriteMeals);
  const toggleFavorite = useApp((s) => s.toggleFavoriteMeal);
  const patchDaily = useApp((s) => s.patchDaily);
  const entries = useApp((s) => s.dailyEntries);
  const plans = useApp((s) => s.mealPlans);

  const today = todayISO();
  const [date, setDate] = useState(initialDate ?? today);
  const ration = useMemo(() => rations.find((r) => r.date === date) ?? emptyRation(date), [rations, date]);
  const totals = totalsForRation(ration);
  const entry = entries.find((e) => e.date === date);

  const [picker, setPicker] = useState<{ slotId: string; category: MealCategory } | null>(null);
  const [recipe, setRecipe] = useState<MealPrepTemplate | null>(null);
  const [addMenu, setAddMenu] = useState(false);
  const [written, setWritten] = useState(false);

  const planDay = plans.flatMap((p) => p.days).find((d) => d.date === date);

  function commit(next: DayRation) {
    setRation(next);
    setWritten(false);
  }
  function updateSlot(id: string, patch: Partial<RationSlot>) {
    commit({ ...ration, slots: ration.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function removeSlot(id: string) {
    commit({ ...ration, slots: ration.slots.filter((s) => s.id !== id) });
  }
  function addSlot(category: MealCategory) {
    commit({ ...ration, slots: [...ration.slots, { id: uid("slot"), category, portion: 1 }] });
    setAddMenu(false);
  }
  function clearAll() {
    deleteRation(date);
    setWritten(false);
  }
  function fromPlan() {
    if (!planDay) return;
    commit({ date, slots: planDay.meals.map((m) => ({ id: uid("slot"), category: m.category, templateId: m.templateId, portion: 1 })) });
  }
  function autoFill() {
    commit(autoFillRation(ration, profile.caloriesTarget, profile.proteinTarget, favorites));
  }
  function writeToDay() {
    patchDaily(date, { calories: totals.cal, protein: totals.p, fat: totals.f, carbs: totals.c });
    setWritten(true);
  }

  const usedIds = ration.slots.map((s) => s.templateId).filter(Boolean) as string[];
  const filled = ration.slots.filter((s) => s.templateId).length;

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted" onClick={() => setDate(addDaysISO(date, -1))} aria-label="Назад"><ChevronLeft className="h-4 w-4" /></button>
                <div className="text-sm font-semibold w-[130px] text-center">
                  {date === today ? "Сегодня" : date === addDaysISO(today, 1) ? "Завтра" : date === addDaysISO(today, -1) ? "Вчера" : fmtDate(date)}
                  <div className="text-[10px] font-normal text-fg-subtle">{fmtDate(date, { weekday: "short" })}</div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-bg-subtle text-fg-muted" onClick={() => setDate(addDaysISO(date, 1))} aria-label="Вперёд"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {planDay && (
                  <Button size="sm" variant="outline" onClick={fromPlan} title="Взять блюда из недельного плана на этот день">
                    <BookOpen className="h-3.5 w-3.5" /> Из плана
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={autoFill} disabled={ration.slots.every((s) => s.templateId)} title="Подобрать блюда в пустые слоты под цели">
                  <Wand2 className="h-3.5 w-3.5" /> Автодобор
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} disabled={filled === 0 && ration.slots.length === DEFAULT_CATS.length}>
                  <Trash2 className="h-3.5 w-3.5" /> Очистить
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {ration.slots.map((s) => {
                const t = s.templateId ? byId(s.templateId) : undefined;
                return (
                  <div key={s.id} className={cn("rounded-xl border p-3 transition", t ? "border-border bg-bg-subtle/40" : "border-dashed border-border")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-fg-subtle">{CATEGORY_LABEL[s.category]}</span>
                      <button onClick={() => removeSlot(s.id)} className="text-fg-subtle hover:text-accent-red p-0.5" aria-label="Убрать приём"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    {t ? (
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                        <button className="flex-1 text-left min-w-0" onClick={() => setRecipe(t)}>
                          <div className="text-sm font-medium leading-tight">{t.name}</div>
                          <div className="text-[11px] text-fg-muted mt-0.5 flex flex-wrap gap-x-2">
                            <span>{Math.round(t.calories * s.portion)} ккал</span>
                            <span className="text-accent-green">Б {Math.round(t.protein * s.portion)}</span>
                            <span>Ж {Math.round(t.fat * s.portion)}</span>
                            <span>У {Math.round(t.carbs * s.portion)}</span>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center rounded-lg border border-border">
                            <button className="px-2 py-1.5 text-fg-muted hover:text-fg" onClick={() => updateSlot(s.id, { portion: Math.max(0.25, s.portion - 0.25) })} aria-label="Меньше"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="text-xs w-12 text-center font-medium">×{s.portion}</span>
                            <button className="px-2 py-1.5 text-fg-muted hover:text-fg" onClick={() => updateSlot(s.id, { portion: Math.min(3, s.portion + 0.25) })} aria-label="Больше"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <Button size="icon" variant="ghost" title="Заменить" onClick={() => setPicker({ slotId: s.id, category: s.category })}><RefreshCw className="h-4 w-4 text-fg-muted" /></Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setPicker({ slotId: s.id, category: s.category })} className="mt-1 w-full rounded-lg py-2.5 text-sm text-accent-orange hover:bg-accent-orange/5 border border-transparent hover:border-accent-orange/30 transition">
                        + Выбрать блюдо
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <Button size="sm" variant="ghost" onClick={() => setAddMenu((v) => !v)}><Plus className="h-3.5 w-3.5" /> Добавить приём</Button>
              {addMenu && (
                <div className="absolute z-10 mt-1 rounded-xl border border-border bg-bg-card shadow-lg p-1 flex gap-1">
                  {(["breakfast", "lunch", "snack", "dinner"] as MealCategory[]).map((c) => (
                    <button key={c} onClick={() => addSlot(c)} className="px-3 py-1.5 rounded-lg text-xs hover:bg-bg-subtle">{CATEGORY_LABEL[c]}</button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-3 lg:sticky lg:top-6 self-start">
        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Итого за день</div>
            <Bar label="Калории" value={totals.cal} target={profile.caloriesTarget} unit="ккал" lowerIsBetter />
            <Bar label="Белки" value={totals.p} target={profile.proteinTarget} unit="г" />
            <Bar label="Жиры" value={totals.f} target={profile.fatTarget} unit="г" lowerIsBetter />
            <Bar label="Углеводы" value={totals.c} target={profile.carbsTarget} unit="г" lowerIsBetter />
            {totals.fb > 0 && <div className="text-[11px] text-fg-subtle">Клетчатка ≈ {totals.fb} г</div>}
            <div className="pt-2 border-t border-border space-y-2">
              <Button variant={written ? "success" : "primary"} className="w-full" onClick={writeToDay} disabled={filled === 0}>
                {written ? <><Check className="h-4 w-4" /> Записано в день</> : <><Sparkles className="h-4 w-4" /> Записать КБЖУ в день</>}
              </Button>
              <div className="text-[11px] text-fg-subtle leading-snug">
                {entry?.calories != null
                  ? `В дне сейчас: ${entry.calories} ккал · Б ${entry.protein ?? "—"} · Ж ${entry.fat ?? "—"} · У ${entry.carbs ?? "—"}. Кнопка перезапишет.`
                  : "Заполнит калории и БЖУ на выбранную дату на главном экране."}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <MealPicker
        open={!!picker}
        onClose={() => setPicker(null)}
        category={picker?.category}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        excludeIds={usedIds}
        onPick={(t) => {
          if (picker) updateSlot(picker.slotId, { templateId: t.id, portion: 1 });
          setPicker(null);
        }}
      />
      <RecipeModal
        open={!!recipe}
        onClose={() => setRecipe(null)}
        template={recipe ?? undefined}
        isFavorite={recipe ? favorites.includes(recipe.id) : false}
        onToggleFavorite={recipe ? () => toggleFavorite(recipe.id) : undefined}
      />
    </div>
  );
}

function Bar({ label, value, target, unit, lowerIsBetter }: { label: string; value: number; target: number; unit: string; lowerIsBetter?: boolean }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = value > target * 1.05;
  const under = value < target * 0.9;
  const tone = lowerIsBetter ? (over ? "bg-accent-red" : under ? "bg-accent-orange" : "bg-accent-green") : value >= target * 0.95 ? "bg-accent-green" : "bg-accent-orange";
  const left = target - value;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-fg-muted">{label}</span>
        <span>
          <span className="font-semibold text-fg">{value}</span>
          <span className="text-fg-subtle"> / {target} {unit}</span>
        </span>
      </div>
      <div className="h-1.5 mt-1 rounded-full bg-bg-subtle overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className={cn("text-[10px] mt-0.5", over ? "text-accent-red" : "text-fg-subtle")}>
        {left > 0 ? `осталось ${left}` : left === 0 ? "ровно в цель" : `перебор ${-left}`}
      </div>
    </div>
  );
}
