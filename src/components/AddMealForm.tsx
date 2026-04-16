"use client";

import { useState } from "react";

interface AddMealFormProps {
  onAdd: (meal: { name: string; kcal: number; protein: number; carbs: number; fat: number }) => void;
}

export default function AddMealForm({ onAdd }: AddMealFormProps) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !kcal) return;
    onAdd({
      name: name.trim(),
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    setName("");
    setKcal("");
    setProtein("");
    setCarbs("");
    setFat("");
  }

  return (
    <form onSubmit={handleSubmit} className="border-t-2 border-ink pt-4 mt-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block mb-1">
            Meal
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chicken breast"
            className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-body text-sm outline-none placeholder:text-ink/25 transition-colors"
          />
        </div>
        <div className="w-16">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block mb-1">
            kcal
          </label>
          <input
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm text-right outline-none placeholder:text-ink/25 transition-colors tabular-nums"
          />
        </div>
        <div className="w-14">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block mb-1">
            Prot
          </label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm text-right outline-none placeholder:text-ink/25 transition-colors tabular-nums"
          />
        </div>
        <div className="w-14">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block mb-1">
            Carbs
          </label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm text-right outline-none placeholder:text-ink/25 transition-colors tabular-nums"
          />
        </div>
        <div className="w-14">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block mb-1">
            Fat
          </label>
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm text-right outline-none placeholder:text-ink/25 transition-colors tabular-nums"
          />
        </div>
        <button
          type="submit"
          className="border-2 border-ink bg-ink text-paper font-heading text-xs uppercase tracking-wider px-4 py-2 hover:bg-transparent hover:text-ink transition-colors"
        >
          + Add
        </button>
      </div>
    </form>
  );
}
