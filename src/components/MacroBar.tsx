"use client";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export default function MacroBar({ label, current, target, unit = "g" }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="font-heading text-xs uppercase tracking-wider w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-[2px] bg-ink/10 relative">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? "#FF4500" : "#0A0A0A",
          }}
        />
      </div>
      <span
        className={`font-heading text-xs tabular-nums w-20 text-right shrink-0 ${
          over ? "text-accent" : "text-ink"
        }`}
      >
        {current}{unit} / {target}{unit}
      </span>
    </div>
  );
}
