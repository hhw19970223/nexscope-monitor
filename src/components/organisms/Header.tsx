"use client";

import { useState, useEffect } from "react";
import { Globe2, Activity, TrendingUp, Truck, Newspaper, RefreshCw } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Header() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().split(" ").slice(4, 5)[0]);
      setDate(now.toUTCString().split(" ").slice(0, 4).join(" "));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "linear-gradient(135deg, #060b14 0%, #0a1020 100%)",
        borderColor: "rgba(76,136,241,0.2)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" style={{ color: "#4C88F1" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#4C88F1" }}>
              NexScope Monitor
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] hidden sm:block">
            Global E-Commerce Intelligence
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#64748b] font-mono">
          <span className="hidden md:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-live" />
            OPERATIONAL
          </span>
          <span suppressHydrationWarning>
            {date} <span className="text-[#4C88F1] font-bold blink-cursor">{time}</span> UTC
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4" style={{ color: "#4C88F1" }} />
            <span className="text-sm font-bold text-white tracking-wide">
              {siteConfig.name}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Overview", href: "#", icon: Activity },
              { label: "Logistics", href: "#logistics", icon: Truck },
              { label: "Platforms", href: "#platforms", icon: TrendingUp },
              { label: "News", href: "#news", icon: Newspaper },
            ].map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] text-[#94a3b8] hover:text-white transition-colors hover:bg-white/5"
              >
                <Icon className="w-3 h-3" />
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-[10px]">
            <MetricPill label="Markets" value="50+" color="#4C88F1" />
            <MetricPill label="Platforms" value="30+" color="#10b981" />
            <MetricPill label="Data Feeds" value="12" color="#f59e0b" />
          </div>

          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] text-[#64748b] hover:text-[#4C88F1] border border-white/10 hover:border-[#4C88F1]/30 transition-all"
            title="Refresh data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#64748b]">{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
