"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { Book } from "@/app/page"

interface DataVisualizationsProps {
  books: Book[]
}

export function DataVisualizations({ books }: DataVisualizationsProps) {
  // Prepare genre data for pie chart
  const genreData = books.reduce(
    (acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieChartData = Object.entries(genreData).map(([genre, count]) => ({
    name: genre,
    value: count,
  }))

  // Prepare reading activity data for timeline
  const getMonthlyReadingData = () => {
    const currentYear = new Date().getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const monthlyData = months.map((month, index) => ({
      month,
      completed: 0,
      started: 0,
    }))

    books.forEach((book) => {
      // Count completed books by finish date
      if (book.finishDate) {
        const finishDate = new Date(book.finishDate)
        if (finishDate.getFullYear() === currentYear) {
          const monthIndex = finishDate.getMonth()
          monthlyData[monthIndex].completed += 1
        }
      }

      // Count started books by start date
      if (book.startDate) {
        const startDate = new Date(book.startDate)
        if (startDate.getFullYear() === currentYear) {
          const monthIndex = startDate.getMonth()
          monthlyData[monthIndex].started += 1
        }
      }
    })

    return monthlyData
  }

  const monthlyReadingData = getMonthlyReadingData()

  // Colors for charts using semantic tokens
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--muted-foreground))",
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (books.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Reading Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Books by Genre</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Add some books to see your genre distribution</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reading Activity This Year</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Start reading to track your monthly activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6">Reading Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Books by Genre</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of your {books.length} books across genres</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-card-foreground font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} book{data.value !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Reading Activity Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Activity This Year</CardTitle>
            <p className="text-sm text-muted-foreground">Books started and completed each month</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReadingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="started" fill="hsl(var(--accent))" name="Started" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reading Streak and Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Most Read Genre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {pieChartData.length > 0
                ? pieChartData.reduce((prev, current) => (prev.value > current.value ? prev : current)).name
                : "None yet"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pieChartData.length > 0
                ? `${pieChartData.reduce((prev, current) => (prev.value > current.value ? prev : current)).value} books`
                : "Add books to see stats"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {books.filter((b) => b.rating).length > 0
                ? (
                    books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.filter((b) => b.rating).length
                  ).toFixed(1)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {books.filter((b) => b.rating).length > 0
                ? `Based on ${books.filter((b) => b.rating).length} rated books`
                : "Rate books to see average"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reading Pace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const completedThisYear = books.filter(
                  (book) =>
                    book.status === "Completed" &&
                    book.finishDate &&
                    new Date(book.finishDate).getFullYear() === new Date().getFullYear(),
                ).length
                const monthsElapsed = new Date().getMonth() + 1
                const pace = monthsElapsed > 0 ? (completedThisYear / monthsElapsed).toFixed(1) : "0"
                return `${pace}`
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">books per month this year</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
