"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, ImageIcon } from "lucide-react"
import type { Book } from "@/app/page"

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBook: (book: Omit<Book, "id" | "dateAdded">) => void
}

const genres = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Fantasy",
  "Biography",
  "History",
  "Self-Help",
  "Business",
  "Health",
  "Travel",
  "Cooking",
  "Art",
  "Poetry",
  "Drama",
  "Other",
]

export function AddBookDialog({ open, onOpenChange, onAddBook }: AddBookDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    status: "To Read" as const,
    startDate: "",
    finishDate: "",
    notes: "",
    coverUrl: "",
    quotes: [] as string[],
  })
  const [newQuote, setNewQuote] = useState("")

  const addQuote = () => {
    if (newQuote.trim()) {
      setFormData((prev) => ({
        ...prev,
        quotes: [...prev.quotes, newQuote.trim()],
      }))
      setNewQuote("")
    }
  }

  const removeQuote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.author || !formData.genre) return

    onAddBook({
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      status: formData.status,
      startDate: formData.startDate || undefined,
      finishDate: formData.finishDate || undefined,
      notes: formData.notes || undefined,
      coverUrl: formData.coverUrl || undefined,
      quotes: formData.quotes.length > 0 ? formData.quotes : undefined,
    })

    // Reset form
    setFormData({
      title: "",
      author: "",
      genre: "",
      status: "To Read",
      startDate: "",
      finishDate: "",
      notes: "",
      coverUrl: "",
      quotes: [],
    })
    setNewQuote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Book
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Enter author name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, genre: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Read">To Read</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Did Not Finish">Did Not Finish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Cover Image URL
            </Label>
            <Input
              id="coverUrl"
              value={formData.coverUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverUrl: e.target.value }))}
              placeholder="https://example.com/book-cover.jpg"
            />
            {formData.coverUrl && (
              <div className="mt-2">
                <img
                  src={formData.coverUrl || "/placeholder.svg"}
                  alt="Book cover preview"
                  className="w-20 h-28 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finishDate">Finish Date</Label>
              <Input
                id="finishDate"
                type="date"
                value={formData.finishDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, finishDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes or thoughts about this book..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Favorite Quotes</Label>
            <div className="flex gap-2">
              <Input
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="Add a memorable quote from this book..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addQuote())}
              />
              <Button type="button" onClick={addQuote} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.quotes.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.quotes.map((quote, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                    <p className="text-sm flex-1 italic">"{quote}"</p>
                    <Button
                      type="button"
                      onClick={() => removeQuote(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Add Book
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
