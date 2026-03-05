import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/organisms/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexScope Monitor — Global E-Commerce Intelligence Dashboard",
    template: "%s | NexScope Monitor",
  },
  description:
    "Real-time monitoring of global e-commerce platforms, logistics performance, shipping data, and market news across 50+ countries. Track Amazon, Alibaba, Shopify, and more.",
  keywords: [
    "e-commerce monitor",
    "logistics dashboard",
    "global shipping tracker",
    "ecommerce analytics",
    "supply chain intelligence",
    "amazon logistics",
    "alibaba monitoring",
    "shopify analytics",
    "world logistics performance index",
  ],
  authors: [{ name: "NexScope" }],
  creator: "NexScope",
  metadataBase: new URL("https://nexscope-monitor.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexscope-monitor.vercel.app",
    title: "NexScope Monitor — Global E-Commerce Intelligence Dashboard",
    description:
      "Real-time e-commerce intelligence: logistics performance, platform market share, shipping data, and news across 50+ countries.",
    siteName: "NexScope Monitor",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexScope Monitor",
    description: "Global E-Commerce Intelligence Dashboard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: "#060b14", fontFamily: "'DM Mono', monospace" }}>
        <TooltipProvider>
          <Header />
          <main>{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
