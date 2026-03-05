import { NextResponse } from "next/server";
import type { NewsItem } from "@/types";

export const runtime = "edge";
export const revalidate = 300; // 5 minutes

// ─── RSS Feed Catalog ─────────────────────────────────────────────────────────
//
// All sources are free public RSS feeds — no API key required.
//
// logistics:  FreightWaves (freight/supply chain), Supply Chain Dive
// platform:   PYMNTS (marketplace/payments), Digital Commerce 360
// policy:     Reuters Business (trade/regulation), WTO News
// market:     Retail Dive (retail market trends), NRF (retail federation)
// technology: TechCrunch e-commerce tag
//
// Category is used as a *hint* — detectCategory() may override it
// based on actual title/description content for better accuracy.

const FEEDS: Array<{
  url: string;
  source: string;
  defaultCategory: NewsItem["category"];
  maxItems: number;
}> = [
  // ── Technology ──────────────────────────────────────────────────────────────
  {
    url: "https://techcrunch.com/tag/e-commerce/feed/",
    source: "TechCrunch",
    defaultCategory: "technology",
    maxItems: 12,
  },

  // ── Logistics ────────────────────────────────────────────────────────────────
  {
    url: "https://www.freightwaves.com/feed",
    source: "FreightWaves",
    defaultCategory: "logistics",
    maxItems: 6,
  },
  {
    url: "https://www.supplychaindive.com/feeds/news/",
    source: "Supply Chain Dive",
    defaultCategory: "logistics",
    maxItems: 6,
  },

  // ── Platform ─────────────────────────────────────────────────────────────────
  // PYMNTS covers Amazon, Shopify, TikTok Shop, marketplace dynamics
  {
    url: "https://www.pymnts.com/feed/",
    source: "PYMNTS",
    defaultCategory: "platform",
    maxItems: 6,
  },
  // Digital Commerce 360 — deep e-commerce platform analysis
  {
    url: "https://www.digitalcommerce360.com/feed/",
    source: "Digital Commerce 360",
    defaultCategory: "platform",
    maxItems: 6,
  },

  // ── Policy / Regulation ───────────────────────────────────────────────────────
  // AP Business — tariffs, trade agreements, regulation; free & stable
  {
    url: "https://feeds.apnews.com/rss/apf-business",
    source: "AP Business",
    defaultCategory: "policy",
    maxItems: 12,
  },

  // ── Market ────────────────────────────────────────────────────────────────────
  // Retail Dive — market share, GMV reports, consumer trends
  {
    url: "https://www.retaildive.com/feeds/news/",
    source: "Retail Dive",
    defaultCategory: "market",
    maxItems: 12,
  },
];

// ─── Category detection (keyword-based) ──────────────────────────────────────
//
// Overrides the feed's defaultCategory when title/description strongly
// signals a different category. Prevents broad feeds (Reuters, PYMNTS)
// from misclassifying every article.

const CATEGORY_SIGNALS: Array<{
  category: NewsItem["category"];
  keywords: string[];
}> = [
  {
    category: "logistics",
    keywords: [
      "shipping", "freight", "logistics", "carrier", "parcel", "delivery",
      "warehouse", "fulfillment", "supply chain", "port", "customs", "last mile",
      "cross-border", "tracking", "red sea", "suez", "container", "truck",
    ],
  },
  {
    category: "platform",
    keywords: [
      "amazon", "alibaba", "shopify", "ebay", "tiktok shop", "mercadolibre",
      "lazada", "shopee", "flipkart", "coupang", "marketplace", "seller",
      "gmv", "third-party", "app store", "platform fee", "merchant",
    ],
  },
  {
    category: "policy",
    keywords: [
      "regulation", "tariff", "tax", "ban", "sanction", "compliance",
      "gdpr", "dsa", "antitrust", "legislation", "trade agreement", "wto",
      "import", "export", "duty", "customs rule", "data privacy", "law",
    ],
  },
  {
    category: "market",
    keywords: [
      "market share", "revenue", "sales", "growth", "forecast", "consumer",
      "retail", "holiday season", "q1", "q2", "q3", "q4", "annual report",
      "ecommerce spend", "online shopping", "survey", "research",
    ],
  },
  {
    category: "technology",
    keywords: [
      "ai", "artificial intelligence", "drone", "robot", "automation",
      "blockchain", "ar", "augmented reality", "machine learning", "api",
      "saas", "cloud", "payment tech", "fintech", "checkout",
    ],
  },
];

