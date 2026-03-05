"use client";

import { Activity, DollarSign, Globe2, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { PanelHeader } from "@/components/atoms/PanelHeader";

const metrics = [
  {
    label: "Global E-Comm GMV",
    value: "$5.8T",
    change: "+8.8%",
    positive: true,
    icon: DollarSign,
    color: "#4C88F1",
    sub: "2024 Estimate",
  },
  {
    label: "Active Markets",
    value: "180+",
    change: "+12 YoY",
    positive: true,
    icon: Globe2,
    color: "#10b981",
    sub: "Countries tracked",
  },
  {
    label: "Daily Parcels",
    value: "65M",
    change: "+15%",
    positive: true,
    icon: Package,
    color: "#8b5cf6",
    sub: "Cross-border",
  },
  {
    label: "Digital Shoppers",
    value: "2.8B",
    change: "+5.3%",
    positive: true,
    icon: ShoppingCart,
    color: "#f59e0b",
    sub: "Worldwide",
  },
  {
    label: "Mobile Commerce",
    value: "73%",
    change: "+4pp",
    positive: true,
    icon: TrendingUp,
    color: "#06b6d4",
    sub: "Share of total",
  },
  {
    label: "Marketplace GMV",
    value: "67%",
    change: "+2pp",
    positive: true,
    icon: Activity,
    color: "#ec4899",
    sub: "Platform share",
  },
];

export function MarketOverview() {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="Global Market Overview"
        subtitle="Key metrics · Updated Q4 2024"
        live
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="p-2.5 rounded transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${metric.color}10, #111827)`,
                border: `1px solid ${metric.color}20`,
              }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                <span
                  className="text-[9px] font-bold"
                  style={{ color: metric.positive ? "#10b981" : "#ef4444" }}
                >
                  {metric.change}
                </span>
              </div>
              <div className="text-[18px] font-bold leading-none mb-1" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="text-[9px] text-[#94a3b8] leading-tight">{metric.label}</div>
              <div className="text-[9px] text-[#64748b]">{metric.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
