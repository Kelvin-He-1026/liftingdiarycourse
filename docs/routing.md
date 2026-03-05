# Routing Standards

## Route Structure

**All application routes MUST live under `/dashboard`.**

- `/` — public landing/home page
- `/sign-in` — public sign-in page (Clerk)
- `/sign-up` — public sign-up page (Clerk)
- `/dashboard` — main app entry point (protected)
- `/dashboard/**` — all sub-routes (protected)

```
src/app/
  page.tsx                          → /           (public)
  dashboard/
    page.tsx                        → /dashboard  (protected)
    workout/
      new/
        page.tsx                    → /dashboard/workout/new  (protected)
      [workoutId]/
        page.tsx                    → /dashboard/workout/:id  (protected)
```

---

## Route Protection via Middleware

All `/dashboard` routes are protected via **Next.js middleware** using Clerk. Do NOT protect routes with per-page auth checks — middleware is the single source of truth for access control.

Create `src/middleware.ts` at the project root of `src/`:

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

- Only routes explicitly listed in `isPublicRoute` are accessible without login
- All other routes (including all of `/dashboard/**`) are automatically protected
- Unauthenticated users are redirected to sign-in by Clerk

---

## Adding New Routes

When adding a new feature page:

1. **Always nest it under `/dashboard`** — e.g. `src/app/dashboard/exercises/page.tsx`
2. **Do NOT add it to `isPublicRoute`** — it will be protected automatically
3. **Use dynamic segments for resource IDs** — e.g. `[workoutId]`, `[exerciseId]`

```
src/app/dashboard/
  exercises/
    page.tsx              → /dashboard/exercises
    [exerciseId]/
      page.tsx            → /dashboard/exercises/:id
```

---

## Public Routes

Only add a route to `isPublicRoute` if it must be accessible without authentication. Currently approved public routes:

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/sign-in(.*)` | Clerk sign-in flow |
| `/sign-up(.*)` | Clerk sign-up flow |

---

## What NOT to Do

```ts
// ❌ WRONG — protecting a route with a per-page auth check instead of middleware
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in") // don't do this — middleware handles it
}

// ❌ WRONG — placing a feature page outside /dashboard
// src/app/workouts/page.tsx  → should be src/app/dashboard/workouts/page.tsx

// ❌ WRONG — adding dashboard routes to isPublicRoute
const isPublicRoute = createRouteMatcher(["/", "/dashboard(.*)"])  // exposes all app pages
```

See `docs/auth.md` for how to obtain `userId` inside protected pages after middleware has verified the session.
