/**
 * Static supplement data — fields NOT available from World Bank API.
 * LPI scores (overall, customs, infrastructure, tracking, timeliness)
 * are fetched live from: https://api.worldbank.org/v2/
 *
 * This file provides: carriers, avgDeliveryDays, trend, lpiRank (2023 baseline)
 */

export interface LogisticsSupplement {
  countryCode: string;
  countryName: string;
  lpiRank: number;       // 2023 World Bank rank (used as fallback ordering)
  avgDeliveryDays: number;
  carriers: string[];
  trend: "up" | "down" | "stable";
}

export const logisticsSupplement: LogisticsSupplement[] = [
  { countryCode: "SG", countryName: "Singapore",     lpiRank: 1,  avgDeliveryDays: 2,  trend: "stable", carriers: ["DHL", "FedEx", "UPS", "SingPost"] },
  { countryCode: "FI", countryName: "Finland",        lpiRank: 2,  avgDeliveryDays: 3,  trend: "up",     carriers: ["DHL", "PostNord", "Posti"] },
  { countryCode: "DE", countryName: "Germany",        lpiRank: 3,  avgDeliveryDays: 3,  trend: "stable", carriers: ["DHL", "DPD", "Hermes", "GLS"] },
  { countryCode: "NL", countryName: "Netherlands",    lpiRank: 4,  avgDeliveryDays: 2,  trend: "stable", carriers: ["PostNL", "DHL", "DPD", "GLS"] },
  { countryCode: "JP", countryName: "Japan",          lpiRank: 7,  avgDeliveryDays: 2,  trend: "stable", carriers: ["Yamato", "Sagawa", "Japan Post", "Seino"] },
  { countryCode: "GB", countryName: "United Kingdom", lpiRank: 8,  avgDeliveryDays: 3,  trend: "down",   carriers: ["Royal Mail", "DPD", "Hermes", "Yodel"] },
  { countryCode: "FR", countryName: "France",         lpiRank: 9,  avgDeliveryDays: 3,  trend: "stable", carriers: ["La Poste", "DPD", "Colissimo", "Chronopost"] },
  { countryCode: "CA", countryName: "Canada",         lpiRank: 14, avgDeliveryDays: 4,  trend: "stable", carriers: ["Canada Post", "Purolator", "FedEx", "UPS"] },
  { countryCode: "US", countryName: "United States",  lpiRank: 12, avgDeliveryDays: 3,  trend: "stable", carriers: ["USPS", "UPS", "FedEx", "Amazon Logistics"] },
  { countryCode: "KR", countryName: "South Korea",    lpiRank: 16, avgDeliveryDays: 2,  trend: "up",     carriers: ["CJ Logistics", "Lotte Logistics", "Hanjin"] },
  { countryCode: "AE", countryName: "UAE",            lpiRank: 17, avgDeliveryDays: 3,  trend: "up",     carriers: ["Aramex", "DHL", "Emirates Post", "FedEx"] },
  { countryCode: "CN", countryName: "China",          lpiRank: 19, avgDeliveryDays: 4,  trend: "up",     carriers: ["SF Express", "ZTO", "YTO", "STO", "Yunda"] },
  { countryCode: "AU", countryName: "Australia",      lpiRank: 21, avgDeliveryDays: 5,  trend: "stable", carriers: ["Australia Post", "DHL", "FedEx", "Toll"] },
  { countryCode: "TH", countryName: "Thailand",       lpiRank: 36, avgDeliveryDays: 4,  trend: "up",     carriers: ["Kerry Express", "Flash Express", "SCG", "DHL"] },
  { countryCode: "IN", countryName: "India",          lpiRank: 38, avgDeliveryDays: 6,  trend: "up",     carriers: ["Delhivery", "BlueDart", "DTDC", "Ekart"] },
  { countryCode: "SA", countryName: "Saudi Arabia",   lpiRank: 43, avgDeliveryDays: 5,  trend: "up",     carriers: ["Aramex", "DHL", "FedEx", "Saudi Post"] },
  { countryCode: "ZA", countryName: "South Africa",   lpiRank: 52, avgDeliveryDays: 7,  trend: "stable", carriers: ["Aramex", "DHL", "Fastway", "SA Post"] },
  { countryCode: "BR", countryName: "Brazil",         lpiRank: 56, avgDeliveryDays: 10, trend: "up",     carriers: ["Correios", "JadLog", "Total Express", "Loggi"] },
  { countryCode: "MX", countryName: "Mexico",         lpiRank: 61, avgDeliveryDays: 8,  trend: "stable", carriers: ["Estafeta", "DHL", "FedEx", "UPS"] },
  { countryCode: "ID", countryName: "Indonesia",      lpiRank: 63, avgDeliveryDays: 7,  trend: "up",     carriers: ["JNE", "J&T Express", "SiCepat", "Pos Indonesia"] },
];

/** Quick lookup by ISO-2 country code */
export const supplementByCode = Object.fromEntries(
  logisticsSupplement.map((s) => [s.countryCode, s])
);
