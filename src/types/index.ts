export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: "logistics" | "platform" | "policy" | "market" | "technology" | "general";
  severity: "critical" | "high" | "medium" | "low";
  publishedAt: string;
  summary?: string;
  country?: string;
  tags?: string[];
}

export interface LogisticsData {
  countryCode: string;
  countryName: string;
  lpiScore: number;
  lpiRank: number;
  customsScore: number;
  infrastructureScore: number;
  trackingScore: number;
  timelinessScore: number;
  avgDeliveryDays: number;
  carriers: string[];
  status: "excellent" | "good" | "fair" | "poor";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface PlatformData {
  countryCode: string;
  countryName: string;
  platforms: PlatformPresence[];
  ecommerceGdpPercent: number;
  totalGmvBillion: number;
  activeShoppers: number;
  mobileCommerce: number;
  marketMaturity: "emerging" | "growing" | "mature" | "saturated";
}

export interface PlatformPresence {
  platformId: string;
  platformName: string;
  marketShare: number;
  status: "active" | "dominant" | "growing" | "limited";
  launchYear?: number;
}

export interface MapCountryData {
  countryCode: string;
  countryName: string;
  lpiScore?: number;
  ecommerceScore?: number;
  topPlatform?: string;
  gmvBillion?: number;
  status?: "hot" | "growing" | "stable" | "emerging";
}

export interface DataSourceMeta {
  source: "live" | "fallback";
  provider: string;
  providerUrl: string;
  indicator?: string;
  dataYear: number;
  fetchedAt: string;
}

export interface LogisticsApiResponse {
  items: LogisticsData[];
  meta: DataSourceMeta;
}

export interface MarketMetric {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
}
