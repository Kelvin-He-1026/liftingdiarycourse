import { auth } from "@clerk/nextjs/server"
import { format } from "date-fns"
import { getWorkoutsForDate } from "@/data/workouts"
import { DashboardCalendar } from "./DashboardCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatDate(date: Date): string {
  const day = date.getDate()
  const ordinal = getOrdinal(day)
  return `${day}${ordinal} ${format(date, "MMM yyyy")}`
}

function getOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { userId } = await auth()
  const { date: dateStr } = await searchParams
  const selectedDate = dateStr ? new Date(dateStr) : new Date()

  const workoutList = await getWorkoutsForDate(userId!, selectedDate)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

          <DashboardCalendar initialDate={selectedDate} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Workouts — {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workoutList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No workouts logged for this date.
                </p>
              ) : (
                <ul className="space-y-3">
                  {workoutList.map((workout) => (
                    <li
                      key={workout.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <span className="font-medium text-sm">{workout.name}</span>
                      <Badge variant="secondary">
                        {format(workout.startedAt, "h:mm a")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
