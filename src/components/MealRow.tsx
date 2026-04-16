"use client";

import type { Meal } from "@/hooks/useDietStore";

interface MealRowProps {
  meal: Meal;
  onRemove: (id: string) => void;
}

export default function MealRow({ meal, onRemove }: MealRowProps) {
  return (
    <div className="flex items-center border-b border-ink/10 py-3 gap-4">
      <span className="font-heading text-xs text-ink/40 w-12 shrink-0">
        {meal.time}
      </span>
      <span className="font-body text-sm flex-1 truncate">{meal.name}</span>
      <span className="font-heading text-xs tabular-nums w-14 text-right">
        {meal.kcal}
      </span>
      <span className="font-heading text-xs tabular-nums text-ink/50 w-10 text-right">
        {meal.protein}p
      </span>
      <span className="font-heading text-xs tabular-nums text-ink/50 w-10 text-right">
        {meal.carbs}c
      </span>
      <span className="font-heading text-xs tabular-nums text-ink/50 w-10 text-right">
        {meal.fat}f
      </span>
      <button
        onClick={() => onRemove(meal.id)}
        className="font-heading text-xs text-ink/30 hover:text-accent transition-colors ml-2"
        aria-label={`Remove ${meal.name}`}
      >
        &times;
      </button>
    </div>
  );
}
