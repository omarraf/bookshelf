"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Plus, BookOpen } from "lucide-react"

interface ReadingSession {
  date: string
  minutes: number
}

interface ReadingHeatmapProps {
  sessions: ReadingSession[]
  onAddSession: (session: ReadingSession) => void
}

export function ReadingHeatmap({ sessions, onAddSession }: ReadingHeatmapProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [minutes, setMinutes] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (minutes && Number.parseInt(minutes) > 0) {
      onAddSession({
        date: selectedDate,
        minutes: Number.parseInt(minutes),
      })
      setMinutes("")
      setIsOpen(false)
    }
  }

  const generateDays = () => {
    const days = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split("T")[0])
    }
    return days
  }

  const getIntensity = (date: string) => {
    const session = sessions.find((s) => s.date === date)
    if (!session) return 0

    // Map minutes to intensity levels (0-4)
    if (session.minutes >= 120) return 4 // 2+ hours
    if (session.minutes >= 60) return 3 // 1-2 hours
    if (session.minutes >= 30) return 2 // 30-60 minutes
    if (session.minutes >= 15) return 1 // 15-30 minutes
    return 0
  }

  const getIntensityColor = (intensity: number) => {
    const colors = [
      "bg-muted/30", // 0 minutes
      "bg-primary/20", // 15-30 minutes
      "bg-primary/40", // 30-60 minutes
      "bg-primary/70", // 1-2 hours
      "bg-primary", // 2+ hours
    ]
    return colors[intensity]
  }

  const days = generateDays()
  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const activeDays = sessions.length

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Reading Journey
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-1" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Log Your Reading Time</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="minutes">Minutes read</Label>
                  <Input
                    id="minutes"
                    type="number"
                    placeholder="30"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    min="1"
                    max="1440"
                    className="rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Log Reading Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{totalHours}h</div>
            <p className="text-sm text-muted-foreground">Total time</p>
          </div>
          <div className="text-center p-3 bg-card rounded-xl border-2 border-accent/20 shadow-sm">
            <div className="text-2xl font-bold text-foreground">{activeDays}</div>
            <p className="text-sm text-muted-foreground">Active days</p>
          </div>
          <div className="text-center p-3 bg-card rounded-xl border-2 border-secondary/20 shadow-sm">
            <div className="text-2xl font-bold text-foreground">
              {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0}m
            </div>
            <p className="text-sm text-muted-foreground">Daily avg</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Reading Activity</div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 min-w-[400px]">
              {days.map((date) => {
                const intensity = getIntensity(date)
                const session = sessions.find((s) => s.date === date)
                return (
                  <div
                    key={date}
                    className={`aspect-square rounded-sm ${getIntensityColor(intensity)} border border-border/20 hover:scale-110 transition-transform cursor-pointer`}
                    title={session ? `${date}: ${session.minutes} minutes` : `${date}: No reading`}
                  />
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getIntensityColor(level)} border border-border/20`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {activeDays > 0 && (
          <div className="text-sm text-center text-primary font-medium flex items-center justify-center gap-2 p-3 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
            <BookOpen className="h-4 w-4" />
            Keep nurturing your reading habit! 📚
          </div>
        )}
      </CardContent>
    </Card>
  )
}
