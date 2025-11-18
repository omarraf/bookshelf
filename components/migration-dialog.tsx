"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"

interface MigrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMigrationComplete: () => void
}

export function MigrationDialog({ open, onOpenChange, onMigrationComplete }: MigrationDialogProps) {
  const [isMigrating, setIsMigrating] = useState(false)

  const handleMigrate = async () => {
    setIsMigrating(true)

    try {
      // Get data from localStorage
      const booksJson = localStorage.getItem("books")
      const sessionsJson = localStorage.getItem("readingSessions")

      const books = booksJson ? JSON.parse(booksJson) : []
      const readingSessions = sessionsJson ? JSON.parse(sessionsJson) : []

      if (books.length === 0 && readingSessions.length === 0) {
        toast.info("No data found to migrate.")
        onOpenChange(false)
        return
      }

      // Send migration request
      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          books: books.map((book: any) => ({
            title: book.title,
            author: book.author,
            genre: book.genre,
            status: book.status,
            startDate: book.startDate,
            finishDate: book.finishDate,
            rating: book.rating,
            notes: book.notes,
            dateAdded: book.dateAdded,
            coverUrl: book.coverUrl,
            quotes: book.quotes || [],
          })),
          readingSessions,
        }),
      })

      if (!res.ok) {
        throw new Error("Migration failed")
      }

      const data = await res.json()

      // Clear localStorage
      localStorage.removeItem("books")
      localStorage.removeItem("readingSessions")

      toast.success(
        `Successfully migrated ${data.data.booksCreated} books and ${data.data.sessionsCreated} reading sessions!`
      )

      onMigrationComplete()
      onOpenChange(false)
    } catch (error) {
      console.error("Migration error:", error)
      toast.error("Failed to migrate data. Please try again or start fresh.")
    } finally {
      setIsMigrating(false)
    }
  }

  const handleStartFresh = () => {
    // Clear localStorage
    localStorage.removeItem("books")
    localStorage.removeItem("readingSessions")

    toast.info("Starting with a fresh bookshelf!")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Existing Data?
          </DialogTitle>
          <DialogDescription>
            We detected existing book data on this device. Would you like to import it to your new account?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">What will be imported:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All your saved books</li>
              <li>Reading sessions and history</li>
              <li>Book ratings, notes, and quotes</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleStartFresh}
            disabled={isMigrating}
            className="gap-2 w-full sm:w-auto"
          >
            <X className="h-4 w-4" />
            Start Fresh
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="gap-2 w-full sm:w-auto"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
