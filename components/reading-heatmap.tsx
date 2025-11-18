"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, ChevronLeft, ChevronRight, Flame, Trash2, BookOpen } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfWeek, endOfWeek, differenceInDays } from "date-fns"
import type { ReadingSession, ReadingSessionFormData } from "@/types"

interface ReadingHeatmapProps {
  sessions: ReadingSession[]
  onAddSession: (session: ReadingSessionFormData) => void
  isLoading?: boolean
}

export function ReadingHeatmap({ sessions, onAddSession, isLoading = false }: ReadingHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [minutes, setMinutes] = useState("")
  const [editingSession, setEditingSession] = useState<ReadingSessionFormData | null>(null)

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")

  // Find first session date to prevent navigating before user's start
  const firstSessionDate = useMemo(() => {
    if (sessions.length === 0) return null
    const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    return new Date(sortedSessions[0].date)
  }, [sessions])

  // Calculate streaks
  const { currentStreak, longestStreak } = useMemo(() => {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const sortedDates = [...sessions]
      .map((s) => s.date)
      .sort()
      .reverse()

    let current = 0
    let longest = 0
    let tempStreak = 0
    let lastDate = format(today, "yyyy-MM-dd")

    for (const date of sortedDates) {
      const daysDiff = differenceInDays(new Date(lastDate), new Date(date))

      if (daysDiff <= 1) {
        tempStreak++
        if (lastDate === todayStr || isSameDay(new Date(lastDate), new Date(date))) {
          current = tempStreak
        }
      } else {
        longest = Math.max(longest, tempStreak)
        tempStreak = 1
      }

      lastDate = date
    }

    longest = Math.max(longest, tempStreak, current)

    return { currentStreak: current, longestStreak: longest }
  }, [sessions, today, todayStr])

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const activeDays = sessions.length

  const getIntensity = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const session = sessions.find((s) => s.date === dateStr)
    if (!session) return 0

    if (session.minutes >= 120) return 4 // 2+ hours
    if (session.minutes >= 60) return 3 // 1-2 hours
    if (session.minutes >= 30) return 2 // 30-60 minutes
    if (session.minutes >= 15) return 1 // 15-30 minutes
    return 0
  }

  const getIntensityColor = (intensity: number) => {
    const colors = [
      "bg-muted/30 hover:bg-muted/50", // 0 minutes
      "bg-primary/20 hover:bg-primary/30", // 15-30 minutes
      "bg-primary/40 hover:bg-primary/50", // 30-60 minutes
      "bg-primary/70 hover:bg-primary/80", // 1-2 hours
      "bg-primary hover:bg-primary/90", // 2+ hours
    ]
    return colors[intensity]
  }

  const handleDayClick = (date: Date) => {
    if (isAfter(date, today)) return // Can't log future dates

    const dateStr = format(date, "yyyy-MM-dd")
    const existingSession = sessions.find((s) => s.date === dateStr)

    setSelectedDate(dateStr)
    if (existingSession) {
      setEditingSession(existingSession)
      setMinutes(existingSession.minutes.toString())
    } else {
      setEditingSession(null)
      setMinutes("")
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (minutes && Number.parseInt(minutes) > 0) {
      onAddSession({
        date: selectedDate,
        minutes: Number.parseInt(minutes),
      })
      setMinutes("")
      setEditingSession(null)
      setIsDialogOpen(false)
    }
  }

  const handleDelete = () => {
    if (editingSession) {
      onAddSession({
        date: editingSession.date,
        minutes: 0, // 0 minutes will trigger deletion in parent
      })
      setEditingSession(null)
      setIsDialogOpen(false)
    }
  }

  const canGoPrevious = () => {
    if (!firstSessionDate) return false
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    return !isBefore(prevMonth, startOfMonth(firstSessionDate))
  }

  const canGoNext = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return isBefore(nextMonth, startOfMonth(today))
  }

  const handlePrevMonth = () => {
    if (canGoPrevious()) {
      setCurrentMonth((prev) => {
        const newDate = new Date(prev)
        newDate.setMonth(newDate.getMonth() - 1)
        return newDate
      })
    }
  }

  const handleNextMonth = () => {
    if (canGoNext()) {
      setCurrentMonth((prev) => {
        const newDate = new Date(prev)
        newDate.setMonth(newDate.getMonth() + 1)
        return newDate
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-3 bg-card rounded-xl border-2 border-muted/20">
                <div className="h-8 w-12 bg-muted/50 rounded mx-auto mb-1 animate-pulse" />
                <div className="h-4 w-16 bg-muted/50 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-64 bg-muted/30 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Reading Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Start Your Reading Journey</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Track your daily reading time and build a consistent habit. Your calendar will come alive as you log your reading sessions!
            </p>
          </div>
          <Button onClick={() => handleDayClick(today)} className="rounded-full shadow-md">
            <Calendar className="h-4 w-4 mr-2" />
            Log Today's Reading
          </Button>
          <div className="mt-6 p-4 bg-muted/30 rounded-lg max-w-md">
            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: Reading just 15 minutes a day can help you finish 20+ books per year!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              Reading Journey
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
              <div className="text-2xl font-bold text-foreground">{totalHours}h</div>
              <p className="text-xs text-muted-foreground">Total time</p>
            </div>
            <div className="text-center p-3 bg-card rounded-xl border-2 border-accent/20 shadow-sm">
              <div className="text-2xl font-bold text-foreground">{activeDays}</div>
              <p className="text-xs text-muted-foreground">Active days</p>
            </div>
            <div className="text-center p-3 bg-card rounded-xl border-2 border-secondary/20 shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0}m
              </div>
              <p className="text-xs text-muted-foreground">Daily avg</p>
            </div>
            <div className="text-center p-3 bg-card rounded-xl border-2 border-orange-500/20 shadow-sm">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
              </div>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              disabled={!canGoPrevious()}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              disabled={!canGoNext()}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd")
                const session = sessions.find((s) => s.date === dateStr)
                const intensity = getIntensity(date)
                const isToday = isSameDay(date, today)
                const isCurrentMonth = isSameMonth(date, currentMonth)
                const isFuture = isAfter(date, today)

                return (
                  <Tooltip key={dateStr}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDayClick(date)}
                        disabled={isFuture}
                        className={`
                          aspect-square rounded-lg border-2 transition-all duration-200
                          ${isCurrentMonth ? "opacity-100" : "opacity-30"}
                          ${isFuture ? "cursor-not-allowed opacity-20" : "cursor-pointer hover:scale-105"}
                          ${isToday ? "border-primary ring-2 ring-primary/20" : "border-border/20"}
                          ${getIntensityColor(intensity)}
                          flex flex-col items-center justify-center p-1
                        `}
                      >
                        <span className={`text-xs font-medium ${intensity > 2 ? "text-primary-foreground" : "text-foreground"}`}>
                          {format(date, "d")}
                        </span>
                        {session && (
                          <span className={`text-[10px] ${intensity > 2 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {session.minutes}m
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
                        {session ? (
                          <div className="text-muted-foreground mt-1">
                            {session.minutes} minutes read
                            <div className="text-[10px] mt-0.5 text-primary">Click to edit/delete</div>
                          </div>
                        ) : isFuture ? (
                          <div className="text-muted-foreground">Future date</div>
                        ) : (
                          <div className="text-muted-foreground">
                            No reading logged
                            <div className="text-[10px] mt-0.5 text-primary">Click to add</div>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Less</span>
            <div className="flex gap-1 items-center">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded-sm ${getIntensityColor(level).split(" ")[0]} border border-border/20`}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          {/* Encouragement */}
          {longestStreak > 0 && (
            <div className="text-sm text-center text-primary font-medium flex items-center justify-center gap-2 p-3 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              {currentStreak > 0 ? (
                <>
                  {currentStreak}-day streak! Keep it going! 🔥
                  {longestStreak > currentStreak && <span className="text-muted-foreground text-xs ml-2">(Best: {longestStreak})</span>}
                </>
              ) : (
                <>Your longest streak: {longestStreak} days. You can beat it! 💪</>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit" : "Log"} Reading Time</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={todayStr}
                className="rounded-lg"
                disabled
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
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {editingSession && (
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 rounded-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button type="submit" className="flex-1 rounded-full">
                {editingSession ? "Update" : "Log"} Session
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
