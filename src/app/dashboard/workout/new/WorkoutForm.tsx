"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createWorkoutAction, type ActionState } from "./actions"

export function WorkoutForm({ defaultDate }: { defaultDate: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createWorkoutAction,
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
        <CardTitle>New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Workout name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Push day"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startedAt">Start time</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              defaultValue={defaultDate}
              required
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Save workout"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
