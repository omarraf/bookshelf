"use client"

import { useState, useEffect } from "react"
import { BookList } from "@/components/book-list"
import { AddBookDialog } from "@/components/add-book-dialog"
import { DashboardStats } from "@/components/dashboard-stats"
import { ReadingHeatmap } from "@/components/reading-heatmap"
import { QuoteOfTheDay } from "@/components/quote-of-the-day"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from "lucide-react"
import confetti from "canvas-confetti"

export interface Book {
  id: string
  title: string
  author: string
  genre: string
  status: "To Read" | "In Progress" | "Completed"
  startDate?: string
  finishDate?: string
  rating?: number
  notes?: string
  dateAdded: string
  coverUrl?: string
  quotes?: string[]
}

export interface ReadingSession {
  date: string
  minutes: number
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem("books")
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks))
    }

    const savedSessions = localStorage.getItem("readingSessions")
    if (savedSessions) {
      setReadingSessions(JSON.parse(savedSessions))
    }
  }, [])

  // Save books to localStorage whenever books change
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books))
  }, [books])

  useEffect(() => {
    localStorage.setItem("readingSessions", JSON.stringify(readingSessions))
  }, [readingSessions])

  const addBook = (book: Omit<Book, "id" | "dateAdded">) => {
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    }
    setBooks((prev) => [...prev, newBook])

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const updateBook = (id: string, updates: Partial<Book>) => {
    const book = books.find((b) => b.id === id)
    const wasCompleted = book?.status === "Completed"
    const isNowCompleted = updates.status === "Completed"

    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, ...updates } : book)))

    if (!wasCompleted && isNowCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#059669", "#047857"],
      })
    }
  }

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id))
  }

  const addReadingSession = (session: ReadingSession) => {
    setReadingSessions((prev) => {
      // Check if session for this date already exists
      const existingIndex = prev.findIndex((s) => s.date === session.date)
      if (existingIndex >= 0) {
        // Update existing session by adding minutes
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          minutes: updated[existingIndex].minutes + session.minutes,
        }
        return updated
      } else {
        // Add new session
        return [...prev, session]
      }
    })

    // Show confetti for logging reading time
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#10b981", "#059669"],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-card rounded-full shadow-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">My Reading Nook</h1>
          <p className="text-muted-foreground text-lg">A cozy place to track your literary adventures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <DashboardStats books={books} />
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
      </div>
    </div>
  )
}
