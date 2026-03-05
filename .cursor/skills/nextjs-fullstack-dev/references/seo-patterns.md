# SEO Patterns for Next.js

## Metadata Pattern

```tsx
// app/[slug]/page.tsx
import { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPage(params.slug);
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://example.com/${params.slug}`,
      images: [{ url: page.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: `https://example.com/${params.slug}` },
  };
}
```

## JSON-LD Structured Data

```tsx
// components/JsonLd.tsx
export function OrganizationSchema({ name, url, logo }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name,
          url,
          logo,
        }),
      }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}
```

## Sitemap Generation

```tsx
// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();
  return [
    { url: "https://example.com", lastModified: new Date(), priority: 1.0 },
    ...pages.map((page) => ({
      url: `https://example.com/${page.slug}`,
      lastModified: page.updatedAt,
      priority: 0.8,
    })),
  ];
}
```

## robots.txt

```tsx
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## Programmatic SEO

For scalable page generation with dynamic routes:

```tsx
// app/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  const items = await getAllItems();
  return items.map((item) => ({
    category: item.category,
    slug: item.slug,
  }));
}
```

- Use `generateStaticParams()` for ISG/SSG at scale
- Set canonical URLs to avoid duplicate content
- Build internal linking between related pages
- Auto-generate meta descriptions from content

## Multi-Region / Geo SEO

```tsx
// next.config.ts — hreflang via alternates
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      languages: {
        "en-US": `/en/${params.slug}`,
        "zh-CN": `/zh/${params.slug}`,
      },
    },
  };
}
```

- Add `hreflang` tags for multi-language pages
- Use `LocalBusiness` schema for location-based content
- Include geographic keywords naturally in content
