# Accessories World — Development Guide

## Overview

Accessories World is a turborepo monorepo for an accessories retail business in Mutare, Zimbabwe. The project contains four applications and several shared packages.

## Architecture

```
accessories-world/
├── apps/
│   ├── web/           → Marketing website (Next.js 16, port 3000)
│   ├── admin/         → Admin dashboard (Next.js 16, port 3001)
│   ├── wholesalers/   → Wholesaler portal (Next.js 16, port 3002)
│   └── blog/          → Blog (Astro, port 4321)
├── packages/
│   ├── db/            → Prisma 7 database library (shared)
│   ├── ui/            → Shared UI components
│   ├── eslint-config/ → Shared ESLint configuration
│   └── typescript-config/ → Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js** >= 20.19.0 (22.x recommended)
- **Bun** >= 1.3.5 (package manager)
- **PostgreSQL** database

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd accessories-world

# Install all dependencies
bun install
```

### Database Setup

1. Copy the environment file:
   ```bash
   cp packages/db/.env.example packages/db/.env
   ```

2. Update `packages/db/.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/accessories_world?schema=public"
   ```

3. Generate the Prisma client:
   ```bash
   cd packages/db
   bunx prisma generate
   ```

4. Run migrations:
   ```bash
   bunx prisma migrate dev
   ```

### Running the Apps

```bash
# Run all apps in development mode
bun dev

# Run a specific app
cd apps/web && bun dev      # Marketing site → http://localhost:3000
cd apps/admin && bun dev    # Admin portal  → http://localhost:3001
cd apps/wholesalers && bun dev  # Wholesaler portal → http://localhost:3002
cd apps/blog && bun dev     # Blog → http://localhost:4321
```

### Building

```bash
# Build all apps
bun run build

# Build a specific app
cd apps/web && bun run build
```

## Environment Variables

### Web App (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ADMIN_URL` | Admin portal URL | `http://localhost:3001` |
| `NEXT_PUBLIC_WHOLESALER_URL` | Wholesaler portal URL | `http://localhost:3002` |
| `NEXT_PUBLIC_BLOG_URL` | Blog URL | `http://localhost:4321` |
| `NEXT_PUBLIC_SITE_URL` | Main site URL | `http://localhost:3000` |

### Database (`packages/db/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

## Key Concepts

### Product Pricing
Products have **two prices**:
- **Retail Price** — shown on the marketing website (`apps/web`)
- **Wholesale Price** — shown only in the wholesaler portal (`apps/wholesalers`)

### Authentication
- **Admins** sign in through the admin portal (`apps/admin`)
- **Wholesalers** sign in through the wholesaler portal (`apps/wholesalers`)
- There is **no public signup** — both portals are closed access
- Auth is session-based with tokens stored in the database

### Image Storage
Product images are uploaded to **Cloudflare R2** and the URLs are stored in the database (`ProductImage` model).

## Project Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start all apps in development mode |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all apps and packages |
| `bun run check-types` | Type-check all apps and packages |
