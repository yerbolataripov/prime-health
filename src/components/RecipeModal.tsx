"use client";

import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Alert } from "./ui/Alert";
import { CATEGORY_LABEL, TAG_LABEL } from "@/lib/mealPlanner";
import type { MealPrepTemplate } from "@/lib/types";
import { Clock, Pin, PinOff, RefreshCw, Star } from "lucide-react";
import type { ReactNode } from "react";

export const CATEGORY_TONE = { breakfast: "blue", lunch: "orange", dinner: "purple", snack: "green" } as const;

export function RecipeModal({
  open,
  onClose,
  template,
  pinned,
  isFavorite,
  onReplace,
  onTogglePin,
  onToggleFavorite,
  extra,
}: {
  open: boolean;
  onClose: () => void;
  template?: MealPrepTemplate;
  pinned?: boolean;
  isFavorite?: boolean;
  onReplace?: () => void;
  onTogglePin?: () => void;
  onToggleFavorite?: () => void;
  extra?: ReactNode;
}) {
  if (!template) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={template.name}
      description={`${template.calories} ккал · Б ${template.protein} · Ж ${template.fat} · У ${template.carbs}${template.fiber ? ` · клетчатка ${template.fiber}` : ""}`}
      size="lg"
      footer={
        <>
          {onToggleFavorite && (
            <Button variant={isFavorite ? "primary" : "ghost"} size="sm" onClick={onToggleFavorite}>
              <Star className="h-3.5 w-3.5" />
              {isFavorite ? "В избранном" : "В избранное"}
            </Button>
          )}
          {onTogglePin && (
            <Button variant={pinned ? "primary" : "outline"} size="sm" onClick={onTogglePin}>
              {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              {pinned ? "Открепить" : "Закрепить"}
            </Button>
          )}
          {onReplace && (
            <Button variant="outline" size="sm" onClick={onReplace}>
              <RefreshCw className="h-3.5 w-3.5" /> Заменить
            </Button>
          )}
          {extra}
          <Button variant="ghost" size="sm" onClick={onClose}>Закрыть</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={CATEGORY_TONE[template.category]}>{CATEGORY_LABEL[template.category]}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-fg-muted"><Clock className="h-3 w-3" /> {template.prepTimeMin} мин</span>
          {template.prepFriendly && <Badge tone="blue">впрок</Badge>}
          {template.tags.map((t) => <Badge key={t} tone="default">{TAG_LABEL[t]}</Badge>)}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-fg-muted mb-2">Ингредиенты</div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {template.ingredients.map((i, idx) => (
              <li key={idx} className="flex justify-between border-b border-border py-1">
                <span>{i.name}</span>
                <span className="text-fg-muted text-xs">{[i.grams ? `${i.grams} г` : "", i.pieces ? `${i.pieces} шт.` : ""].filter(Boolean).join(" / ")}</span>
              </li>
            ))}
          </ul>
        </div>

        {template.steps && template.steps.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-fg-muted mb-2">Рецепт</div>
            <ol className="space-y-1.5 text-sm list-decimal list-inside marker:text-accent-orange">
              {template.steps.map((s, idx) => <li key={idx} className="leading-relaxed">{s}</li>)}
            </ol>
          </div>
        )}

        {template.notes && <Alert level="info" title="Совет">{template.notes}</Alert>}

        <div className="text-[11px] text-fg-subtle">КБЖУ примерные. Для точности сверяйся с FatSecret или упаковкой.</div>
      </div>
    </Modal>
  );
}
