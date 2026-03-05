"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { createWorkout } from "@/data/workouts"

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  startedAt: z.coerce.date(),
})

export type ActionState = { error: string } | { success: true } | null

export async function createWorkoutAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await auth()
  if (!userId) return { error: "Unauthorized" }

  const raw = {
    name: formData.get("name"),
    startedAt: formData.get("startedAt"),
  }

  const result = createWorkoutSchema.safeParse(raw)
  if (!result.success) {
    const messages = Object.values(result.error.flatten().fieldErrors).flat()
    return { error: messages[0] ?? "Invalid input." }
  }

  const { name, startedAt } = result.data
  await createWorkout(userId, name, startedAt)
  return { success: true }
}
