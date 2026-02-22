# Web App Guide — Marketing Site

## Overview

The marketing website (`apps/web`) is the public-facing site for Accessories World Zimbabwe. It's built with **Next.js 16** and **Tailwind CSS v4**.

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Tailwind CSS v4** — Utility-first CSS framework
- **shadcn/ui** — Accessible UI components (manually configured)
- **Lucide React** — Icon library
- **Radix UI** — Accessible primitives

## Brand Theme

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#1E40AF` | Primary blue — trust, technology |
| `brand-primary-light` | `#3B82F6` | Hover states, accents |
| `brand-primary-dark` | `#1E3A5F` | Dark gradients |
| `brand-secondary` | `#F97316` | Orange — CTAs, energy |
| `brand-secondary-light` | `#FB923C` | Hover states |
| `brand-accent` | `#0EA5E9` | Sky blue — freshness |

### Usage in Tailwind

```html
<!-- Background -->
<div class="bg-brand-primary text-white">...</div>

<!-- Text -->
<p class="text-brand-secondary">Special offer!</p>

<!-- Gradients -->
<section class="bg-gradient-to-r from-brand-primary to-brand-accent">...</section>
```

### CSS Variables

The app uses CSS custom properties for theming (light/dark mode support):

```css
var(--primary)          /* Brand primary color */
var(--secondary)        /* Brand secondary color */
var(--background)       /* Page background */
var(--foreground)       /* Main text color */
var(--muted)            /* Muted backgrounds */
var(--muted-foreground) /* Secondary text */
var(--card)             /* Card background */
var(--border)           /* Border color */
```

## Components

### UI Components (`components/ui/`)

These are shadcn-style components with brand theming:

- **Button** — Primary (blue), Secondary (orange), Outline, Ghost, Link variants
- **Card** — With Header, Title, Description, Content, Footer
- **Sheet** — Slide-out panel (used for mobile navigation)
- **Badge** — Status badges
- **Separator** — Horizontal/vertical dividers

### Layout Components (`components/`)

- **Navbar** — Sticky responsive navigation
  - Desktop: Logo, nav links, Wholesaler/Admin sign-in buttons
  - Mobile: Hamburger menu with Sheet slide-out
- **Footer** — 4-column responsive footer
  - Brand info with address and phone
  - Quick links, categories, portal links

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, features, wholesaler CTA |
| `/products` | Product catalog (to be built) |
| `/about` | About page (to be built) |
| `/contact` | Contact page (to be built) |
| `/privacy` | Privacy policy (to be built) |
| `/terms` | Terms of service (to be built) |

## Environment Variables

Create a `.env` file in `apps/web/`:

```env
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_WHOLESALER_URL=http://localhost:3002
NEXT_PUBLIC_BLOG_URL=http://localhost:4321
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## SEO

The app has comprehensive SEO configuration in `layout.tsx`:

- **Title template**: `%s | Accessories World Zimbabwe`
- **OpenGraph** with locale `en_ZW`
- **Twitter cards** with summary_large_image
- **Robots** configuration for proper indexing
- **Keywords** targeting mobile accessories in Zimbabwe
- **Theme color** matching brand primary

## Adding New Pages

1. Create a new directory under `app/`:
   ```
   app/products/page.tsx
   ```

2. Export metadata for SEO:
   ```typescript
   export const metadata: Metadata = {
     title: "Products",
     description: "Browse our full range of mobile accessories and gadgets.",
   };
   ```

3. Build your page using the UI components and brand theme classes.

## Adding shadcn Components

Components are manually set up (not via CLI). To add a new one:

1. Create the component in `components/ui/`
2. Use `cn()` from `@/lib/utils` for class merging
3. Follow the brand color tokens for consistency
