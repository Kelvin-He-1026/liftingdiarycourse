# Data Fetching Standards

## Core Rule: Server Components Only

**ALL data fetching MUST be done exclusively via Next.js Server Components.**

- Do NOT fetch data in Client Components (`"use client"`)
- Do NOT fetch data in Route Handlers (`src/app/api/`)
- Do NOT use `useEffect` + `fetch` patterns
- Do NOT use SWR, React Query, or any client-side data fetching library

Server Components fetch data at render time on the server — this is the only approved pattern.

### Correct Pattern

```tsx
// src/app/dashboard/page.tsx — Server Component (no "use client")
import { getWorkoutsForUser } from "@/data/workouts"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()
  const workouts = await getWorkoutsForUser(session.user.id)

  return <WorkoutList workouts={workouts} />
}
```

### Incorrect Patterns

```tsx
// ❌ WRONG — fetching in a client component
"use client"
export default function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  useEffect(() => {
    fetch("/api/workouts").then(...)
  }, [])
}

// ❌ WRONG — fetching via a route handler
// src/app/api/workouts/route.ts
export async function GET() {
  const workouts = await db.select()...
  return Response.json(workouts)
}
```

---

## Database Queries: `/data` Directory

All database queries MUST live in helper functions inside the `/data` directory.

- One file per domain entity (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Functions must use **Drizzle ORM** — do NOT write raw SQL strings
- Functions must accept a `userId` parameter and filter all queries by it

### File Structure

```
src/
  data/
    workouts.ts
    exercises.ts
    sets.ts
```

### Correct Pattern

```ts
// src/data/workouts.ts
import { db } from "@/lib/db"
import { workouts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const results = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId))
  return results[0] ?? null
}
```

### Incorrect Patterns

```ts
// ❌ WRONG — raw SQL
const result = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`)

// ❌ WRONG — missing userId filter (data leak risk)
export async function getWorkoutById(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId))
}

// ❌ WRONG — querying directly inside a page component
export default async function Page() {
  const data = await db.select().from(workouts) // no userId filter!
}
```

---

## Data Isolation (Security)

**A logged-in user must ONLY be able to access their own data.**

Every `/data` helper function that reads or writes records MUST:

1. Accept `userId` as a required parameter
2. Include `eq(table.userId, userId)` in every query's `where` clause
3. Never return records without filtering by the authenticated user's ID

The calling Server Component is responsible for obtaining `userId` from the authenticated session and passing it to the data helper. Never trust user-supplied IDs from URL params or request bodies without verifying ownership via the `userId` filter.

```ts
// src/app/workouts/[id]/page.tsx
export default async function WorkoutPage({ params }: { params: { id: string } }) {
  const session = await auth()

  // Pass BOTH the resource ID and the userId — the helper enforces ownership
  const workout = await getWorkoutById(params.id, session.user.id)

  if (!workout) notFound() // returns null if it doesn't belong to this user
  ...
}
```
