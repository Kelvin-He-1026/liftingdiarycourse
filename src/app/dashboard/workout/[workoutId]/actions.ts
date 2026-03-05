"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { updateWorkout } from "@/data/workouts"

const updateWorkoutSchema = z.object({
  workoutId: z.coerce.number().int(),
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  startedAt: z.coerce.date(),
})

export type ActionState = { error: string } | { success: true } | null

// TODO(human): Implement updateWorkoutAction below.
// Steps to follow:
//   1. Get { userId } from auth() — never trust a userId from params
//   2. Build the raw object from formData (keys: "workoutId", "name", "startedAt")
//   3. Use updateWorkoutSchema.safeParse(raw); return { error } if it fails
//   4. Call updateWorkout(workoutId, userId, { name, startedAt }) from @/data/workouts
//   5. Return { success: true } on success
export async function updateWorkoutAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  throw new Error("Not implemented")
}
