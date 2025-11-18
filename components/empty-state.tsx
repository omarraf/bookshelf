import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, BookMarked, Calendar, TrendingUp } from "lucide-react"

interface EmptyStateProps {
  type: "books" | "reading-sessions" | "stats"
  onAction?: () => void
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const config = {
    books: {
      icon: BookOpen,
      title: "Your bookshelf is empty",
      description: "Start building your reading collection by adding your first book!",
      actionLabel: "Add Your First Book",
      tips: [
        "Track books you've read, are reading, or want to read",
        "Add ratings, notes, and memorable quotes",
        "Visualize your reading journey with stats and heatmaps",
      ],
    },
    "reading-sessions": {
      icon: Calendar,
      title: "No reading sessions yet",
      description: "Start tracking your daily reading time to build your reading habit!",
      actionLabel: "Log Reading Time",
      tips: [
        "Build reading streaks by logging time daily",
        "See your progress on the reading heatmap",
        "Track how many minutes you read each day",
      ],
    },
    stats: {
      icon: TrendingUp,
      title: "No data to display",
      description: "Add some books and reading sessions to see your stats come to life!",
      actionLabel: null,
      tips: [
        "Complete books to track your yearly goal progress",
        "Log reading sessions to visualize your habits",
        "Watch your stats grow as you build your library",
      ],
    },
  }

  const { icon: Icon, title, description, actionLabel, tips } = config[type]

  return (
    <Card className="border-dashed border-2 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Icon className="h-12 w-12 text-primary" />
        </div>

        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="mb-8">
            <BookMarked className="mr-2 h-5 w-5" />
            {actionLabel}
          </Button>
        )}

        <div className="space-y-3 text-sm text-muted-foreground max-w-md">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <p className="text-left flex-1">{tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
