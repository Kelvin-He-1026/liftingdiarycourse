import { notFound } from "next/navigation"
import { format } from "date-fns"
import { auth } from "@clerk/nextjs/server"
import { getWorkoutById } from "@/data/workouts"
import { EditWorkoutForm } from "./EditWorkoutForm"

type Props = {
  params: Promise<{ workoutId: string }>
}

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId: workoutIdParam } = await params
  const workoutId = Number(workoutIdParam)

  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound()

  const { userId } = await auth()
  const workout = await getWorkoutById(workoutId, userId!)

  if (!workout) notFound()

  const defaultStartedAt = format(workout.startedAt, "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Workout</h1>
        <EditWorkoutForm
          workoutId={workout.id}
          defaultName={workout.name}
          defaultStartedAt={defaultStartedAt}
        />
      </div>
    </div>
  )
}
