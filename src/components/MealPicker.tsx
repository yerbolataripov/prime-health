"use client";

import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { CATEGORY_LABEL, MEAL_PREP_LIBRARY } from "@/lib/mealPlanner";
import type { MealCategory, MealPrepTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATS: (MealCategory | "all")[] = ["all", "breakfast", "lunch", "dinner", "snack"];

export function MealPicker({
  open,
  onClose,
  category,
  favorites,
  onToggleFavorite,
  onPick,
  excludeIds = [],
}: {
  open: boolean;
  onClose: () => void;
  category?: MealCategory;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPick: (t: MealPrepTemplate) => void;
  excludeIds?: string[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<MealCategory | "all">(category ?? "all");
  const [onlyFav, setOnlyFav] = useState(false);

  useEffect(() => {
    if (open) {
      setQ("");
      setCat(category ?? "all");
      setOnlyFav(false);
    }
  }, [open, category]);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return MEAL_PREP_LIBRARY.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (onlyFav && !favorites.includes(t.id)) return false;
      if (ql && !t.name.toLowerCase().includes(ql) && !t.ingredients.some((i) => i.name.toLowerCase().includes(ql))) return false;
      return true;
    }).sort((a, b) => {
      const fa = favorites.includes(a.id) ? 0 : 1;
      const fb = favorites.includes(b.id) ? 0 : 1;
      return fa - fb || b.protein - a.protein;
    });
  }, [q, cat, onlyFav, favorites]);

  return (
    <Modal open={open} onClose={onClose} title="Выбрать блюдо" size="lg">
      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию или продукту…"
            className="input-base pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={chip(cat === c)}>
              {c === "all" ? "Все" : CATEGORY_LABEL[c]}
            </button>
          ))}
          <button onClick={() => setOnlyFav((v) => !v)} className={cn(chip(onlyFav), "ml-auto")}>
            <Star className="h-3 w-3 inline mr-1" />Избранное
          </button>
        </div>
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {list.length === 0 && <div className="p-4 text-sm text-fg-muted text-center">Ничего не найдено</div>}
          {list.map((t) => {
            const fav = favorites.includes(t.id);
            const used = excludeIds.includes(t.id);
            return (
              <div key={t.id} className={cn("flex items-center gap-2 px-3 py-2 hover:bg-bg-subtle transition", used && "opacity-50")}>
                <button className="flex-1 text-left min-w-0" onClick={() => onPick(t)}>
                  <div className="text-sm leading-tight line-clamp-2">{t.name}</div>
                  <div className="text-[11px] text-fg-muted mt-0.5 flex flex-wrap gap-x-2 items-center">
                    <span>{t.calories} ккал</span>
                    <span className="text-accent-green">Б {t.protein}</span>
                    <span>Ж {t.fat}</span>
                    <span>У {t.carbs}</span>
                    <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.prepTimeMin}</span>
                    <Badge tone="default" className="py-0">{CATEGORY_LABEL[t.category]}</Badge>
                    {used && <span className="text-accent-yellow">уже в рационе</span>}
                  </div>
                </button>
                <button onClick={() => onToggleFavorite(t.id)} className={cn("p-1.5 rounded-lg", fav ? "text-accent-yellow" : "text-fg-subtle hover:text-fg")} aria-label="В избранное">
                  <Star className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function chip(active: boolean) {
  return cn(
    "px-2.5 py-1 rounded-lg border text-xs transition",
    active ? "bg-accent-orange/15 border-accent-orange text-accent-orange" : "bg-bg-subtle border-border text-fg-muted hover:text-fg"
  );
}
