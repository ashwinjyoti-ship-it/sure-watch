"use client";

import { useState } from "react";
import type { Targets } from "@/hooks/useDietStore";

interface TargetsPanelProps {
  targets: Targets;
  onSave: (t: Targets) => void;
}

export default function TargetsPanel({ targets, onSave }: TargetsPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Targets>(targets);

  function handleToggle() {
    if (!open) setDraft(targets);
    setOpen(!open);
  }

  function handleSave() {
    onSave(draft);
    setOpen(false);
  }

  const fields: { key: keyof Targets; label: string }[] = [
    { key: "kcal", label: "Calories (kcal)" },
    { key: "protein", label: "Protein (g)" },
    { key: "carbs", label: "Carbs (g)" },
    { key: "fat", label: "Fat (g)" },
  ];

  return (
    <div className="border-t border-ink/10 mt-6 pt-4">
      <button
        onClick={handleToggle}
        className="font-heading text-xs uppercase tracking-wider text-ink/50 hover:text-ink transition-colors flex items-center gap-1"
      >
        <span className="inline-block transition-transform" style={{ transform: open ? "rotate(90deg)" : "none" }}>
          &#9656;
        </span>
        Targets
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 w-28">
                {f.label}
              </label>
              <input
                type="number"
                value={draft[f.key]}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [f.key]: Number(e.target.value) || 0,
                  }))
                }
                min="0"
                className="bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm text-right outline-none w-20 tabular-nums transition-colors"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            className="border-2 border-ink bg-ink text-paper font-heading text-xs uppercase tracking-wider px-4 py-2 hover:bg-transparent hover:text-ink transition-colors mt-2"
          >
            Save targets
          </button>
        </div>
      )}
    </div>
  );
}
