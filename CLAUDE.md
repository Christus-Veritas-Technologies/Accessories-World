# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (from root)
bun install

# Development — run all apps concurrently
bun dev

# Run a single app
cd apps/admin && bun dev        # http://localhost:3001
cd apps/server && bun dev       # http://localhost:3003
cd apps/web && bun dev          # http://localhost:3000
cd apps/wholesalers && bun dev  # http://localhost:3002
cd apps/blog && bun dev         # http://localhost:4321
cd apps/agent && bun dev        # WhatsApp agent

# Build
bun run build

# Lint / type-check
bun run lint
bun run check-types

# Database (run from packages/db)
bunx prisma generate          # Regenerate Prisma client after schema changes
bunx prisma migrate dev       # Create and apply a new migration
bunx prisma db push           # Push schema changes without a migration (dev only)
bunx prisma studio            # Open Prisma Studio GUI
```

## Architecture

This is a **Bun + Turborepo monorepo** for an accessories retail business in Mutare, Zimbabwe.

```
apps/
  web/          Next.js 16 — public marketing site (port 3000)
  admin/        Next.js 16 — internal admin dashboard (port 3001)
  wholesalers/  Next.js 16 — wholesaler portal (port 3002)
  blog/         Astro — blog (port 4321)
  server/       Hono (Bun) — REST API backend (port 3003)
  agent/        Bun + whatsapp-web.js — WhatsApp messaging agent (port 3004)
packages/
  db/           Prisma 7 client shared across all apps
  ui/           Shared shadcn/ui component library
  eslint-config/
  typescript-config/
```

### Backend (`apps/server`)

A **Hono** API server running on Bun. All routes are under `/api/`. Route files live in `src/routes/`. Auth is enforced via `src/middleware/auth.ts` (`requireAdmin` middleware). All admin-facing routes are grouped under `/api/admin/*`.

Key routes:
- `/api/auth` — sign-in/sign-out for admins and wholesalers
- `/api/admin/*` — products, categories, KPIs, sales, customers, accounts, wholesalers, orders
- `/api/products` and `/api/categories` — public product catalog
- `/api/wholesalers` — wholesaler-specific endpoints
- `/api/contact` and `/api/testimonials` — public-facing forms

### Admin Dashboard (`apps/admin`)

A **Next.js 16 + React 19** app. All data fetching goes through the Hono API (never direct DB access). Uses **TanStack Query** for server state. All React Query hooks are centralized in `src/hooks/queries.ts`. The API base URL is `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3003/api`).

Authentication uses an HTTP-only cookie (`adminToken`). The `src/middleware.ts` file guards all routes, redirecting to `/login` if the cookie is absent.

UI components are shadcn/ui installed into `src/components/ui/`. Feature dialogs (create/edit forms) live in `src/components/`.

### Database (`packages/db`)

**Prisma 7** with PostgreSQL, using `@prisma/adapter-pg`. The client is generated to `src/generated/prisma/`. Import the singleton client with `import { prisma } from "@repo/db"`.

Key models:
- `Admin` / `Wholesaler` / `Session` — authentication
- `Product` / `ProductImage` / `Category` — product catalog with dual pricing (`retailPrice` vs `wholesalePrice`)
- `Order` / `OrderItem` — wholesale orders placed by wholesalers
- `Sale` / `Customer` — retail sales tracked by admins (separate from wholesale orders)
- `Testimonial`, `ContactSubmission`, `ProductView` — marketing/analytics

### WhatsApp Agent (`apps/agent`)

A Hono server that wraps **whatsapp-web.js** (Puppeteer-based). It persists WhatsApp auth state in `.wwebjs_auth/`. Exposes HTTP endpoints called by the server app to send automated messages (invoices, follow-ups) when sales are created.

## Key Concepts

**Dual pricing**: Products have `retailPrice` (shown on `apps/web`) and `wholesalePrice` (shown in `apps/wholesalers`). Never expose `wholesalePrice` through the public API.

**Two sale flows**: "Orders" are wholesale orders placed by Wholesaler accounts. "Sales" are retail sales manually recorded by admins and linked to `Customer` records with WhatsApp numbers.

**Authentication**: Session-based with tokens in HTTP-only cookies. No public signup — admins and wholesalers are created by a SUPER_ADMIN. Wholesalers must also have `approved: true` to access pricing.

**Prisma 7 requires ESM**: All apps use `"type": "module"`. The Prisma client must be regenerated after every schema change (`bunx prisma generate` from `packages/db`).

## Environment Variables

| App | Key env vars |
|-----|-------------|
| `packages/db` | `DATABASE_URL` (PostgreSQL connection string) |
| `apps/server` | `WEB_URL`, `ADMIN_URL`, `WHOLESALER_URL`, `AGENT_URL`, `PORT` |
| `apps/admin` | `NEXT_PUBLIC_API_URL` |
| `apps/web` | `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_WHOLESALER_URL`, `NEXT_PUBLIC_BLOG_URL`, `NEXT_PUBLIC_SITE_URL` |
