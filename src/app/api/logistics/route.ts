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
 * Fallback: returns 2023 static data if World Bank API is unreachable.
 * Cache: revalidates every 24 hours (LPI data is updated annually).
 */

import { NextResponse } from "next/server";
import { logisticsSupplement } from "@/lib/data/logistics";
import type { LogisticsData, LogisticsApiResponse } from "@/types";

export const runtime = "edge";
export const revalidate = 86400; // 24 hours — WB LPI is annual data

// ─── Config ──────────────────────────────────────────────────────────────────

const WB_BASE = "https://api.worldbank.org/v2";
const DATA_YEAR = "2023";

const COUNTRY_CODES = logisticsSupplement.map((s) => s.countryCode).join(";");

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

async function fetchIndicator(indicator: string): Promise<Map<string, number>> {
  const url =
    `${WB_BASE}/country/${COUNTRY_CODES}/indicator/${indicator}` +
    `?format=json&date=${DATA_YEAR}&per_page=100`;

  console.log(url);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`WB API ${indicator}: HTTP ${res.status}`);

  const json = await res.json() as [unknown, WBPoint[]];
  const points = json[1] ?? [];

  // Build country-code → value map (skip nulls)
  return new Map(
    points
      .filter((p) => p.value !== null && p.value !== undefined)
      .map((p) => [p.country.id, p.value as number])
  );
}

// ─── Score → status helper ────────────────────────────────────────────────────

function toStatus(score: number): LogisticsData["status"] {
  if (score >= 4.0) return "excellent";
  if (score >= 3.5) return "good";
  if (score >= 3.0) return "fair";
  return "poor";
}

// ─── Static fallback (2023 WB LPI values, hardcoded as last resort) ───────────

