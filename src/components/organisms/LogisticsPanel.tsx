"use client";

import { useState } from "react";
import { Truck, ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react";
import { logisticsData, getTopLogistics } from "@/lib/data/logistics";
import { PanelHeader } from "@/components/atoms/PanelHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LogisticsData } from "@/types";

const STATUS_COLORS: Record<LogisticsData["status"], string> = {
  excellent: "#10b981",
  good: "#4C88F1",
  fair: "#f59e0b",
  poor: "#ef4444",
};

function LPIBar({ score }: { score: number }) {
  const pct = ((score - 1) / 4) * 100;
  const color = score >= 4 ? "#10b981" : score >= 3.5 ? "#4C88F1" : score >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-bold w-6 text-right" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function TrendIcon({ trend }: { trend: LogisticsData["trend"] }) {
  if (trend === "up") return <ArrowUp className="w-3 h-3 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-[#64748b]" />;
}

export function LogisticsPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const topCountries = getTopLogistics(15);

  const selectedData = selected ? logisticsData.find((l) => l.countryCode === selected) : null;

  return (
    <div
      id="logistics"
      className="rounded-lg border p-3 h-full flex flex-col"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="Logistics Performance Index"
        subtitle="World Bank LPI 2023 · 160 Countries"
        icon={<Truck className="w-3.5 h-3.5" />}
      />

      <Tabs defaultValue="ranking" className="flex-1 flex flex-col">
        <TabsList className="bg-transparent border border-white/5 h-7 mb-3 p-0.5">
          <TabsTrigger value="ranking" className="text-[10px] h-6 px-3">Rankings</TabsTrigger>
          <TabsTrigger value="detail" className="text-[10px] h-6 px-3">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {topCountries.map((country, idx) => (
                <div
                  key={country.countryCode}
                  className="flex items-center gap-3 p-2 rounded cursor-pointer transition-all hover:bg-white/5"
                  style={{
                    background: selected === country.countryCode ? "rgba(76,136,241,0.1)" : "transparent",
                    borderLeft: selected === country.countryCode ? "2px solid #4C88F1" : "2px solid transparent",
                  }}
                  onClick={() => setSelected(selected === country.countryCode ? null : country.countryCode)}
                >
                  {/* Rank */}
                  <span className="text-[10px] text-[#64748b] w-5 text-right flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Country code flag */}
                  <span
                    className="text-[10px] font-bold w-5 flex-shrink-0"
                    style={{ color: STATUS_COLORS[country.status] }}
                  >
                    {country.countryCode}
                  </span>

                  {/* Country name */}
                  <span className="text-[11px] text-[#e2e8f0] flex-1 truncate">
                    {country.countryName}
                  </span>

                  {/* Trend */}
                  <TrendIcon trend={country.trend} />

                  {/* Bar */}
                  <div className="w-24 flex-shrink-0">
                    <LPIBar score={country.lpiScore} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="detail" className="flex-1 min-h-0 mt-0">
          {selectedData ? (
            <CountryDetail data={selectedData} />
          ) : (
            <div className="text-center text-[#64748b] text-[11px] py-8">
              Click a country in Rankings tab to see details
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary stats */}
      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
        {[
          { label: "Avg LPI Score", value: "3.7" },
          { label: "Improving", value: "47%" },
          { label: "Data Year", value: "2023" },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-[13px] font-bold text-[#4C88F1]">{value}</div>
            <div className="text-[9px] text-[#64748b]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountryDetail({ data }: { data: LogisticsData }) {
  const metrics = [
    { label: "Customs", score: data.customsScore },
    { label: "Infrastructure", score: data.infrastructureScore },
    { label: "Tracking", score: data.trackingScore },
    { label: "Timeliness", score: data.timelinessScore },
  ];

  return (
    <div className="space-y-3 panel-enter">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-bold text-white">{data.countryName}</div>
          <div className="text-[10px] text-[#64748b]">
            Global Rank #{data.lpiRank} · Avg {data.avgDeliveryDays}d delivery
          </div>
        </div>
        <div
          className="text-[18px] font-bold"
          style={{ color: STATUS_COLORS[data.status] }}
        >
          {data.lpiScore.toFixed(1)}
        </div>
      </div>

      <div className="space-y-2">
        {metrics.map(({ label, score }) => (
          <div key={label}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-[#94a3b8]">{label}</span>
              <span className="text-[#4C88F1]">{score.toFixed(1)}</span>
            </div>
            <LPIBar score={score} />
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] text-[#64748b] mb-1.5">Major Carriers</div>
        <div className="flex flex-wrap gap-1">
          {data.carriers.map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{ background: "#111827", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex-1 text-center py-1.5 rounded text-[10px] font-bold"
          style={{ background: `${STATUS_COLORS[data.status]}20`, color: STATUS_COLORS[data.status] }}
        >
          {data.status.toUpperCase()}
        </div>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: data.trend === "up" ? "#10b981" : data.trend === "down" ? "#ef4444" : "#64748b" }}>
          <TrendIcon trend={data.trend} />
          <span>{data.trend === "up" ? "Improving" : data.trend === "down" ? "Declining" : "Stable"}</span>
        </div>
      </div>
    </div>
  );
}
