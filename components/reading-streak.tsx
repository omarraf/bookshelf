"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar } from "lucide-react"
import type { Book } from "@/app/page"

interface ReadingStreakProps {
  books: Book[]
}

export function ReadingStreak({ books }: ReadingStreakProps) {
  const calculateStreak = () => {
    const completedBooks = books
      .filter((book) => book.status === "Completed" && book.finishDate)
      .sort((a, b) => new Date(b.finishDate!).getTime() - new Date(a.finishDate!).getTime())

    if (completedBooks.length === 0) return { current: 0, longest: 0 }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    const today = new Date()
    const lastBookDate = new Date(completedBooks[0].finishDate!)
    const daysDiff = Math.floor((today.getTime() - lastBookDate.getTime()) / (1000 * 60 * 60 * 24))

    // Current streak calculation
    if (daysDiff <= 7) {
      // Within a week
      currentStreak = 1
      for (let i = 1; i < completedBooks.length; i++) {
        const prevDate = new Date(completedBooks[i - 1].finishDate!)
        const currDate = new Date(completedBooks[i].finishDate!)
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diff <= 14) {
          // Within 2 weeks
          currentStreak++
        } else {
          break
        }
      }
    }

    // Longest streak calculation
    for (let i = 1; i < completedBooks.length; i++) {
      const prevDate = new Date(completedBooks[i - 1].finishDate!)
      const currDate = new Date(completedBooks[i].finishDate!)
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diff <= 14) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { current: currentStreak, longest: longestStreak }
  }

  const { current, longest } = calculateStreak()

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Flame className="h-5 w-5" />
          Reading Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{current}</div>
          <p className="text-sm text-orange-700">Books this streak</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Longest streak
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {longest} books
          </Badge>
        </div>

        {current > 0 && (
          <div className="text-xs text-center text-orange-600 font-medium">🔥 Keep it up! You're on fire!</div>
        )}
      </CardContent>
    </Card>
  )
}
