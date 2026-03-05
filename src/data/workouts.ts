import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq, gte, lt, and } from "drizzle-orm"

export async function getWorkoutsForDate(userId: string, date: Date) {
  // TODO(human): implement this function
  // Filter workouts where:
  //   1. userId matches
  //   2. startedAt falls within the given calendar day (midnight to midnight)
  // Return the query result.
}
