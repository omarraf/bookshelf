import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart } from "lucide-react"
import type { Book as BookType } from "@/app/page"

interface DashboardStatsProps {
  books: BookType[]
}

export function DashboardStats({ books }: DashboardStatsProps) {
  const currentYear = new Date().getFullYear()
  const booksReadThisYear = books.filter(
    (book) => book.status === "Completed" && book.finishDate && new Date(book.finishDate).getFullYear() === currentYear,
  ).length

  const booksInProgress = books.filter((book) => book.status === "In Progress").length
  const totalBooks = books.length
  const yearlyGoal = 24 // Default goal, could be made configurable
  const goalProgress = (booksReadThisYear / yearlyGoal) * 100

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-card rounded-xl border-2 border-primary/20 shadow-sm">
              <div className="text-3xl font-bold text-foreground mb-1">{booksReadThisYear}</div>
              <p className="text-sm text-muted-foreground">Books completed this year</p>
            </div>
            <div className="text-center p-4 bg-card rounded-xl border-2 border-accent/20 shadow-sm">
              <div className="text-3xl font-bold text-foreground mb-1">{booksInProgress}</div>
              <p className="text-sm text-muted-foreground">Currently reading</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-card rounded-xl border-2 border-secondary/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Yearly Goal</span>
              <span className="text-sm text-muted-foreground">
                {booksReadThisYear} of {yearlyGoal}
              </span>
            </div>
            <Progress value={goalProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {goalProgress >= 100 ? "🎉 Goal achieved!" : `${Math.round(goalProgress)}% complete`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
