"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Placeholder workout type — replace with real type once data layer is wired up
type Workout = {
  id: string
  name: string
  sets: number
  reps: number
  weightKg: number
}

// Placeholder data — replace with real data fetching
const PLACEHOLDER_WORKOUTS: Workout[] = [
  { id: "1", name: "Bench Press", sets: 4, reps: 8, weightKg: 80 },
  { id: "2", name: "Squat", sets: 5, reps: 5, weightKg: 100 },
  { id: "3", name: "Deadlift", sets: 3, reps: 5, weightKg: 120 },
]

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

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

          {/* Date Picker */}
          <Card>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </CardContent>
          </Card>

          {/* Workout List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Workouts — {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {PLACEHOLDER_WORKOUTS.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No workouts logged for this date.
                </p>
              ) : (
                <ul className="space-y-3">
                  {PLACEHOLDER_WORKOUTS.map((workout) => (
                    <li
                      key={workout.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <span className="font-medium text-sm">{workout.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {workout.sets} × {workout.reps}
                        </Badge>
                        <Badge variant="outline">
                          {workout.weightKg} kg
                        </Badge>
                      </div>
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
