"use client";

import { useState, useEffect, useCallback } from "react";

export interface Meal {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string; // HH:MM
}

export interface Targets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_TARGETS: Targets = {
  kcal: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `sw_meals_${y}-${m}-${d}`;
}

function targetsKey(): string {
  return "sw_targets";
}

function loadMeals(date: Date): Meal[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(dateKey(date));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMeals(date: Date, meals: Meal[]) {
  localStorage.setItem(dateKey(date), JSON.stringify(meals));
}

function loadTargets(): Targets {
  if (typeof window === "undefined") return DEFAULT_TARGETS;
  const raw = localStorage.getItem(targetsKey());
  if (!raw) return DEFAULT_TARGETS;
  try {
    return { ...DEFAULT_TARGETS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TARGETS;
  }
}

function saveTargets(targets: Targets) {
  localStorage.setItem(targetsKey(), JSON.stringify(targets));
}

export function useDietStore(date: Date) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [targets, setTargetsState] = useState<Targets>(DEFAULT_TARGETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMeals(loadMeals(date));
    setTargetsState(loadTargets());
    setHydrated(true);
  }, [date]);

  const addMeal = useCallback(
    (meal: Omit<Meal, "id" | "time">) => {
      const now = new Date();
      const newMeal: Meal = {
        ...meal,
        id: crypto.randomUUID(),
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      };
      setMeals((prev) => {
        const next = [...prev, newMeal];
        saveMeals(date, next);
        return next;
      });
    },
    [date]
  );

  const removeMeal = useCallback(
    (id: string) => {
      setMeals((prev) => {
        const next = prev.filter((m) => m.id !== id);
        saveMeals(date, next);
        return next;
      });
    },
    [date]
  );

  const setTargets = useCallback((t: Targets) => {
    setTargetsState(t);
    saveTargets(t);
  }, []);

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { meals, totals, targets, addMeal, removeMeal, setTargets, hydrated };
}
