/**
 * Static supplement data — fields NOT available from World Bank API.
 * LPI scores (overall, customs, infrastructure, tracking, timeliness)
 * and trend are computed live in /api/logistics by comparing
 * DATA_YEAR vs PREV_DATA_YEAR overall scores.
 *
 * This file provides: carriers, avgDeliveryDays
 */

export interface LogisticsSupplement {
  countryCode: string;
  countryName: string;
  avgDeliveryDays: number;
  carriers: string[];
}

export const logisticsSupplement: LogisticsSupplement[] = [
  { countryCode: "SG", countryName: "Singapore",     avgDeliveryDays: 2,  carriers: ["DHL", "FedEx", "UPS", "SingPost"] },
  { countryCode: "FI", countryName: "Finland",        avgDeliveryDays: 3,  carriers: ["DHL", "PostNord", "Posti"] },
  { countryCode: "DE", countryName: "Germany",        avgDeliveryDays: 3,  carriers: ["DHL", "DPD", "Hermes", "GLS"] },
  { countryCode: "NL", countryName: "Netherlands",    avgDeliveryDays: 2,  carriers: ["PostNL", "DHL", "DPD", "GLS"] },
  { countryCode: "JP", countryName: "Japan",          avgDeliveryDays: 2,  carriers: ["Yamato", "Sagawa", "Japan Post", "Seino"] },
  { countryCode: "GB", countryName: "United Kingdom", avgDeliveryDays: 3,  carriers: ["Royal Mail", "DPD", "Hermes", "Yodel"] },
  { countryCode: "FR", countryName: "France",         avgDeliveryDays: 3,  carriers: ["La Poste", "DPD", "Colissimo", "Chronopost"] },
  { countryCode: "CA", countryName: "Canada",         avgDeliveryDays: 4,  carriers: ["Canada Post", "Purolator", "FedEx", "UPS"] },
  { countryCode: "US", countryName: "United States",  avgDeliveryDays: 3,  carriers: ["USPS", "UPS", "FedEx", "Amazon Logistics"] },
  { countryCode: "KR", countryName: "South Korea",    avgDeliveryDays: 2,  carriers: ["CJ Logistics", "Lotte Logistics", "Hanjin"] },
  { countryCode: "AE", countryName: "UAE",            avgDeliveryDays: 3,  carriers: ["Aramex", "DHL", "Emirates Post", "FedEx"] },
  { countryCode: "CN", countryName: "China",          avgDeliveryDays: 4,  carriers: ["SF Express", "ZTO", "YTO", "STO", "Yunda"] },
  { countryCode: "AU", countryName: "Australia",      avgDeliveryDays: 5,  carriers: ["Australia Post", "DHL", "FedEx", "Toll"] },
  { countryCode: "TH", countryName: "Thailand",       avgDeliveryDays: 4,  carriers: ["Kerry Express", "Flash Express", "SCG", "DHL"] },
  { countryCode: "IN", countryName: "India",          avgDeliveryDays: 6,  carriers: ["Delhivery", "BlueDart", "DTDC", "Ekart"] },
  { countryCode: "SA", countryName: "Saudi Arabia",   avgDeliveryDays: 5,  carriers: ["Aramex", "DHL", "FedEx", "Saudi Post"] },
  { countryCode: "ZA", countryName: "South Africa",   avgDeliveryDays: 7,  carriers: ["Aramex", "DHL", "Fastway", "SA Post"] },
  { countryCode: "BR", countryName: "Brazil",         avgDeliveryDays: 10, carriers: ["Correios", "JadLog", "Total Express", "Loggi"] },
  { countryCode: "MX", countryName: "Mexico",         avgDeliveryDays: 8,  carriers: ["Estafeta", "DHL", "FedEx", "UPS"] },
  { countryCode: "ID", countryName: "Indonesia",      avgDeliveryDays: 7,  carriers: ["JNE", "J&T Express", "SiCepat", "Pos Indonesia"] },
];

/** Quick lookup by ISO-2 country code */
export const supplementByCode = Object.fromEntries(
  logisticsSupplement.map((s) => [s.countryCode, s])
);
