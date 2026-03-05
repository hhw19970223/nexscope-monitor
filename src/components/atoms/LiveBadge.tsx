"use client";

interface LiveBadgeProps {
  label?: string;
  color?: string;
}

export function LiveBadge({ label = "LIVE", color = "#4C88F1" }: LiveBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
      <span
        className="w-1.5 h-1.5 rounded-full pulse-live"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{label}</span>
    </span>
  );
}
