import { Suspense } from "react";
import { WorldMap } from "@/components/organisms/WorldMap";
import { NewsPanel } from "@/components/organisms/NewsPanel";
import { LogisticsPanel } from "@/components/organisms/LogisticsPanel";
import { PlatformsPanel } from "@/components/organisms/PlatformsPanel";
import { MarketOverview } from "@/components/organisms/MarketOverview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NexScope Monitor — Global E-Commerce Intelligence Dashboard",
  description:
    "Track logistics performance, platform market share, and e-commerce news across 50+ countries in real time.",
};

function PanelSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border animate-pulse ${className}`}
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.1)", minHeight: "200px" }}
    />
  );
}

export default function HomePage() {
  return (
    <div className="p-3 lg:p-4 space-y-3 max-w-[1920px] mx-auto">
      {/* Market Overview Bar */}
      <Suspense fallback={<PanelSkeleton />}>
        <MarketOverview />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Map - spans 3 cols on lg, 3 on xl */}
        <div className="lg:col-span-2 xl:col-span-3">
          <Suspense fallback={<PanelSkeleton className="min-h-[400px]" />}>
            <WorldMap />
          </Suspense>
        </div>

        {/* News Panel - spans 1 col on lg, 2 on xl */}
        <div className="lg:col-span-1 xl:col-span-2">
          <div className="h-full min-h-[400px] max-h-[600px]">
            <Suspense fallback={<PanelSkeleton className="h-full" />}>
              <NewsPanel />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Logistics Panel */}
        <div className="min-h-[420px]">
          <Suspense fallback={<PanelSkeleton className="h-full" />}>
            <LogisticsPanel />
          </Suspense>
        </div>

        {/* Platforms Panel */}
        <div className="min-h-[420px]">
          <Suspense fallback={<PanelSkeleton className="h-full" />}>
            <PlatformsPanel />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t text-[10px] text-[#64748b]" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-center gap-4">
          <span>NexScope Monitor © {new Date().getFullYear()}</span>
          <span>·</span>
          <span>Data: World Bank LPI 2023 · Statista · eMarketer</span>
          <span>·</span>
          <span>News: TechCrunch · Retail Dive · FreightWaves</span>
        </div>
      </footer>
    </div>
  );
}