const FALLBACK_SCORES: Record<string, Pick<LogisticsData, "lpiScore" | "customsScore" | "infrastructureScore" | "trackingScore" | "timelinessScore">> = {
  SG: { lpiScore: 4.30, customsScore: 4.20, infrastructureScore: 4.40, trackingScore: 4.50, timelinessScore: 4.70 },
  FI: { lpiScore: 4.20, customsScore: 4.10, infrastructureScore: 4.30, trackingScore: 4.30, timelinessScore: 4.50 },
  DE: { lpiScore: 4.20, customsScore: 4.00, infrastructureScore: 4.30, trackingScore: 4.30, timelinessScore: 4.40 },
  NL: { lpiScore: 4.10, customsScore: 4.00, infrastructureScore: 4.20, trackingScore: 4.30, timelinessScore: 4.50 },
  JP: { lpiScore: 4.00, customsScore: 3.90, infrastructureScore: 4.10, trackingScore: 4.30, timelinessScore: 4.50 },
  GB: { lpiScore: 4.00, customsScore: 3.80, infrastructureScore: 4.00, trackingScore: 4.10, timelinessScore: 4.30 },
  FR: { lpiScore: 4.00, customsScore: 3.90, infrastructureScore: 4.00, trackingScore: 4.10, timelinessScore: 4.20 },
  CA: { lpiScore: 3.90, customsScore: 3.80, infrastructureScore: 4.00, trackingScore: 4.00, timelinessScore: 4.10 },
  US: { lpiScore: 3.90, customsScore: 3.80, infrastructureScore: 4.00, trackingScore: 4.20, timelinessScore: 4.10 },
  KR: { lpiScore: 3.80, customsScore: 3.80, infrastructureScore: 3.90, trackingScore: 4.10, timelinessScore: 4.20 },
  AE: { lpiScore: 3.80, customsScore: 3.70, infrastructureScore: 3.90, trackingScore: 3.80, timelinessScore: 4.00 },
  CN: { lpiScore: 3.70, customsScore: 3.70, infrastructureScore: 3.90, trackingScore: 3.90, timelinessScore: 3.80 },
  AU: { lpiScore: 3.70, customsScore: 3.60, infrastructureScore: 3.70, trackingScore: 3.90, timelinessScore: 3.80 },
  TH: { lpiScore: 3.40, customsScore: 3.30, infrastructureScore: 3.40, trackingScore: 3.40, timelinessScore: 3.60 },
  IN: { lpiScore: 3.40, customsScore: 3.20, infrastructureScore: 3.30, trackingScore: 3.50, timelinessScore: 3.50 },
  SA: { lpiScore: 3.30, customsScore: 3.20, infrastructureScore: 3.40, trackingScore: 3.20, timelinessScore: 3.50 },
  ZA: { lpiScore: 3.10, customsScore: 3.00, infrastructureScore: 3.10, trackingScore: 3.10, timelinessScore: 3.30 },
  BR: { lpiScore: 3.00, customsScore: 2.70, infrastructureScore: 2.90, trackingScore: 3.10, timelinessScore: 3.20 },
  MX: { lpiScore: 3.00, customsScore: 2.80, infrastructureScore: 2.90, trackingScore: 3.10, timelinessScore: 3.30 },
  ID: { lpiScore: 3.00, customsScore: 2.80, infrastructureScore: 2.80, trackingScore: 3.10, timelinessScore: 3.20 },
};

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse<LogisticsApiResponse>> {
  const fetchedAt = new Date().toISOString();

  try {
    // Fetch all 5 indicators in parallel — eliminates waterfall latency
    const [overall, customs, infrastructure, tracking, timeliness] =
      await Promise.all([
        fetchIndicator(INDICATORS.overall),
        fetchIndicator(INDICATORS.customs),
        fetchIndicator(INDICATORS.infrastructure),
        fetchIndicator(INDICATORS.tracking),
        fetchIndicator(INDICATORS.timeliness),
      ]);

    // Require at least the overall score for a country to be included
    if (overall.size === 0) throw new Error("World Bank returned empty dataset");

    // Merge live WB scores with static supplement (carriers, delivery, trend)
    const items: LogisticsData[] = logisticsSupplement
      .filter((s) => overall.has(s.countryCode))
      .map((s) => {
        const code = s.countryCode;
        const score = overall.get(code)!;
        return {
          countryCode:           code,
          countryName:           s.countryName,
          lpiScore:              score,
          lpiRank:               s.lpiRank,
          customsScore:         customs.get(code)        ?? score,
          infrastructureScore:  infrastructure.get(code) ?? score,
          trackingScore:        tracking.get(code)       ?? score,
          timelinessScore:      timeliness.get(code)     ?? score,
          avgDeliveryDays:      s.avgDeliveryDays,
          carriers:             s.carriers,
          status:               toStatus(score),
          trend:                s.trend,
          lastUpdated:          fetchedAt,
        };
      })
      .sort((a, b) => b.lpiScore - a.lpiScore);

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
    // Graceful fallback: return 2023 hardcoded values so UI never breaks
    console.error("[/api/logistics] World Bank fetch failed:", err);

    const items: LogisticsData[] = logisticsSupplement.map((s) => {
      const scores = FALLBACK_SCORES[s.countryCode];
      return {
        countryCode:           s.countryCode,
        countryName:           s.countryName,
        lpiScore:              scores?.lpiScore              ?? 3.0,
        lpiRank:               s.lpiRank,
        customsScore:         scores?.customsScore         ?? 3.0,
        infrastructureScore:  scores?.infrastructureScore  ?? 3.0,
        trackingScore:        scores?.trackingScore        ?? 3.0,
        timelinessScore:      scores?.timelinessScore      ?? 3.0,
        avgDeliveryDays:      s.avgDeliveryDays,
        carriers:             s.carriers,
        status:               toStatus(scores?.lpiScore ?? 3.0),
        trend:                s.trend,
        lastUpdated:          fetchedAt,
      };
    }).sort((a, b) => b.lpiScore - a.lpiScore);

    const body: LogisticsApiResponse = {
      items,
      meta: {
        source:      "fallback",
        provider:    "World Bank LPI 2023 (cached)",
        providerUrl: "https://lpi.worldbank.org/",
        indicator:   Object.values(INDICATORS).join(", "),
        dataYear:    2023,
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
