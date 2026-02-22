# Authentication Guide

## Overview

Accessories World uses a **session-based authentication** system. Only two types of users can sign in:

1. **Admins** — Access the admin dashboard at `apps/admin`
2. **Wholesalers** — Access the wholesaler portal at `apps/wholesalers`

**There is no public signup.** Both portals are closed access. Admins and wholesalers are created by a super admin through the admin dashboard or directly in the database.

## Auth Flow

### Sign In

1. User navigates to the admin or wholesaler portal
2. User enters their email and password
3. Server verifies credentials against the database
4. On success, a `Session` record is created with a unique token
5. The session token is stored in an HTTP-only cookie
6. User is redirected to the dashboard

### Session Validation

1. On each request, middleware reads the session cookie
2. The token is looked up in the `Session` table
3. If the session exists and hasn't expired, the request proceeds
4. If invalid or expired, the user is redirected to sign in

### Sign Out

1. The session record is deleted from the database
2. The session cookie is cleared
3. User is redirected to the sign-in page

## Database Models

### Session

```prisma
model Session {
  id           String      @id @default(cuid())
  token        String      @unique
  userType     UserType    // ADMIN or WHOLESALER
  adminId      String?
  admin        Admin?
  wholesalerId String?
  wholesaler   Wholesaler?
  expiresAt    DateTime
  createdAt    DateTime    @default(now())
}
```

### Admin

```prisma
model Admin {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole // ADMIN or SUPER_ADMIN
  sessions     Session[]
}
```

### Wholesaler

```prisma
model Wholesaler {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  businessName  String
  contactPerson String
  phone         String?
  address       String?
  approved      Boolean   @default(false)
  sessions      Session[]
}
```

## Implementation Notes

### Password Hashing

Use `bcrypt` or `argon2` for password hashing:

```typescript
import bcrypt from "bcryptjs";

// Hash a password
const hash = await bcrypt.hash(password, 12);

// Verify a password
const valid = await bcrypt.compare(password, hash);
```

### Session Token Generation

Use `crypto.randomUUID()` or a similar method:

```typescript
const token = crypto.randomUUID();
const session = await prisma.session.create({
  data: {
    token,
    userType: "ADMIN",
    adminId: admin.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});
```

### Wholesaler Approval

Wholesalers have an `approved` field. Even after signing in, unapproved wholesalers should see a "pending approval" message and be denied access to pricing/ordering features.

## Security Considerations

- Both admin and wholesaler portals have `robots: noindex, nofollow` in their metadata
- Session cookies should be `HttpOnly`, `Secure`, and `SameSite=Strict`
- Session expiry should be enforced server-side
- Brute-force protection (rate limiting) should be added to sign-in endpoints
