/**
 * /api/logistics
 *
 * Fetches live Logistics Performance Index data from the World Bank Open API.
 * Indicators used (all free, no key required):
 *   LP.LPI.OVRL.XQ  Overall LPI score (1–5)
 *   LP.LPI.CUST.XQ  Customs efficiency
 *   LP.LPI.INFR.XQ  Infrastructure quality
 *   LP.LPI.TRAC.XQ  Tracking & tracing
 *   LP.LPI.TIME.XQ  Timeliness
 *
 * Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 * Data: https://lpi.worldbank.org/
 *
 * Trend calculation:
 *   Both DATA_YEAR and PREV_DATA_YEAR overall scores are fetched.
 *   Countries are ranked (by score, descending) for each year independently
 *   among the tracked set. Rank delta determines trend:
 *     prev_rank > curr_rank → "up"   (improved position)
 *     prev_rank < curr_rank → "down" (worsened position)
 *     |delta| <= 1          → "stable"
 *
 * Cache: revalidates every 24 hours (LPI data is updated annually).
 */

import { NextResponse } from "next/server";
import { logisticsSupplement } from "@/lib/data/logistics";
import type { LogisticsData, LogisticsApiResponse } from "@/types";
import { DATA_YEAR, PREV_DATA_YEAR } from "@/lib/const";

export const runtime = "edge";
export const revalidate = 86400;

// ─── Config ──────────────────────────────────────────────────────────────────

const COUNTRY_CODES = logisticsSupplement.map((s) => s.countryCode).join(";");
const WB_BASE = `https://api.worldbank.org/v2/country/${COUNTRY_CODES}/indicator/`;

const INDICATORS = {
  overall:        "LP.LPI.OVRL.XQ",
  customs:        "LP.LPI.CUST.XQ",
  infrastructure: "LP.LPI.INFR.XQ",
  tracking:       "LP.LPI.TRAC.XQ",
  timeliness:     "LP.LPI.TIME.XQ",
} as const;

// ─── World Bank API helpers ───────────────────────────────────────────────────

interface WBPoint {
  country: { id: string; value: string };
  value: number | null;
  date: string;
}

async function fetchIndicator(
  indicator: string,
  year: string
): Promise<Map<string, number>> {
  const url =
    `${WB_BASE}${indicator}` +
    `?format=json&date=${year}&per_page=100`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`WB API ${indicator}@${year}: HTTP ${res.status}`);

  const json = await res.json() as [unknown, WBPoint[]];
  const points = json[1] ?? [];

  return new Map(
    points
      .filter((p) => p.value !== null && p.value !== undefined)
      .map((p) => [p.country.id, p.value as number])
  );
}

// ─── Rank map builder ─────────────────────────────────────────────────────────
//
// Derives a rank (1 = best) among the tracked country set by sorting
// their scores descending. Using derived rank (not WB official rank)
// keeps comparisons consistent when the tracked set changes.

function buildRankMap(scoreMap: Map<string, number>): Map<string, number> {
  const sorted = [...scoreMap.entries()].sort((a, b) => b[1] - a[1]);
  const rankMap = new Map<string, number>();
  sorted.forEach(([code], idx) => rankMap.set(code, idx + 1));
  return rankMap;
}

// ─── Trend calculator ─────────────────────────────────────────────────────────

function calcTrend(
  code: string,
  currRankMap: Map<string, number>,
  prevRankMap: Map<string, number>
): LogisticsData["trend"] {
  const curr = currRankMap.get(code);
  const prev = prevRankMap.get(code);

  // Can't determine if either year has no data
  if (curr === undefined || prev === undefined) return "stable";

  const delta = prev - curr; // positive = rank improved (lower number = better)
  if (delta >= 2) return "up";
  if (delta <= -2) return "down";
  return "stable";
}

// ─── Score → status helper ────────────────────────────────────────────────────

function toStatus(score: number): LogisticsData["status"] {
  if (score >= 4.0) return "excellent";
  if (score >= 3.5) return "good";
  if (score >= 3.0) return "fair";
  return "poor";
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse<LogisticsApiResponse>> {
  const fetchedAt = new Date().toISOString();

  try {
    // Fetch all indicators for current year + overall for previous year in parallel
    const [overall, customs, infrastructure, tracking, timeliness, prevOverall] =
      await Promise.all([
        fetchIndicator(INDICATORS.overall,        DATA_YEAR),
        fetchIndicator(INDICATORS.customs,        DATA_YEAR),
        fetchIndicator(INDICATORS.infrastructure, DATA_YEAR),
        fetchIndicator(INDICATORS.tracking,       DATA_YEAR),
        fetchIndicator(INDICATORS.timeliness,     DATA_YEAR),
        fetchIndicator(INDICATORS.overall,        PREV_DATA_YEAR),
      ]);

    if (overall.size === 0) throw new Error("World Bank returned empty dataset");

    // Build rank maps for trend comparison
    const currRankMap = buildRankMap(overall);
    const prevRankMap = buildRankMap(prevOverall);

    const items: LogisticsData[] = logisticsSupplement
      .filter((s) => overall.has(s.countryCode))
      .map((s) => {
        const code = s.countryCode;
        const score = overall.get(code)!;
        return {
          countryCode:          code,
          countryName:          s.countryName,
          lpiScore:             score,
          lpiRank:              currRankMap.get(code)!,
          customsScore:         customs.get(code)        ?? score,
          infrastructureScore:  infrastructure.get(code) ?? score,
          trackingScore:        tracking.get(code)       ?? score,
          timelinessScore:      timeliness.get(code)     ?? score,
          avgDeliveryDays:      s.avgDeliveryDays,
          carriers:             s.carriers,
          status:               toStatus(score),
          trend:                calcTrend(code, currRankMap, prevRankMap),
          lastUpdated:          fetchedAt,
        };
      })
      .sort((a, b) => a.lpiRank - b.lpiRank);

    const body: LogisticsApiResponse = {
      items,
      meta: {
        source:      "live",
        provider:    "World Bank Open Data — Logistics Performance Index",
        providerUrl: "https://lpi.worldbank.org/",
        indicator:   Object.values(INDICATORS).join(", "),
        dataYear:    parseInt(DATA_YEAR),
        fetchedAt,
      },
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });

  } catch (err) {
    console.error("[/api/logistics] World Bank fetch failed:", err);

    const body: LogisticsApiResponse = {
      items: [],
      meta: {
        source:      "fallback",
        provider:    `World Bank LPI ${DATA_YEAR} (cached)`,
        providerUrl: "https://lpi.worldbank.org/",
        indicator:   Object.values(INDICATORS).join(", "),
        dataYear:    parseInt(DATA_YEAR),
        fetchedAt,
      },
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  }
}
