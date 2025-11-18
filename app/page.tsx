"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { Header } from "@/components/header"
import { BookList } from "@/components/book-list"
import { AddBookDialog } from "@/components/add-book-dialog"
import { DashboardStats } from "@/components/dashboard-stats"
import { ReadingHeatmap } from "@/components/reading-heatmap"
import { QuoteOfTheDay } from "@/components/quote-of-the-day"
import { MigrationDialog } from "@/components/migration-dialog"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Loader2 } from "lucide-react"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import type { Book, ReadingSession, UserSettings } from "@/types"

export default function HomePage() {
  const { data: session, isPending } = useSession()
  const [books, setBooks] = useState<Book[]>([])
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)

  // Load data from API on mount
  useEffect(() => {
    if (!isPending && session) {
      loadData()
    }
  }, [isPending, session])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Fetch all data in parallel
      const [booksRes, sessionsRes, settingsRes] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/reading-sessions"),
        fetch("/api/settings"),
      ])

      if (!booksRes.ok || !sessionsRes.ok || !settingsRes.ok) {
        throw new Error("Failed to load data")
      }

      const [booksData, sessionsData, settingsData] = await Promise.all([
        booksRes.json(),
        sessionsRes.json(),
        settingsRes.json(),
      ])

      setBooks(booksData.data || [])
      setReadingSessions(sessionsData.data || [])
      setUserSettings(settingsData.data)

      // Check if we should show migration dialog
      if (booksData.data.length === 0) {
        const hasLocalStorageData =
          localStorage.getItem("books") || localStorage.getItem("readingSessions")
        if (hasLocalStorageData) {
          setShowMigrationDialog(true)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load your data. Please try refreshing the page.")
    } finally {
      setIsLoading(false)
    }
  }

  const addBook = async (book: Omit<Book, "id" | "dateAdded" | "userId">) => {
    // Optimistic update
    const tempId = crypto.randomUUID()
    const newBook: Book = {
      ...book,
      id: tempId,
      userId: "",
      dateAdded: new Date().toISOString(),
    }
    setBooks((prev) => [...prev, newBook])

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      })

      if (!res.ok) {
        throw new Error("Failed to add book")
      }

      const data = await res.json()

      // Replace temp book with real data from server
      setBooks((prev) => prev.map((b) => (b.id === tempId ? data.data : b)))

      toast.success("Book added successfully!")
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (error) {
      // Revert optimistic update
      setBooks((prev) => prev.filter((b) => b.id !== tempId))
      console.error("Error adding book:", error)
      toast.error("Failed to add book. Please try again.")
    }
  }

  const updateBook = async (id: string, updates: Partial<Book>) => {
    const book = books.find((b) => b.id === id)
    const wasCompleted = book?.status === "Completed"
    const isNowCompleted = updates.status === "Completed"

    // Optimistic update
    const previousBooks = books
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, ...updates } : book)))

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error("Failed to update book")
      }

      const data = await res.json()
      setBooks((prev) => prev.map((b) => (b.id === id ? data.data : b)))

      toast.success("Book updated successfully!")

      if (!wasCompleted && isNowCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#059669", "#047857"],
        })
      }
    } catch (error) {
      // Revert optimistic update
      setBooks(previousBooks)
      console.error("Error updating book:", error)
      toast.error("Failed to update book. Please try again.")
    }
  }

  const deleteBook = async (id: string) => {
    // Optimistic update
    const previousBooks = books
    setBooks((prev) => prev.filter((book) => book.id !== id))

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete book")
      }

      toast.success("Book deleted successfully!")
    } catch (error) {
      // Revert optimistic update
      setBooks(previousBooks)
      console.error("Error deleting book:", error)
      toast.error("Failed to delete book. Please try again.")
    }
  }

  const addReadingSession = async (session: ReadingSession) => {
    // Optimistic update
    const previousSessions = readingSessions
    setReadingSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.date === session.date)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          minutes: updated[existingIndex].minutes + session.minutes,
        }
        return updated
      } else {
        return [...prev, session]
      }
    })

    try {
      const res = await fetch("/api/reading-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      })

      if (!res.ok) {
        throw new Error("Failed to add reading session")
      }

      const data = await res.json()

      // Update with server data
      setReadingSessions((prev) => {
        const existingIndex = prev.findIndex((s) => s.date === session.date)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = data.data
          return updated
        } else {
          return [...prev, data.data]
        }
      })

      toast.success("Reading time logged successfully!")
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#10b981", "#059669"],
      })
    } catch (error) {
      // Revert optimistic update
      setReadingSessions(previousSessions)
      console.error("Error adding reading session:", error)
      toast.error("Failed to log reading time. Please try again.")
    }
  }

  const handleMigrationComplete = () => {
    setShowMigrationDialog(false)
    loadData() // Reload data after migration
  }

  // Show loading state
  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookshelf...</p>
        </div>
      </div>
    )
  }

  // User must be signed in (middleware should handle this, but just in case)
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <DashboardStats books={books} yearlyGoal={userSettings?.yearlyGoal || 24} />
            <QuoteOfTheDay books={books} />
          </div>
          <div>
            <ReadingHeatmap sessions={readingSessions} onAddSession={addReadingSession} />
          </div>
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg rounded-full"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add a New Book
          </Button>
        </div>

        {/* Book List */}
        <BookList books={books} onUpdateBook={updateBook} onDeleteBook={deleteBook} />

        {/* Add Book Dialog */}
        <AddBookDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddBook={addBook} />

        {/* Migration Dialog */}
        <MigrationDialog
          open={showMigrationDialog}
          onOpenChange={setShowMigrationDialog}
          onMigrationComplete={handleMigrationComplete}
        />
      </div>
    </div>
  )
}
