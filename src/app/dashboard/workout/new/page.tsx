import { format } from "date-fns"
import { WorkoutForm } from "./WorkoutForm"

export default function NewWorkoutPage() {
  // Default the datetime-local input to now (format required by HTML spec)
  const defaultDate = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Log a Workout</h1>
        <WorkoutForm defaultDate={defaultDate} />
      </div>
    </div>
  )
}