function detectCategory(
  text: string,
  fallback: NewsItem["category"]
): NewsItem["category"] {
  const lower = text.toLowerCase();

  // Score each category by counting keyword hits
  let bestCategory = fallback;
  let bestScore = 0;

  for (const { category, keywords } of CATEGORY_SIGNALS) {
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Only override if signals are strong enough (≥2 keyword hits)
  return bestScore >= 2 ? bestCategory : fallback;
}

// ─── Severity scoring ─────────────────────────────────────────────────────────

function getSeverity(text: string): NewsItem["severity"] {
  const lower = text.toLowerCase();

  // Negative/crisis signals → critical
  const criticalWords = [
    "crisis", "collapse", "ban", "shutdown", "emergency",
    "disruption", "breach", "penalty", "recall", "halt",
    "suspended", "blocked", "seized",
  ];
  // Major positive events → high
  const highWords = [
    "launch", "expansion", "acquisition", "investment",
    "milestone", "record", "major", "billion", "ipo", "merger",
  ];
  // Routine updates → medium
  const mediumWords = [
    "update", "growth", "partnership", "report", "announce",
    "new", "pilot", "trial", "agreement",
  ];

  if (criticalWords.some((w) => lower.includes(w))) return "critical";
  if (highWords.some((w) => lower.includes(w))) return "high";
  if (mediumWords.some((w) => lower.includes(w))) return "medium";
  return "low";
}

// ─── RSS parser ───────────────────────────────────────────────────────────────

async function fetchRSSFeed(
  url: string,
  source: string,
  defaultCategory: NewsItem["category"],
  maxItems: number
): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "NexScope/1.0 RSS Reader" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];

    const text = await response.text();
    const items: NewsItem[] = [];
    const itemPattern = /<item>([\s\S]*?)<\/item>/g;
    let m;

    while ((m = itemPattern.exec(text)) !== null) {
      const raw = m[1];

      const title =
        raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ||
        raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
        "";

      const link =
        raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
        raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ||
        "#";

      const pubDate =
        raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ||
        new Date().toISOString();

      const desc =
        raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ||
        raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] ||
        "";

      if (!title.trim()) continue;

      const cleanDesc = desc.replace(/<[^>]+>/g, "").trim().slice(0, 240);
      const combined = title + " " + cleanDesc;

      const publishedAt = new Date(pubDate).toISOString();
      items.push({
        id: `${source}-${encodeURIComponent(title.slice(0, 24))}-${items.length}`,
        title: title.trim(),
        url: link.trim(),
        source,
        category: detectCategory(combined, defaultCategory),
        severity: getSeverity(combined),
        publishedAt,
        summary: cleanDesc || undefined,
      });

      if (items.length >= maxItems) break;
    }

    return items;
  } catch {
    return [];
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map((f) =>
        fetchRSSFeed(f.url, f.source, f.defaultCategory, f.maxItems)
      )
    );

    const fetchedItems = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    const sorted = fetchedItems
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 60);

    const breakdown = sorted.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    // Per-feed success/failure report for transparency
    const feedStatus = FEEDS.map((f, i) => ({
      source: f.source,
      count:
        results[i].status === "fulfilled"
          ? (results[i] as PromiseFulfilledResult<NewsItem[]>).value.length
          : 0,
      ok: results[i].status === "fulfilled",
    }));

    return NextResponse.json(
      {
        items: sorted,
        total: sorted.length,
        source: "live" as const,
        breakdown,
        feedCount: FEEDS.length,
        feedStatus,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { items: [], total: 0, source: "live" as const, breakdown: {}, feedCount: 0, feedStatus: [] },
      { status: 500 }
    );
  }
}
