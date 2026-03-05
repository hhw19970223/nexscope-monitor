"use client";

import { useState } from "react";
import { TrendingUp, ShoppingCart } from "lucide-react";
import { platformData, getTopMarkets } from "@/lib/data/platforms";
import { PanelHeader } from "@/components/atoms/PanelHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { PlatformData } from "@/types";

const MATURITY_COLORS: Record<PlatformData["marketMaturity"], string> = {
  saturated: "#8b5cf6",
  mature: "#4C88F1",
  growing: "#10b981",
  emerging: "#f59e0b",
};

const PLATFORM_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  alibaba: "#FF6A00",
  shopee: "#F57224",
  lazada: "#F57224",
  jd: "#CC0000",
  flipkart: "#2874F0",
  mercadolibre: "#FFE600",
  rakuten: "#BF0000",
  zalando: "#FF6900",
  coupang: "#C00020",
  tokopedia: "#4CAF50",
  ebay: "#E53238",
};

function getPlatformColor(id: string): string {
  return PLATFORM_COLORS[id] ?? "#4C88F1";
}

function MarketShareBar({ platform, maxShare }: { platform: { platformId: string; platformName: string; marketShare: number; status: string }; maxShare: number }) {
  const color = getPlatformColor(platform.platformId);
  const pct = (platform.marketShare / maxShare) * 100;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[10px] text-[#94a3b8] w-24 truncate flex-shrink-0">{platform.platformName}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>
        {platform.marketShare}%
      </span>
    </div>
  );
}

export function PlatformsPanel() {
  const [selected, setSelected] = useState<string | null>("US");
  const topMarkets = getTopMarkets(12);

  const selectedData = selected ? platformData.find((p) => p.countryCode === selected) : null;
  const maxShare = selectedData ? Math.max(...selectedData.platforms.map((p) => p.marketShare)) : 100;

  return (
    <div
      id="platforms"
      className="rounded-lg border p-3 h-full flex flex-col"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="Platform Market Intelligence"
        subtitle="E-Commerce Platform Share by Country"
        icon={<TrendingUp className="w-3.5 h-3.5" />}
      />

      {/* Country selector */}
      <ScrollArea className="mb-3">
        <div className="flex gap-1 pb-1">
          {topMarkets.map((market) => (
            <button
              key={market.countryCode}
              onClick={() => setSelected(market.countryCode)}
              className="flex-shrink-0 px-2.5 py-1 rounded text-[10px] transition-all"
              style={{
                background: selected === market.countryCode ? "rgba(76,136,241,0.2)" : "#111827",
                color: selected === market.countryCode ? "#4C88F1" : "#94a3b8",
                border: `1px solid ${selected === market.countryCode ? "rgba(76,136,241,0.4)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              {market.countryCode}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Country detail */}
      {selectedData ? (
        <div className="flex-1 flex flex-col min-h-0 panel-enter">
          {/* Header metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div
              className="p-2 rounded"
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="text-[10px] text-[#64748b] mb-0.5">Total GMV</div>
              <div className="text-[16px] font-bold" style={{ color: "#4C88F1" }}>
                ${selectedData.totalGmvBillion}B
              </div>
              <div className="text-[9px] text-[#64748b]">{selectedData.countryName}</div>
            </div>
            <div
              className="p-2 rounded"
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="text-[10px] text-[#64748b] mb-0.5">Active Shoppers</div>
              <div className="text-[16px] font-bold text-white">
                {selectedData.activeShoppers}M
              </div>
              <div className="text-[9px] text-[#64748b]">Mobile: {selectedData.mobileCommerce}%</div>
            </div>
          </div>

          {/* Market maturity */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold capitalize"
              style={{
                background: `${MATURITY_COLORS[selectedData.marketMaturity]}20`,
                color: MATURITY_COLORS[selectedData.marketMaturity],
                border: `1px solid ${MATURITY_COLORS[selectedData.marketMaturity]}40`,
              }}
            >
              <ShoppingCart className="w-3 h-3" />
              {selectedData.marketMaturity} Market
            </div>
            <div className="text-[10px] text-[#64748b]">
              E-comm: {selectedData.ecommerceGdpPercent}% of GDP
            </div>
          </div>

          {/* Platform bars */}
          <div className="flex-1 min-h-0">
            <div className="text-[10px] text-[#64748b] mb-2">Market Share by Platform</div>
            <div className="space-y-1.5">
              {selectedData.platforms.map((platform) => (
                <div key={platform.platformId}>
                  <MarketShareBar platform={platform} maxShare={maxShare} />
                  <div className="flex items-center gap-2 pl-28 mt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[8px] px-1.5 py-0 h-auto capitalize"
                      style={{
                        borderColor: platform.status === "dominant" ? "rgba(76,136,241,0.4)" : "rgba(255,255,255,0.1)",
                        color: platform.status === "dominant" ? "#4C88F1" : "#64748b",
                      }}
                    >
                      {platform.status}
                    </Badge>
                    {platform.launchYear && (
                      <span className="text-[9px] text-[#64748b]">est. {platform.launchYear}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#64748b] text-[11px]">
          Select a country above
        </div>
      )}
    </div>
  );
}
