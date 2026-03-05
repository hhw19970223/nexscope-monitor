"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { PanelHeader } from "@/components/atoms/PanelHeader";
import { SeverityDot } from "@/components/atoms/SeverityDot";
import { DataSourceTag } from "@/components/atoms/DataSourceTag";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NewsItem } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_COLORS: Record<NewsItem["category"], string> = {
  logistics: "#4C88F1",
  platform: "#10b981",
  policy: "#f59e0b",
  market: "#8b5cf6",
  technology: "#06b6d4",
  general: "#64748b",
};

interface NewsApiResponse {
  items: NewsItem[];
  total: number;
  source: "live";
  breakdown: Record<string, number>;
  feedCount: number;
  feedStatus?: Array<{ source: string; count: number; ok: boolean }>;
}

export function NewsPanel() {
  const { data, isLoading } = useSWR<NewsApiResponse>(
    "/api/news",
    fetcher,
    { refreshInterval: 300_000 }
  );

  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const categories = ["all", "logistics", "platform", "policy", "market", "technology"] as const;

  const items = (data?.items ?? []).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div
      id="news"
      className="rounded-lg border p-3 flex flex-col h-full"
      style={{ background: "#0a1020", borderColor: "rgba(76,136,241,0.15)" }}
    >
      <PanelHeader
        title="E-Commerce Intelligence Feed"
        subtitle={`Live RSS · ${data?.feedCount ?? 9} feeds · 5 min refresh`}
        live
        icon={<Newspaper className="w-3.5 h-3.5" />}
      >
        <span className="text-[10px] text-[#64748b]">{filtered.length} items</span>
      </PanelHeader>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => {
          const color = cat === "all" ? "#4C88F1" : CATEGORY_COLORS[cat as NewsItem["category"]];
          const count = cat === "all" ? items.length : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-2 py-0.5 rounded text-[10px] capitalize transition-all"
              style={{
                background: filter === cat ? `${color}25` : "transparent",
                color: filter === cat ? color : "#64748b",
                border: `1px solid ${filter === cat ? `${color}50` : "rgba(255,255,255,0.05)"}`,
              }}
            >
              {cat} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* News list */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 rounded" style={{ background: "#111827" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-[#64748b] text-[11px] py-8">No items in this category</div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((item, idx) => {
              const isExpanded = expanded.has(item.id);
              const color = CATEGORY_COLORS[item.category];

              return (
                <div
                  key={item.id + '_' + idx}
                  className="news-item rounded border p-2.5 cursor-pointer"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-start gap-2">
                    {/* Left accent */}
                    <div
                      className="w-0.5 rounded-full self-stretch flex-shrink-0 mt-0.5"
                      style={{ background: color, minHeight: "12px" }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[11px] text-[#e2e8f0] leading-tight font-medium line-clamp-2">
                          {item.title}
                        </p>
                        <button
                          className="flex-shrink-0 text-[#64748b] hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                          }}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <SeverityDot severity={item.severity} />
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 capitalize h-auto"
                          style={{ borderColor: `${color}40`, color }}
                        >
                          {item.category}
                        </Badge>
                        <span className="text-[10px] text-[#64748b]">{item.source}</span>
                        <span className="text-[10px] text-[#64748b] ml-auto">
                          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                        </span>
                      </div>

                      {isExpanded && item.summary && (
                        <div className="mt-2 pt-2 border-t border-white/5 panel-enter">
                          <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                            {item.summary}
                          </p>
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1.5 py-0.5 rounded"
                                  style={{ background: "#111827", color: "#64748b" }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.url !== "#" && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 text-[10px] hover:underline"
                              style={{ color: "#4C88F1" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Read more <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Data source attribution */}
      <div className="mt-2 pt-2 border-t border-white/5 flex-shrink-0">
        <DataSourceTag
          source="live"
          provider="TechCrunch · FreightWaves · Supply Chain Dive · PYMNTS · DC360 · AP Business · CNBC · WTO · Retail Dive · NRF"
          providerUrl="https://techcrunch.com/tag/e-commerce/"
          dataYear={new Date().getFullYear()}
          fetchedAt={data ? new Date().toISOString() : undefined}
        />
      </div>
    </div>
  );
}
