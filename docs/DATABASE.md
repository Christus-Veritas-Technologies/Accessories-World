# Database Guide — `@repo/db`

## Overview

The `@repo/db` package is a shared library that provides database access to all apps in the monorepo using **Prisma 7** with PostgreSQL.

## Setup

### 1. Install Dependencies

From the monorepo root:
```bash
bun install
```

### 2. Configure Database URL

```bash
cp packages/db/.env.example packages/db/.env
```

Edit `packages/db/.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/accessories_world?schema=public"
```

### 3. Generate Prisma Client

```bash
cd packages/db
bunx prisma generate
```

### 4. Create / Apply Migrations

```bash
# Create a new migration
bunx prisma migrate dev --name init

# Apply pending migrations (production)
bunx prisma migrate deploy

# Push schema changes without migration (dev only)
bunx prisma db push
```

### 5. Open Prisma Studio

```bash
cd packages/db
bunx prisma studio
```

## Schema Models

### Admin
Admin users who manage the system through the admin portal.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | Login email |
| `passwordHash` | String | Hashed password |
| `name` | String | Display name |
| `role` | AdminRole | ADMIN or SUPER_ADMIN |

### Wholesaler
Wholesale buyers who access pricing through the wholesaler portal.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | Login email |
| `passwordHash` | String | Hashed password |
| `businessName` | String | Business name |
| `contactPerson` | String | Contact person name |
| `phone` | String? | Phone number |
| `address` | String? | Business address |
| `approved` | Boolean | Whether access is approved |

### Product
Products sold by Accessories World with dual pricing.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Product name |
| `slug` | String (unique) | URL-friendly slug |
| `description` | String? | Product description |
| `sku` | String? (unique) | Stock keeping unit |
| `retailPrice` | Decimal(10,2) | Price shown on website |
| `wholesalePrice` | Decimal(10,2) | Price shown in wholesaler portal |
| `stock` | Int | Current stock level |
| `featured` | Boolean | Whether to feature on homepage |
| `active` | Boolean | Whether product is visible |
| `categoryId` | String? | FK to Category |

### ProductImage
Images stored on Cloudflare R2, referenced by URL.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `url` | String | R2 image URL |
| `alt` | String? | Alt text for accessibility |
| `order` | Int | Display order |
| `productId` | String | FK to Product |

### Category, Order, OrderItem, Session
See the Prisma schema file for complete details: `packages/db/prisma/schema.prisma`

## Usage in Apps

### Import the Prisma client

```typescript
import { prisma } from "@repo/db";
```

### Query examples

```typescript
// Get all active products with images
const products = await prisma.product.findMany({
  where: { active: true },
  include: { images: true, category: true },
});

// Get product with retail price (for web app)
const product = await prisma.product.findUnique({
  where: { slug: "bluetooth-speaker-x1" },
  select: {
    name: true,
    retailPrice: true,
    description: true,
    images: true,
  },
});

// Get product with wholesale price (for wholesaler app)
const product = await prisma.product.findUnique({
  where: { slug: "bluetooth-speaker-x1" },
  select: {
    name: true,
    wholesalePrice: true,
    description: true,
    images: true,
  },
});
```

## Prisma 7 Notes

- Prisma 7 uses **ESM** — all apps must support ES modules
- The Prisma client is generated to `packages/db/src/generated/prisma/`
- A **driver adapter** (`@prisma/adapter-pg`) is required for PostgreSQL
- Environment variables are loaded via `dotenv` in `prisma.config.ts`
- The `prisma.config.ts` file configures CLI behavior (migrations, seeding, datasource)
