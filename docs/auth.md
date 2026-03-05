# Auth Standards

## Provider: Clerk

**This app uses [Clerk](https://clerk.com) for all authentication.** Do NOT use NextAuth, Lucia, or any other auth library.

---

## Wrapping the App

The root layout (`src/app/layout.tsx`) MUST wrap the entire app in `<ClerkProvider>`.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## Getting the Current User (Server Components)

Use `auth()` from `@clerk/nextjs/server` to get the current user's ID in Server Components and page files.

```tsx
import { auth } from "@clerk/nextjs/server"

export default async function SomePage() {
  const { userId } = await auth()

  // userId is null if the user is not signed in
  // Use userId! (non-null assertion) only after verifying the route is protected
}
```

- Import `auth` from `@clerk/nextjs/server`, NOT from `@clerk/nextjs`
- `auth()` returns `{ userId: string | null }` — always handle the null case
- Do NOT use `currentUser()` unless you need full user profile data — `auth()` is cheaper

---

## UI Components

Use Clerk's pre-built components for sign-in/sign-up/user buttons. Do NOT build custom auth UI.

```tsx
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

// Show sign-in/sign-up buttons when logged out
<SignedOut>
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</SignedOut>

// Show user avatar/menu when logged in
<SignedIn>
  <UserButton />
</SignedIn>
```

---

## Route Protection (Middleware)

Use Clerk middleware (`clerkMiddleware`) in `src/middleware.ts` to protect routes.

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
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
}
```

- All non-public routes are automatically protected — unauthenticated users are redirected to sign-in
- Add public routes to `isPublicRoute` matcher only — keep the protected list as the default

---

## Passing `userId` to Data Helpers

Server Components obtain `userId` from `auth()` and pass it to `/data` helper functions. Never trust user-supplied IDs from URL params.

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server"
import { getWorkoutsForUser } from "@/data/workouts"

export default async function DashboardPage() {
  const { userId } = await auth()

  // userId is guaranteed non-null here because the route is protected by middleware
  const workouts = await getWorkoutsForUser(userId!)

  return <WorkoutList workouts={workouts} />
}
```

See `docs/data-fetching.md` for how `/data` helpers must enforce ownership via `userId`.

---

## What NOT to Do

```tsx
// ❌ WRONG — importing auth from the wrong package
import { auth } from "@clerk/nextjs"

// ❌ WRONG — using currentUser() when you only need the ID
import { currentUser } from "@clerk/nextjs/server"
const user = await currentUser() // expensive, avoid unless profile fields are needed

// ❌ WRONG — building custom sign-in UI instead of using Clerk components
<form onSubmit={handleSignIn}>...</form>

// ❌ WRONG — accessing userId from URL params without verifying via auth()
const userId = params.userId // never trust this for data queries
```
