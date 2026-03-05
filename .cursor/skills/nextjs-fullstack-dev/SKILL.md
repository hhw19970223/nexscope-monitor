---
name: nextjs-fullstack-dev
description: Unified development workflow for Next.js projects with TypeScript, Tailwind CSS, shadcn/ui, and SEO optimization. Use when building, modifying, or reviewing Next.js web applications — covers component architecture, responsive design, accessibility, SEO, performance, i18n, and documentation. Triggers on frontend development, page creation, component building, website optimization, or any Next.js coding task.
---

# Next.js Fullstack Development

Unified workflow combining React best practices, design guidelines, component architecture, SEO optimization, and documentation standards for Next.js App Router projects.

## Tech Stack

- **Next.js** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** + **lucide-react** icons
- **next-intl** for i18n (externalize all user-facing text)
- **next/image** for image optimization
- **Playwright** for E2E testing
- **react-hook-form** + **zod** for forms

## Project Structure

```
src/
├── app/                  # App Router pages + layouts
│   └── README.md         # Page structure documentation
├── components/
│   ├── ui/               # shadcn/ui (auto-generated)
│   ├── atoms/            # Basic: Button, Input, Badge
│   │   └── README.md     # Atom documentation
│   ├── molecules/        # Composite: FormInput, TabSwitcher
│   │   └── README.md     # Molecule documentation
│   └── organisms/        # Complex: Header/, Footer, HeroSection
│       └── README.md     # Organism documentation
├── config/
│   ├── site.ts           # Theme, brand, nav, SEO config
│   └── README.md         # Config documentation
├── hooks/                # Custom React hooks
├── lib/
│   ├── utils.ts          # cn() helper + utilities
│   └── README.md         # Lib documentation
├── types/                # TypeScript definitions
├── messages/             # i18n JSON files (en.json, zh.json...)
└── styles/globals.css
e2e/                      # Playwright E2E tests
├── README.md             # Test documentation
├── home.spec.ts          # Homepage tests
├── auth.spec.ts          # Auth flow tests
├── seo.spec.ts           # SEO tests
└── accessibility.spec.ts # A11y tests
```

## Documentation Standards (MANDATORY)

**Every module/directory MUST have a README.md** explaining:

1. **Purpose** - What this module does
2. **Structure** - Files and their roles
3. **Usage** - Code examples
4. **Guidelines** - When to add/modify

Example README template:

```markdown
# {Module Name}

{Brief description}

## Structure

| File | Description |
|------|-------------|
| `file.tsx` | Description |

## Usage

\`\`\`tsx
import { X } from "@/components/{module}/X"
\`\`\`

## Guidelines

- Rule 1
- Rule 2
```

## Component Size Limits (MANDATORY)

**Maximum lines per file:**

| Type | Max Lines | Action if exceeded |
|------|-----------|-------------------|
| Atom | 50 | Keep simple |
| Molecule | 80 | Extract to atoms |
| Organism | 150 | Split into subcomponents |
| Page | 120 | Extract sections to organisms |

**Split strategy:**

1. Create subfolder: `ComponentName/`
2. Main file: `index.tsx` (exports, composition)
3. Subcomponents: `SubPart.tsx`
4. Add `README.md` to folder

Example Header split:

```
Header/
├── index.tsx       # Main (70 lines) - imports and composes
├── DesktopNav.tsx  # Desktop nav (30 lines)
├── MobileNav.tsx   # Mobile drawer (45 lines)
└── README.md       # Documentation
```

## Development Workflow

### 1. Before Coding

- Read `src/config/site.ts` for theme color, brand name, nav links
- Check existing README.md files for context
- Identify component hierarchy: atoms → molecules → organisms
- Plan Server vs Client components

### 2. Component Rules

**Server Components (default):**
- Data fetching, database access, sensitive logic
- Use `async/await` directly

**Client Components (`"use client"`):**
- Event handlers, React hooks, Browser APIs

### 3. Styling Rules

- **Mobile-first**: base styles, add `sm:` / `md:` / `lg:` breakpoints
- **Touch targets**: minimum 44×44px
- **Colors**: use CSS variables from theme
- **Dark mode**: use `dark:` variant

### 4. Accessibility (WCAG 2.1 AA)

- Semantic HTML: `<nav>`, `<main>`, `<article>`, etc.
- All images: `alt` text
- Color contrast >= 4.5:1
- Keyboard navigation with visible focus

### 5. SEO Optimization (MANDATORY)

**All SEO configuration MUST be in English.**

Per-page metadata via `layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Page Title",
  description: "Description in English",
}
```

Required files: `sitemap.ts`, `robots.ts`, JSON-LD in layout.

### 6. i18n (MANDATORY)

**All user-facing text MUST be externalized.**

- Use `useTranslations()` in Client Components
- Use `getTranslations()` in Server Components
- Never hardcode display text

### 7. E2E Testing

Test files in `e2e/` directory:

```bash
npm run test:e2e      # Run all tests
npm run test:e2e:ui   # Interactive UI mode
```

Coverage areas:
- Page rendering and navigation
- Form interactions
- SEO meta tags
- Accessibility

## Quality Checklist

Run before every commit:

```bash
npm run lint          # Zero errors/warnings
npm run build         # TypeScript compiles cleanly
npm run test:e2e      # E2E tests pass
```

Verify:
- [ ] README.md in every new module
- [ ] No file exceeds size limits
- [ ] All text externalized (i18n)
- [ ] Meta tags on every page (English)
- [ ] sitemap.ts + robots.ts present
- [ ] Images optimized with next/image
- [ ] Loading + error states implemented
