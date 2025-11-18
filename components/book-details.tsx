"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Edit, Trash2, Save, X } from "lucide-react"
import type { Book } from "@/app/page"

interface BookDetailsProps {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateBook: (id: string, updates: Partial<Book>) => void
  onDeleteBook: (id: string) => void
}

export function BookDetails({ book, open, onOpenChange, onUpdateBook, onDeleteBook }: BookDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(book)

  const handleSave = () => {
    onUpdateBook(book.id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(book)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this book?")) {
      onDeleteBook(book.id)
      onOpenChange(false)
    }
  }

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => onRatingChange?.(star)}
          />
        ))}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Read":
        return "bg-secondary text-secondary-foreground"
      case "In Progress":
        return "bg-accent text-accent-foreground"
      case "Completed":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{book.title}</DialogTitle>
              <p className="text-muted-foreground mt-1">by {book.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
              {!isEditing && (
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={editData.author}
                    onChange={(e) => setEditData((prev) => ({ ...prev, author: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Input
                    value={editData.genre}
                    onChange={(e) => setEditData((prev) => ({ ...prev, genre: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value: any) => setEditData((prev) => ({ ...prev, status: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editData.startDate || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Finish Date</Label>
                  <Input
                    type="date"
                    value={editData.finishDate || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, finishDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                {renderStars(editData.rating || 0, (rating) => setEditData((prev) => ({ ...prev, rating })))}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editData.notes || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add your thoughts, reflections, or notes about this book..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Genre</Label>
                  <p className="mt-1">{book.genre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1">{book.status}</p>
                </div>
              </div>

              {(book.startDate || book.finishDate) && (
                <div className="grid grid-cols-2 gap-4">
                  {book.startDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Started</Label>
                      <p className="mt-1">{new Date(book.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {book.finishDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Finished</Label>
                      <p className="mt-1">{new Date(book.finishDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {book.rating && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                  <div className="mt-1">{renderStars(book.rating)}</div>
                </div>
              )}

              {book.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm leading-relaxed">{book.notes}</p>
                </div>
              )}

              <Separator />

              <div className="text-xs text-muted-foreground">
                Added on {new Date(book.dateAdded).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
