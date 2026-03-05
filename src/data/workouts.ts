import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq, gte, lt, and } from "drizzle-orm"

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning()
  return workout
}

export async function getWorkoutById(workoutId: number, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
  return workout ?? null
}

export async function updateWorkout(
  workoutId: number,
  userId: string,
  data: { name?: string; startedAt?: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout ?? null
}

export async function getWorkoutsForDate(userId: string, date: Date) {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(24, 0, 0, 0)

  return db.select().from(workouts).where(
    and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, dayStart),
      lt(workouts.startedAt, dayEnd)
    )
  )
}
