"use client";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { MealPicker } from "@/components/MealPicker";
import { RationBuilder } from "@/components/RationBuilder";
import { CATEGORY_TONE, RecipeModal } from "@/components/RecipeModal";
import {
  CATEGORY_LABEL,
  GOAL_LABEL,
  GROUP_LABEL,
  MEAL_PREP_LIBRARY,
  byId,
  dayInRange,
  generateMealPlan,
  regenerateDay,
  regenerateWeek,
  replaceMeal,
  setMeal,
  togglePin,
  totalsForDay,
} from "@/lib/mealPlanner";
import { WEEKDAYS_SHORT, weekdayIdx } from "@/lib/stats";
import { uid, useApp } from "@/lib/store";
import type { GroceryGroup, MealCategory, MealPlan, MealPlanGoal, MealPrepTemplate } from "@/lib/types";
import { addDaysISO, cn, fmtDate, todayISO } from "@/lib/utils";
import { Calendar, ChefHat, Clock, Copy, ListChecks, Pin, RefreshCw, Search, ShoppingCart, Sparkles, Star, Trash2, Utensils, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Tab = "plan" | "constructor" | "library";

export default function MealPrepPage() {
  const profile = useApp((s) => s.profile);
  const plans = useApp((s) => s.mealPlans);
  const addPlan = useApp((s) => s.addMealPlan);
  const updatePlan = useApp((s) => s.updateMealPlan);
  const deletePlan = useApp((s) => s.deleteMealPlan);
  const favorites = useApp((s) => s.favoriteMeals);
  const toggleFavorite = useApp((s) => s.toggleFavoriteMeal);
  const setRation = useApp((s) => s.setRation);

  const [tab, setTab] = useState<Tab>("plan");
  const [constructorDate, setConstructorDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (h === "constructor" || h === "library" || h === "plan") setTab(h);
  }, []);

  // === план недели ===
  const [calories, setCalories] = useState(profile.caloriesTarget);
  const [protein, setProtein] = useState(profile.proteinTarget);
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(4);
  const [goal, setGoal] = useState<MealPlanGoal>("default");
  const [excluded, setExcluded] = useState("");
  const [favoriteIngs, setFavoriteIngs] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [showSettings, setShowSettings] = useState(plans.length === 0);

  const [activeId, setActiveId] = useState<string | null>(plans[0]?.id ?? null);
  const active = plans.find((p) => p.id === activeId) ?? plans[0] ?? null;

  const [recipe, setRecipe] = useState<{ tpl: MealPrepTemplate; dayIdx?: number; mealIdx?: number } | null>(null);
  const [picker, setPicker] = useState<{ dayIdx: number; mealIdx: number; category: MealCategory } | null>(null);
  const [bought, setBought] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  function onGenerate() {
    const plan = generateMealPlan({
      caloriesTarget: calories,
      proteinTarget: protein,
      mealsPerDay,
      goal,
      excludedIngredients: excluded.split(",").map((s) => s.trim()).filter(Boolean),
      favoriteIngredients: favoriteIngs.split(",").map((s) => s.trim()).filter(Boolean),
      favoriteTemplateIds: favorites,
      trainingDays: profile.trainingDays,
      startDate,
    });
    addPlan(plan);
    setActiveId(plan.id);
    setShowSettings(false);
    setBought(new Set());
  }
  const apply = (fn: (p: MealPlan) => MealPlan) => {
    if (!active) return;
    updatePlan(active.id, fn(active));
  };
  function sendDayToConstructor(dayIdx: number) {
    if (!active) return;
    const d = active.days[dayIdx];
    setRation({ date: d.date, slots: d.meals.map((m) => ({ id: uid("slot"), category: m.category, templateId: m.templateId, portion: 1 })) });
    setConstructorDate(d.date);
    setTab("constructor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function copyGrocery() {
    if (!active) return;
    const lines: string[] = [`Покупки · ${fmtDate(active.startDate)} — ${fmtDate(active.endDate)}`, ""];
    const groups = Array.from(new Set(active.groceryList.map((g) => g.group)));
    groups.forEach((g) => {
      lines.push(GROUP_LABEL[g].toUpperCase());
      active.groceryList.filter((x) => x.group === g).forEach((x) => lines.push(`  ${bought.has(x.item) ? "✓ " : ""}${x.item} — ${x.qty}`));
      lines.push("");
    });
    navigator.clipboard?.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  // === библиотека ===
  const [q, setQ] = useState("");
  const [libCat, setLibCat] = useState<MealCategory | "all">("all");
  const [libFav, setLibFav] = useState(false);
  const library = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return MEAL_PREP_LIBRARY.filter((t) => {
      if (libCat !== "all" && t.category !== libCat) return false;
      if (libFav && !favorites.includes(t.id)) return false;
      if (ql && !t.name.toLowerCase().includes(ql) && !t.ingredients.some((i) => i.name.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [q, libCat, libFav, favorites]);

  return (
    <div>
      <PageHeader
        title="Питание"
        description={`${MEAL_PREP_LIBRARY.length} блюд без свинины. План на неделю, конструктор рациона на день и библиотека рецептов.`}
      />

      <div className="flex gap-1 rounded-xl border border-border p-1 bg-bg-card mb-5 w-fit">
        <TabBtn active={tab === "plan"} onClick={() => setTab("plan")} icon={<Calendar className="h-3.5 w-3.5" />}>План недели</TabBtn>
        <TabBtn active={tab === "constructor"} onClick={() => setTab("constructor")} icon={<Utensils className="h-3.5 w-3.5" />}>Конструктор</TabBtn>
        <TabBtn active={tab === "library"} onClick={() => setTab("library")} icon={<ChefHat className="h-3.5 w-3.5" />}>Блюда ({MEAL_PREP_LIBRARY.length})</TabBtn>
      </div>

      {tab === "constructor" && <RationBuilder key={constructorDate ?? "today"} initialDate={constructorDate} />}

      {tab === "plan" && (
        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  <span className="font-semibold">Новый план</span>
                  <span className="text-fg-muted"> · {calories} ккал · {protein} г белка · {mealsPerDay} приёма · {GOAL_LABEL[goal].toLowerCase()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings((v) => !v)}>{showSettings ? "Скрыть настройки" : "Настройки"}</Button>
                  <Button variant="primary" size="sm" onClick={onGenerate}><Sparkles className="h-4 w-4" /> Сгенерировать неделю</Button>
                </div>
              </div>
              {showSettings && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
                  <Field label="Старт">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </Field>
                  <Field label="Калории">
                    <Input type="number" value={calories} onChange={(e) => setCalories(parseInt(e.target.value) || 0)} />
                  </Field>
                  <Field label="Белок, г">
                    <Input type="number" value={protein} onChange={(e) => setProtein(parseInt(e.target.value) || 0)} />
                  </Field>
                  <Field label="Приёмов в день">
                    <Select value={String(mealsPerDay)} onChange={(e) => setMealsPerDay(parseInt(e.target.value) as 3 | 4 | 5)}>
                      <option value="3">3</option><option value="4">4</option><option value="5">5</option>
                    </Select>
                  </Field>
                  <Field label="Цель меню">
                    <Select value={goal} onChange={(e) => setGoal(e.target.value as MealPlanGoal)}>
                      {Object.entries(GOAL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Исключить продукты" hint="через запятую">
                    <Input value={excluded} onChange={(e) => setExcluded(e.target.value)} placeholder="рыба, лаваш" />
                  </Field>
                  <Field label="Любимые продукты">
                    <Input value={favoriteIngs} onChange={(e) => setFavoriteIngs(e.target.value)} placeholder="курица, творог" />
                  </Field>
                  <div className="text-xs text-fg-muted self-end pb-2">
                    Тренировочные дни берутся из раздела «Тренировки»: {profile.trainingDays.map((d) => WEEKDAYS_SHORT[d]).join(", ") || "—"}. Избранные блюда ({favorites.length}) попадают чаще.
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {plans.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {plans.map((p) => (
                <button key={p.id} onClick={() => setActiveId(p.id)} className={cn("px-3 py-1.5 rounded-lg border text-xs", active?.id === p.id ? "border-accent-orange bg-accent-orange/10 text-accent-orange" : "border-border text-fg-muted hover:text-fg")}>
                  {fmtDate(p.startDate)} — {fmtDate(p.endDate)}
                </button>
              ))}
            </div>
          )}

          {!active && (
            <Alert level="info" title="Начни с одного клика">
              «Сгенерировать неделю» — подберём меню под {profile.caloriesTarget} ккал и {profile.proteinTarget} г белка. Каждый день собирается из 30 вариантов, берётся самый точный по КБЖУ.
            </Alert>
          )}

          {active && (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                  Меню {fmtDate(active.startDate)} — {fmtDate(active.endDate)}
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => apply(regenerateWeek)}><Wand2 className="h-3.5 w-3.5" /> Перегенерировать</Button>
                  <Button size="sm" variant="ghost" onClick={() => { deletePlan(active.id); setActiveId(null); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {active.days.map((d, dayIdx) => {
                  const totals = totalsForDay(d);
                  const ok = dayInRange(totals, active.caloriesTarget, active.proteinTarget);
                  const isToday = d.date === todayISO();
                  return (
                    <Card key={d.date} className={cn(!ok && "border-accent-yellow/40", isToday && "ring-1 ring-accent-orange/50")}>
                      <CardBody className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-fg-muted">{WEEKDAYS_SHORT[weekdayIdx(d.date)]}{isToday && " · сегодня"}</div>
                            <div className="text-sm font-semibold">{fmtDate(d.date)}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {d.trainingDay && <Badge tone="blue">трен.</Badge>}
                            <Button size="icon" variant="ghost" onClick={() => apply((p) => regenerateDay(p, dayIdx))} title="Перегенерировать день"><RefreshCw className="h-3.5 w-3.5 text-fg-muted" /></Button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {d.meals.map((m, mealIdx) => {
                            const t = byId(m.templateId);
                            if (!t) return null;
                            return (
                              <button
                                key={mealIdx}
                                type="button"
                                onClick={() => setRecipe({ tpl: t, dayIdx, mealIdx })}
                                className={cn("w-full text-left rounded-lg border p-2 transition hover:border-accent-orange/40", m.pinned ? "border-accent-orange/50 bg-accent-orange/5" : "border-border")}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] uppercase tracking-wider text-fg-subtle">{CATEGORY_LABEL[m.category]}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-fg-subtle">
                                    {favorites.includes(t.id) && <Star className="h-3 w-3 text-accent-yellow" fill="currentColor" />}
                                    {m.pinned && <Pin className="h-3 w-3 text-accent-orange" />}
                                    <Clock className="h-2.5 w-2.5" />{t.prepTimeMin}
                                  </span>
                                </div>
                                <div className="text-sm leading-tight mt-0.5 line-clamp-2">{t.name}</div>
                                <div className="text-[11px] text-fg-muted mt-0.5">{t.calories} ккал · <span className="text-accent-green">Б {t.protein}</span></div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                          <span className="text-fg-muted">
                            <span className={cn("font-medium", ok ? "text-fg" : "text-accent-yellow")}>{totals.cal} ккал</span> · <span className="text-accent-green">Б {totals.p}</span> · Ж {totals.f} · У {totals.c}
                          </span>
                          <button onClick={() => sendDayToConstructor(dayIdx)} className="text-accent-orange hover:underline">в конструктор</button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-accent-orange" />
                      <div>
                        <div className="text-sm font-semibold">Список покупок</div>
                        <div className="text-[11px] text-fg-muted">{active.groceryList.length} позиций · отмечай купленное</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyGrocery}><Copy className="h-3.5 w-3.5" />{copied ? "Скопировано" : "Копировать"}</Button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {Array.from(new Set(active.groceryList.map((g) => g.group))).map((group) => (
                      <div key={group}>
                        <div className="text-[11px] uppercase tracking-wider text-accent-orange mb-1.5">{GROUP_LABEL[group as GroceryGroup]}</div>
                        <ul className="space-y-0.5 text-sm">
                          {active.groceryList.filter((g) => g.group === group).map((g) => {
                            const done = bought.has(g.item);
                            return (
                              <li key={g.item}>
                                <label className={cn("flex items-center gap-2 py-1 cursor-pointer", done && "text-fg-subtle line-through")}>
                                  <input type="checkbox" checked={done} onChange={() => setBought((s) => { const n = new Set(s); done ? n.delete(g.item) : n.add(g.item); return n; })} className="accent-[rgb(var(--accent-orange))]" />
                                  <span className="flex-1">{g.item}</span>
                                  <span className="text-xs text-fg-muted">{g.qty}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {active.prepTasks.length > 0 && (
                <Card>
                  <CardBody>
                    <div className="text-sm font-semibold mb-2">Готовка впрок</div>
                    <ul className="space-y-1.5 text-sm">
                      {active.prepTasks.map((t, i) => (
                        <li key={i} className="flex items-start gap-2"><ListChecks className="h-4 w-4 text-accent-green mt-0.5 shrink-0" />{t}</li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {tab === "library" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск блюда или продукта…" className="input-base pl-9" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "breakfast", "lunch", "dinner", "snack"] as const).map((c) => (
                <button key={c} onClick={() => setLibCat(c)} className={chip(libCat === c)}>{c === "all" ? "Все" : CATEGORY_LABEL[c]}</button>
              ))}
              <button onClick={() => setLibFav((v) => !v)} className={chip(libFav)}><Star className="h-3 w-3 inline mr-1" />Избранное</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {library.map((t) => {
              const fav = favorites.includes(t.id);
              return (
                <Card key={t.id} className="hover:border-accent-orange/40 transition-colors">
                  <CardBody className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2">
                      <button className="text-left text-sm font-semibold leading-tight flex-1" onClick={() => setRecipe({ tpl: t })}>{t.name}</button>
                      <button onClick={() => toggleFavorite(t.id)} className={cn("p-1 -mr-1 -mt-1", fav ? "text-accent-yellow" : "text-fg-subtle hover:text-fg")} aria-label="В избранное">
                        <Star className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="text-xs text-fg-muted mt-1.5 flex flex-wrap gap-x-2">
                      <span>{t.calories} ккал</span><span className="text-accent-green">Б {t.protein}</span><span>Ж {t.fat}</span><span>У {t.carbs}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{t.prepTimeMin} мин</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge tone={CATEGORY_TONE[t.category]}>{CATEGORY_LABEL[t.category]}</Badge>
                      {t.light && <Badge tone="green">лёгкое</Badge>}
                      {t.prepFriendly && <Badge tone="blue">впрок</Badge>}
                      {t.tags.includes("no_cooking") && <Badge tone="default">без готовки</Badge>}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
            {library.length === 0 && <div className="text-sm text-fg-muted col-span-full">Ничего не найдено.</div>}
          </div>
        </div>
      )}

      <RecipeModal
        open={!!recipe}
        onClose={() => setRecipe(null)}
        template={recipe?.tpl}
        pinned={recipe?.dayIdx != null && recipe.mealIdx != null && active ? !!active.days[recipe.dayIdx]?.meals[recipe.mealIdx]?.pinned : undefined}
        isFavorite={recipe ? favorites.includes(recipe.tpl.id) : false}
        onToggleFavorite={recipe ? () => toggleFavorite(recipe.tpl.id) : undefined}
        onReplace={recipe?.dayIdx != null && recipe.mealIdx != null ? () => { apply((p) => replaceMeal(p, recipe.dayIdx!, recipe.mealIdx!)); setRecipe(null); } : undefined}
        onTogglePin={recipe?.dayIdx != null && recipe.mealIdx != null ? () => { apply((p) => togglePin(p, recipe.dayIdx!, recipe.mealIdx!)); setRecipe(null); } : undefined}
        extra={
          recipe?.dayIdx != null && recipe.mealIdx != null && active ? (
            <Button variant="outline" size="sm" onClick={() => { setPicker({ dayIdx: recipe.dayIdx!, mealIdx: recipe.mealIdx!, category: active.days[recipe.dayIdx!].meals[recipe.mealIdx!].category }); setRecipe(null); }}>
              <Search className="h-3.5 w-3.5" /> Выбрать другое
            </Button>
          ) : undefined
        }
      />
      <MealPicker
        open={!!picker}
        onClose={() => setPicker(null)}
        category={picker?.category}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        excludeIds={picker && active ? active.days[picker.dayIdx].meals.map((m) => m.templateId) : []}
        onPick={(t) => {
          if (picker) apply((p) => setMeal(p, picker.dayIdx, picker.mealIdx, t.id));
          setPicker(null);
        }}
      />
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition", active ? "bg-accent-orange/15 text-accent-orange" : "text-fg-muted hover:text-fg")}>
      {icon}{children}
    </button>
  );
}

function chip(active: boolean) {
  return cn("px-2.5 py-1.5 rounded-lg border text-xs transition", active ? "bg-accent-orange/15 border-accent-orange text-accent-orange" : "bg-bg-subtle border-border text-fg-muted hover:text-fg");
}
