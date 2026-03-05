import type { NewsItem } from "@/types";

const colors: Record<NewsItem["severity"], string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#4C88F1",
  low: "#64748b",
};

const labels: Record<NewsItem["severity"], string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

export function SeverityDot({ severity }: { severity: NewsItem["severity"] }) {
  const color = colors[severity];
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
    >
      {labels[severity]}
    </span>
  );
}
