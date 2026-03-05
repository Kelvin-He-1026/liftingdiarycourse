"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateWorkoutAction, type ActionState } from "./actions"

type Props = {
  workoutId: number
  defaultName: string
  defaultStartedAt: string
}

export function EditWorkoutForm({ workoutId, defaultName, defaultStartedAt }: Props) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateWorkoutAction,
    null
  )

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="workoutId" value={workoutId} />

          <div className="space-y-1.5">
            <Label htmlFor="name">Workout name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Push day"
              defaultValue={defaultName}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startedAt">Start time</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              defaultValue={defaultStartedAt}
              required
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
