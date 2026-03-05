"use client";

import { useState } from "react";
import useSWR from "swr";
import { Truck, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { PanelHeader } from "@/components/atoms/PanelHeader";
import { DataSourceTag } from "@/components/atoms/DataSourceTag";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogisticsData, LogisticsApiResponse } from "@/types";
import { DATA_YEAR } from "@/lib/const";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_COLORS: Record<LogisticsData["status"], string> = {
  excellent: "#10b981",
  good: "#4C88F1",
  fair: "#f59e0b",
  poor: "#ef4444",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LPIBar({ score }: { score: number }) {
  const pct = ((score - 1) / 4) * 100;
  const color =
    score >= 4 ? "#10b981" : score >= 3.5 ? "#4C88F1" : score >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold w-6 text-right" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function TrendIcon({ trend }: { trend: LogisticsData["trend"] }) {
  if (trend === "up")   return <ArrowUp   className="w-3 h-3 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-[#64748b]" />;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="w-5 h-3 rounded animate-pulse" style={{ background: "#1e2d45" }} />
      <div className="w-5 h-3 rounded animate-pulse" style={{ background: "#1e2d45" }} />
      <div className="flex-1 h-3 rounded animate-pulse" style={{ background: "#1e2d45" }} />
      <div className="w-24 h-3 rounded animate-pulse" style={{ background: "#1e2d45" }} />
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function LogisticsPanel() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: resp, isLoading, error } = useSWR<LogisticsApiResponse>(
    "/api/logistics",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 } // 1 hour client-side cache
  );

  const items  = resp?.items ?? [];
  const meta   = resp?.meta;
  const top    = items.slice(0, 15);

  // Compute avg for summary row
  const avgLPI = items.length
    ? (items.reduce((s, i) => s + i.lpiScore, 0) / items.length).toFixed(2)
    : "—";
  const improvingPct = items.length
    ? Math.round((items.filter((i) => i.trend === "up").length / items.length) * 100) + "%"
    : "—";

  return (
    <div
      id="logistics"
      className="rounded-lg border p-3 h-full flex flex-col"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="Logistics Performance Index"
        subtitle={meta ? `${meta.dataYear} · ${items.length} countries` : "Loading…"}
        icon={<Truck className="w-3.5 h-3.5" />}
      />

<ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center text-red-400 text-[11px] py-8">
                Failed to load. Retrying…
              </div>
            ) : (
              <div className="space-y-1">
                {top.map((country, idx) => (
                  <div
                    key={country.countryCode}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer transition-all hover:bg-white/5"
                    style={{
                      background:  selected === country.countryCode ? "rgba(76,136,241,0.1)" : "transparent",
                      borderLeft: `2px solid ${selected === country.countryCode ? "#4C88F1" : "transparent"}`,
                    }}
                    onClick={() => setSelected(selected === country.countryCode ? null : country.countryCode)}
                  >
                    <span className="text-[10px] text-[#64748b] w-5 text-right flex-shrink-0">{idx + 1}</span>
                    <span className="text-[10px] font-bold w-5 flex-shrink-0" style={{ color: STATUS_COLORS[country.status] }}>
                      {country.countryCode}
                    </span>
                    <span className="text-[11px] text-[#e2e8f0] flex-1 truncate">{country.countryName}</span>
                    <TrendIcon trend={country.trend} />
                    <div className="w-24 flex-shrink-0">
                      <LPIBar score={country.lpiScore} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

      {/* ── Summary stats ── */}
      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 flex-shrink-0">
        {[
          { label: "Avg LPI Score",   value: avgLPI },
          { label: "Improving",        value: improvingPct },
          { label: "Data Year",        value: meta?.dataYear ?? DATA_YEAR },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-[13px] font-bold text-[#4C88F1]">{value}</div>
            <div className="text-[9px] text-[#64748b]">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Data source attribution ── */}
      <div className="mt-2 pt-2 border-t border-white/5 flex-shrink-0">
        {meta ? (
          <DataSourceTag
            source={meta.source}
            provider={meta.provider}
            providerUrl={meta.providerUrl}
            dataYear={meta.dataYear}
            fetchedAt={meta.fetchedAt}
          />
        ) : (
          <DataSourceTag
            source="static"
            provider={`World Bank LPI ${DATA_YEAR}`}
            providerUrl="https://lpi.worldbank.org/"
            dataYear={parseInt(DATA_YEAR)}
          />
        )}
      </div>
    </div>
  );
}
