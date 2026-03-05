# Server Component Standards

## What Are Server Components?

All components in src/app/ are **Server Components by default** - they run only on the server, have no client-side JavaScript, and can directly access databases, secrets, and server APIs.

Add "use client" only when a component uses hooks, event handlers, or browser APIs.

---

## Async Params and SearchParams (Next.js 15)

**In Next.js 15, params and searchParams are Promises and MUST be awaited.**

This is a breaking change from Next.js 14. Accessing params synchronously will either throw or return undefined.

### Correct Pattern

```tsx
// src/app/dashboard/workout/[workoutId]/page.tsx
type Props = {
  params: Promise<{ workoutId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EditWorkoutPage({ params, searchParams }: Props) {
  const { workoutId } = await params     // awaited
  const { tab } = await searchParams    // awaited
}
```

### Incorrect Patterns

```tsx
// WRONG - synchronous access (Next.js 15 requires await)
export default async function Page({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params   // throws or returns undefined in Next.js 15
}

// WRONG - destructuring in the function signature before awaiting
export default async function Page({ params: { workoutId } }) { ... }
```

---

## Route Segment Types

Always type params as Promise<{ ... }> to match the Next.js 15 runtime contract:

```tsx
// Dynamic segment: /dashboard/workout/[workoutId]
type Props = {
  params: Promise<{ workoutId: string }>
}

// Catch-all segment: /docs/[...slug]
type Props = {
  params: Promise<{ slug: string[] }>
}
```

---

## Data Fetching in Server Components

Fetch data directly in the component body - no useEffect, no client fetching libraries.

```tsx
import { auth } from '@clerk/nextjs/server'
import { getWorkoutById } from '@/data/workouts'
import { notFound } from 'next/navigation'

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params
  const { userId } = await auth()

  const workout = await getWorkoutById(Number(workoutId), userId!)
  if (!workout) notFound()

  return <div>{workout.name}</div>
}
```

See docs/data-fetching.md for full data fetching rules and the /data helper pattern.

---

## The Server/Client Boundary

Keep the boundary as deep in the tree as possible:

- Server Components: data fetching, auth checks, layout structure
- Client Components: forms, interactivity, hooks, useRouter, useActionState

```
page.tsx                    <- Server Component (fetch data, pass as props)
  EditorForm.tsx   <- use client (handles form state and submission)
```

Pass only serialisable props (strings, numbers, plain objects) across the boundary - do NOT pass functions, class instances, or database results with non-serialisable fields.