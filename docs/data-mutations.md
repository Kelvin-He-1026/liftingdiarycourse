# Data Mutation Standards

## Core Rules

**ALL data mutations MUST follow two rules:**

1. **`/data` helpers** — every db write (insert, update, delete) lives in a helper function inside `src/data/`
2. **Server Actions** — every mutation is triggered via a Server Action in a colocated `actions.ts` file

---

## `/data` Directory: Mutation Helpers

Mutation helpers live alongside query helpers in the same domain files under `src/data/`.

- One file per domain entity (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Functions must use **Drizzle ORM** — do NOT write raw SQL strings
- Write helpers MUST accept `userId` and enforce ownership on every update/delete

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
import { eq, and } from "drizzle-orm"

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning()
  return workout
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  data: { name?: string; date?: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout ?? null
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
}
```

### Incorrect Patterns

```ts
// ❌ WRONG — raw SQL
await db.execute(sql`INSERT INTO workouts (user_id, name) VALUES (${userId}, ${name})`)

// ❌ WRONG — no userId filter on update/delete (another user's data can be modified)
export async function deleteWorkout(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId))
}

// ❌ WRONG — db call directly inside a Server Action (bypasses the /data layer)
export async function deleteWorkoutAction(workoutId: string) {
  "use server"
  await db.delete(workouts).where(eq(workouts.id, workoutId))
}
```

---

## Server Actions: `actions.ts`

All Server Actions MUST live in a file named `actions.ts` colocated with the route that uses them.

### File Structure

```
src/
  app/
    workouts/
      page.tsx
      actions.ts
      [id]/
        page.tsx
        actions.ts
```

### Rules

- Every file MUST begin with `"use server"`
- Parameters MUST be explicitly typed — do NOT use `FormData` as a parameter type
- Every action MUST validate its arguments with **Zod** before doing anything else
- Actions obtain `userId` from the authenticated session — never from parameters
- Actions call `/data` helpers for all db operations
- Actions MUST NOT call `redirect()` — navigation after a mutation is the caller's responsibility (see [Redirects](#redirects))

### Correct Pattern

```ts
// src/app/workouts/actions.ts
"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { createWorkout, deleteWorkout } from "@/data/workouts"

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
})

export async function createWorkoutAction(params: {
  name: string
  date: string
}) {
  const session = await auth()
  const { name, date } = createWorkoutSchema.parse(params)
  return createWorkout(session.user.id, name, date)
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
})

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const session = await auth()
  const { workoutId } = deleteWorkoutSchema.parse(params)
  await deleteWorkout(workoutId, session.user.id)
}
```

### Incorrect Patterns

```ts
// ❌ WRONG — FormData as parameter type
export async function createWorkoutAction(data: FormData) { ... }

// ❌ WRONG — redirect() called inside a Server Action
export async function createWorkoutAction(params: { name: string; date: string }) {
  const session = await auth()
  const { name, date } = createWorkoutSchema.parse(params)
  await createWorkout(session.user.id, name, date)
  redirect("/dashboard") // ❌ do not redirect here
}

// ❌ WRONG — no Zod validation (untrusted input goes straight to db)
export async function createWorkoutAction(params: { name: string; date: string }) {
  "use server"
  const session = await auth()
  return createWorkout(session.user.id, params.name, new Date(params.date))
}

// ❌ WRONG — userId accepted as a parameter (caller can spoof another user)
export async function deleteWorkoutAction(params: {
  workoutId: string
  userId: string
}) { ... }

// ❌ WRONG — action defined inline in a component file
// src/app/workouts/page.tsx
async function createWorkout() {
  "use server"
  ...
}
```

---

## Redirects

**Server Actions MUST NOT call `redirect()`.**

Navigation after a mutation is a client-side concern. The calling component is responsible for redirecting based on the action's return value or error state.

### Correct Pattern

```tsx
// src/app/workouts/WorkoutForm.tsx
"use client"

import { useRouter } from "next/navigation"
import { createWorkoutAction } from "./actions"

export function WorkoutForm() {
  const router = useRouter()

  async function handleSubmit(params: { name: string; date: string }) {
    await createWorkoutAction(params)
    router.push("/dashboard") // ✅ redirect happens client-side after action resolves
  }

  // ...
}
```

### Incorrect Pattern

```ts
// ❌ WRONG — redirect inside the Server Action
export async function createWorkoutAction(params: { name: string; date: string }) {
  const session = await auth()
  const { name, date } = createWorkoutSchema.parse(params)
  await createWorkout(session.user.id, name, date)
  redirect("/dashboard") // ❌ not allowed
}
```

---

## Data Isolation (Security)

**A logged-in user must ONLY be able to mutate their own data.**

Every `/data` mutation helper MUST:

1. Accept `userId` as a required parameter
2. Include `eq(table.userId, userId)` in the `where` clause of every `update` and `delete`
3. Include `userId` in the `values` of every `insert`

Every Server Action MUST:

1. Obtain `userId` exclusively from the authenticated session via `auth()`
2. Never accept `userId` as an action parameter
3. Pass the session `userId` directly to the `/data` helper

```ts
// src/app/workouts/[id]/actions.ts
"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { updateWorkout } from "@/data/workouts"

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  date: z.coerce.date().optional(),
})

export async function updateWorkoutAction(params: {
  workoutId: string
  name?: string
  date?: string
}) {
  const session = await auth()

  // Zod validates shape; /data helper enforces ownership via userId
  const { workoutId, ...data } = updateWorkoutSchema.parse(params)
  return updateWorkout(workoutId, session.user.id, data)
}
```
