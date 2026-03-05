"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardCalendar({ initialDate }: { initialDate: Date }) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const router = useRouter()

  function handleSelect(date: Date | undefined) {
    if (!date) return
    setSelectedDate(date)
    const iso = date.toISOString().split("T")[0]
    router.push(`/dashboard?date=${iso}`)
  }

  return (
    <Card>
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  )
}
