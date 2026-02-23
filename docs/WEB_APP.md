# Web App Guide — Marketing Site

## Overview

The marketing website (`apps/web`) is the public-facing site for Accessories World Zimbabwe. It's built with **Next.js 16** and **Tailwind CSS v4**.

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Tailwind CSS v4** — Utility-first CSS framework
- **shadcn/ui** — Accessible UI components (manually configured)
- **Lucide React** — Icon library
- **Radix UI** — Accessible primitives
- **TanStack React Query** — Data fetching and caching

## Brand Theme

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#DC2626` | Primary red — energy, boldness |
| `brand-primary-light` | `#EF4444` | Hover states, accents |
| `brand-primary-dark` | `#991B1B` | Dark gradients |
| `brand-secondary` | `#111111` | Dark — elegance, contrast |
| `brand-secondary-light` | `#222222` | Hover states |
| `brand-accent` | `#DC2626` | Accent — same as primary |

### Usage in Tailwind

```html
<!-- Background -->
<div class="bg-brand-primary text-white">...</div>

<!-- Text -->
<p class="text-brand-primary">Special offer!</p>

<!-- Cards with hover -->
<div class="rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-md">...</div>
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

## Architecture

### No Sidebar

The web app does **not** use a sidebar. Admin and wholesaler sign-in are handled in their respective apps (`apps/admin` and the wholesaler app). Navigation is handled entirely by the Navbar.

### Dynamic Categories

Categories are **not** hardcoded. They are created by admin users in the admin app and stored in the database. The web app fetches them dynamically:

- **Homepage** — Server-side fetch with `revalidate: 600` (10 min cache)
- **Footer** — Server-side fetch with `revalidate: 3600` (1 hr cache)
- **Products page** — Client-side fetch via TanStack React Query

Categories have a relationship with Products via `categoryId` in the Prisma schema.

### Company Logo

The company logo (`/logo.jpg`) is used throughout the app:
- Navbar (desktop + mobile)
- Footer
- Loading page
- 404 page

## Components

### UI Components (`components/ui/`)

These are shadcn-style components with brand theming:

- **Button** — Primary, Secondary, Outline, Ghost, Link variants
- **Card** — With Header, Title, Description, Content, Footer
- **Sheet** — Slide-out panel (used for mobile navigation)
- **Badge** — Status badges
- **Separator** — Horizontal/vertical dividers
- **Skeleton** — Loading placeholders

### Layout Components (`components/`)

- **Navbar** — Sticky responsive navigation
  - Desktop: Logo, nav links (Products, About, Contact, Blog), Browse Products CTA
  - Mobile: Hamburger menu with Sheet slide-out
- **Footer** — 4-column responsive footer
  - Brand info with logo, address, phone, email
  - Quick links
  - Dynamic categories (fetched from API)
  - Legal links

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, dynamic categories, features, stats, testimonial, CTA |
| `/products` | Product catalog with search, category filters, and product grid |
| `/products/[slug]` | Product detail with images, pricing, quantity selector |
| `/about` | About page — mission, vision, values, story |
| `/contact` | Contact page — form, contact info, business hours |
| `/privacy` | Privacy policy (to be built) |
| `/terms` | Terms of service (to be built) |

## Design Principles

1. **Spacing** — Generous padding and margin. Sections use `py-20 sm:py-28`. Cards use `p-5` to `p-7`.
2. **Border radius** — `rounded-2xl` for cards, `rounded-xl` for inputs and icons, `rounded-lg` for buttons.
3. **Borders** — Subtle `border-border/60` for cards. Hover state: `hover:border-brand-primary/30`.
4. **Animations** — `transition-all duration-300` for cards. `hover:-translate-y-0.5` for lift effects. `hover:shadow-lg` for depth.
5. **Typography** — Simple, mid-level English. No jargon. Clear headings with `tracking-tight`.
6. **Responsive** — Mobile-first. Grid layouts collapse gracefully. Navbar uses Sheet for mobile.

## Environment Variables

Create a `.env` file in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api
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
- **Theme color** matching brand primary (#DC2626)

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
