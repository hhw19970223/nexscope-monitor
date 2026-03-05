export const siteConfig = {
  name: "NexScope Monitor",
  tagline: "Global E-Commerce Intelligence Dashboard",
  description:
    "Real-time monitoring of global e-commerce platforms, logistics performance, and market news across 50+ countries.",
  url: "https://nexscope-monitor.vercel.app",
  brand: "#4C88F1",
  nav: [
    { label: "Dashboard", href: "/" },
    { label: "Logistics", href: "#logistics" },
    { label: "Platforms", href: "#platforms" },
    { label: "News", href: "#news" },
  ],
  regions: [
    { id: "global", label: "Global" },
    { id: "na", label: "Americas" },
    { id: "eu", label: "Europe" },
    { id: "apac", label: "Asia-Pacific" },
    { id: "mena", label: "MENA" },
    { id: "latam", label: "Latin America" },
  ],
  platforms: [
    { id: "amazon", name: "Amazon", color: "#FF9900" },
    { id: "alibaba", name: "Alibaba", color: "#FF6A00" },
    { id: "shopify", name: "Shopify", color: "#96BF48" },
    { id: "ebay", name: "eBay", color: "#E53238" },
    { id: "jd", name: "JD.com", color: "#CC0000" },
    { id: "mercadolibre", name: "MercadoLibre", color: "#FFE600" },
    { id: "lazada", name: "Lazada", color: "#F57224" },
    { id: "zalando", name: "Zalando", color: "#FF6900" },
    { id: "rakuten", name: "Rakuten", color: "#BF0000" },
    { id: "flipkart", name: "Flipkart", color: "#2874F0" },
  ],
};

export type SiteConfig = typeof siteConfig;
