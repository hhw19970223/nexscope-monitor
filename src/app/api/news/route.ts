import { NextResponse } from "next/server";
import { mockNewsItems } from "@/lib/data/news";
import type { NewsItem } from "@/types";

export const runtime = "edge";
export const revalidate = 300; // 5 minutes

async function fetchRSSFeed(url: string, source: string, category: NewsItem["category"]): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "NexScope/1.0 RSS Reader" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];

    const text = await response.text();
    const items: NewsItem[] = [];

    const itemPattern = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;

    while ((itemMatch = itemPattern.exec(text)) !== null) {
      const item = itemMatch[1];

      const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1]
        || item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";

      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]
        || item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || "#";

      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || new Date().toISOString();

      const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1]
        || item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";

      if (!title) continue;

      const cleanDesc = desc.replace(/<[^>]+>/g, "").trim().slice(0, 200);
      const severity = getSeverity(title + " " + cleanDesc);

      items.push({
        id: `${source}-${encodeURIComponent(title).slice(0, 20)}-${Date.now()}`,
        title: title.trim(),
        url: link.trim(),
        source,
        category,
        severity,
        publishedAt: new Date(pubDate).toISOString(),
        summary: cleanDesc || undefined,
      });

      if (items.length >= 5) break;
    }

    return items;
  } catch {
    return [];
  }
}

function getSeverity(text: string): NewsItem["severity"] {
  const lower = text.toLowerCase();
  const criticalWords = ["crisis", "collapse", "ban", "shutdown", "emergency", "disruption", "breach", "penalty"];
  const highWords = ["launch", "expansion", "acquisition", "investment", "milestone", "record", "major"];
  const mediumWords = ["update", "growth", "partnership", "report", "announce", "new"];

  if (criticalWords.some((w) => lower.includes(w))) return "critical";
  if (highWords.some((w) => lower.includes(w))) return "high";
  if (mediumWords.some((w) => lower.includes(w))) return "medium";
  return "low";
}

export async function GET() {
  try {
    const feeds = [
      { url: "https://techcrunch.com/tag/e-commerce/feed/", source: "TechCrunch", category: "technology" as const },
      { url: "https://www.freightwaves.com/feed", source: "FreightWaves", category: "logistics" as const },
    ];

    const results = await Promise.allSettled(
      feeds.map((f) => fetchRSSFeed(f.url, f.source, f.category))
    );

    const fetchedItems = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value);

    const allItems = fetchedItems.length > 0
      ? [...fetchedItems, ...mockNewsItems].slice(0, 20)
      : mockNewsItems;

    const sorted = allItems.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({ items: sorted, total: sorted.length, source: fetchedItems.length > 0 ? "live" : "mock" }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json({ items: mockNewsItems, total: mockNewsItems.length, source: "mock" });
  }
}
