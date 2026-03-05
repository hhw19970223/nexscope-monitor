"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, type Geography as GeoType } from "react-simple-maps";
import { platformData } from "@/lib/data/platforms";
import { PanelHeader } from "@/components/atoms/PanelHeader";
import { Globe2 } from "lucide-react";
import type { LogisticsApiResponse, LogisticsData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryNameToCode: Record<string, string> = {
  "United States of America": "US",
  "United Kingdom": "GB",
  "China": "CN",
  "Japan": "JP",
  "Germany": "DE",
  "France": "FR",
  "South Korea": "KR",
  "Australia": "AU",
  "India": "IN",
  "Brazil": "BR",
  "Mexico": "MX",
  "Indonesia": "ID",
  "Thailand": "TH",
  "Singapore": "SG",
  "Canada": "CA",
  "Netherlands": "NL",
  "Finland": "FI",
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
  "South Africa": "ZA",
};

function getLPIColor(code: string, items: LogisticsData[]): string {
  const lpi = items.find((l: LogisticsData) => l.countryCode === code);
  if (!lpi) return "#1a2035";
  if (lpi.lpiScore >= 4.0) return "rgba(76,136,241,0.7)";
  if (lpi.lpiScore >= 3.5) return "rgba(76,136,241,0.4)";
  if (lpi.lpiScore >= 3.0) return "rgba(76,136,241,0.2)";
  return "rgba(76,136,241,0.1)";
}

interface TooltipData {
  name: string;
  code?: string;
  x: number;
  y: number;
}

export function WorldMap() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"logistics" | "platforms">("logistics");

  // Share the same SWR cache key as LogisticsPanel — no duplicate fetch
  const { data: lpiResp } = useSWR<LogisticsApiResponse>(
    "/api/logistics",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 }
  );
  const lpiItems: LogisticsData[] = lpiResp?.items ?? [];

  const handleMouseEnter = useCallback((geo: GeoType, x: number, y: number) => {
    const name = geo.properties.name as string;
    const code = countryNameToCode[name];
    setTooltip({ name, code, x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleClick = useCallback((geo: GeoType) => {
    const code = countryNameToCode[geo.properties.name as string];
    setSelectedCountry(code || null);
  }, []);

  const selectedLPI = selectedCountry ? lpiItems.find((l: LogisticsData) => l.countryCode === selectedCountry) : null;
  const selectedPlatform = selectedCountry ? platformData.find((p) => p.countryCode === selectedCountry) : null;

  return (
    <div
      className="rounded-lg border p-3 flex flex-col"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="Global E-Commerce Map"
        subtitle={`${viewMode === "logistics" ? "Logistics Performance Index" : "Platform Market Share"} · Click country for details`}
        live
        icon={<Globe2 className="w-3.5 h-3.5" />}
      >
        <div className="flex items-center gap-1 text-[10px]">
          {(["logistics", "platforms"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="px-2 py-0.5 rounded capitalize transition-all"
              style={{
                background: viewMode === mode ? "rgba(76,136,241,0.2)" : "transparent",
                color: viewMode === mode ? "#4C88F1" : "#64748b",
                border: `1px solid ${viewMode === mode ? "rgba(76,136,241,0.4)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </PanelHeader>

      <div className="relative flex-1 min-h-[280px] lg:min-h-[340px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 20] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: GeoType[] }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name as string;
                  const code = countryNameToCode[name];
                  const isSelected = code && code === selectedCountry;
                  const fillColor = viewMode === "logistics" && code ? getLPIColor(code, lpiItems) : "#1a2035";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(evt: React.MouseEvent<SVGPathElement>) => handleMouseEnter(geo, evt.clientX, evt.clientY)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: isSelected ? "#4C88F1" : fillColor,
                          stroke: "#1e2d45",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: "#4C88F1",
                          stroke: "#4C88F1",
                          strokeWidth: 0.8,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#2563eb",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Markers for top e-commerce markets */}
            {[
              { code: "CN", lat: 35, lng: 105, label: "CN" },
              { code: "US", lat: 38, lng: -97, label: "US" },
              { code: "GB", lat: 55, lng: -3, label: "UK" },
              { code: "JP", lat: 37, lng: 138, label: "JP" },
              { code: "DE", lat: 51, lng: 10, label: "DE" },
              { code: "KR", lat: 36, lng: 127, label: "KR" },
            ].map(({ code, lat, lng, label }) => (
              <Marker key={code} coordinates={[lng, lat]}>
                <circle r={3} fill="#4C88F1" fillOpacity={0.8} stroke="#fff" strokeWidth={0.5} />
                <text
                  textAnchor="middle"
                  y={-6}
                  style={{ fontSize: "6px", fill: "#94a3b8", fontFamily: "monospace" }}
                >
                  {label}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none px-2 py-1.5 rounded text-[10px] border"
            style={{
              top: tooltip.y - 50,
              left: tooltip.x + 10,
              background: "#0d1420",
              borderColor: "rgba(76,136,241,0.3)",
              color: "#e2e8f0",
            }}
          >
            <div className="font-bold">{tooltip.name}</div>
            {tooltip.code && (() => {
              const lpi = lpiItems.find((l: LogisticsData) => l.countryCode === tooltip.code);
              if (lpi) return (
                <div className="text-[#4C88F1]">LPI: {lpi.lpiScore.toFixed(1)} · Rank #{lpi.lpiRank}</div>
              );
              return null;
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] text-[#64748b]">
          <span>LPI Score</span>
          {[
            { label: "4.0+", color: "rgba(76,136,241,0.7)" },
            { label: "3.5+", color: "rgba(76,136,241,0.4)" },
            { label: "3.0+", color: "rgba(76,136,241,0.2)" },
            { label: "N/A", color: "#1a2035" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm border border-white/10" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {selectedCountry && (
          <button
            onClick={() => setSelectedCountry(null)}
            className="text-[10px] text-[#64748b] hover:text-white transition-colors"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Country detail panel */}
      {selectedCountry && (selectedLPI || selectedPlatform) && (
        <div
          className="mt-3 p-3 rounded border text-[10px] panel-enter"
          style={{ background: "#0d1420", borderColor: "rgba(76,136,241,0.2)" }}
        >
          <div className="flex items-start justify-between gap-4">
            {selectedLPI && (
              <div className="flex-1">
                <div className="text-[11px] font-bold text-white mb-1.5">{selectedLPI.countryName}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <MetricRow label="LPI Score" value={selectedLPI.lpiScore.toFixed(1)} color="#4C88F1" />
                  <MetricRow label="Global Rank" value={`#${selectedLPI.lpiRank}`} color="#4C88F1" />
                  <MetricRow label="Avg Delivery" value={`${selectedLPI.avgDeliveryDays}d`} />
                  <MetricRow label="Status" value={selectedLPI.status.toUpperCase()} color={selectedLPI.status === "excellent" ? "#10b981" : "#f59e0b"} />
                </div>
                <div className="mt-1.5 text-[#64748b]">
                  Carriers: {selectedLPI.carriers.join(", ")}
                </div>
              </div>
            )}
            {selectedPlatform && (
              <div className="flex-1">
                <div className="text-[#64748b] mb-1">Top Platforms</div>
                {selectedPlatform.platforms.slice(0, 3).map((p) => (
                  <div key={p.platformId} className="flex items-center justify-between mb-1">
                    <span className="text-[#94a3b8]">{p.platformName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.marketShare}%`, background: "#4C88F1" }}
                        />
                      </div>
                      <span className="text-[#4C88F1] w-8 text-right">{p.marketShare}%</span>
                    </div>
                  </div>
                ))}
                <div className="mt-1 text-[#64748b]">
                  GMV: ${selectedPlatform.totalGmvBillion}B · {selectedPlatform.activeShoppers}M shoppers
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, color = "#e2e8f0" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#64748b]">{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
