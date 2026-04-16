"use client";

import { useMemo } from "react";
import { useDietStore } from "@/hooks/useDietStore";
import MacroBar from "@/components/MacroBar";
import MealRow from "@/components/MealRow";
import AddMealForm from "@/components/AddMealForm";
import TargetsPanel from "@/components/TargetsPanel";

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const { meals, totals, targets, addMeal, removeMeal, setTargets, hydrated } =
    useDietStore(today);

  const overLimit = totals.kcal > targets.kcal;

  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (!hydrated) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="h-[64px]" />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-heading text-sm uppercase tracking-[0.2em] text-ink/50 mb-1">
          sure-watch
        </h1>
        <p className="font-body text-xs text-ink/40">{dateLabel}</p>
      </header>

      {/* Calorie headline */}
      <section className="mb-6">
        <div
          className={`font-heading text-[64px] leading-none tabular-nums ${
            overLimit ? "text-accent" : "text-ink"
          }`}
        >
          {totals.kcal}
        </div>
        <div className="font-heading text-xs uppercase tracking-wider text-ink/40 mt-1">
          kcal / {targets.kcal} target
        </div>
      </section>

      {/* Macro bars */}
      <section className="mb-6 space-y-1">
        <MacroBar label="Protein" current={totals.protein} target={targets.protein} />
        <MacroBar label="Carbs" current={totals.carbs} target={targets.carbs} />
        <MacroBar label="Fat" current={totals.fat} target={targets.fat} />
      </section>

      {/* Meal list */}
      <section>
        {meals.length === 0 ? (
          <p className="font-body text-sm text-ink/30 py-6 text-center border-t border-ink/10">
            No meals logged yet
          </p>
        ) : (
          meals.map((meal) => (
            <MealRow key={meal.id} meal={meal} onRemove={removeMeal} />
          ))
        )}
      </section>

      {/* Add meal form */}
      <AddMealForm onAdd={addMeal} />

      {/* Targets panel */}
      <TargetsPanel targets={targets} onSave={setTargets} />
    </main>
  );
}
