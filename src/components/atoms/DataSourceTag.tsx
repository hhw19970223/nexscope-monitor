"use client";

import { ExternalLink, Wifi, WifiOff, Database } from "lucide-react";

interface DataSourceTagProps {
  provider: string;
  providerUrl?: string;
  source: "live" | "fallback" | "static";
  dataYear?: number;
  fetchedAt?: string;
  className?: string;
}

export function DataSourceTag({
  provider,
  providerUrl,
  source,
  dataYear,
  fetchedAt,
  className = "",
}: DataSourceTagProps) {
  const isLive = source === "live";
  const isStatic = source === "static";

  const color = isLive ? "#10b981" : isStatic ? "#64748b" : "#f59e0b";
  const label = isLive ? "LIVE" : isStatic ? "STATIC" : "CACHED";
  const Icon = isLive ? Wifi : isStatic ? Database : WifiOff;

  const timeLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  return (
    <div
      className={`flex items-center gap-1.5 text-[9px] text-[#64748b] ${className}`}
    >
      {/* Live / Cached / Static badge */}
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold tracking-wider"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        <Icon className="w-2.5 h-2.5" />
        {label}
      </span>

      {/* Provider name + link */}
      {providerUrl ? (
        <a
          href={providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-0.5 hover:text-[#4C88F1] transition-colors"
          title={`Verify data at ${providerUrl}`}
        >
          {provider}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ) : (
        <span>{provider}</span>
      )}

      {/* Year and time */}
      {dataYear && <span className="opacity-60">· {dataYear}</span>}
      {timeLabel && isLive && <span className="opacity-60">· {timeLabel} UTC</span>}
    </div>
  );
}
