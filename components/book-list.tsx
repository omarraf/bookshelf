"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookDetails } from "@/components/book-details"
import { EmptyState } from "@/components/empty-state"
import { Search, Filter, BookOpen, ArrowUpDown } from "lucide-react"
import type { Book } from "@/types"

interface BookListProps {
  books: Book[]
  onUpdateBook: (id: string, updates: Partial<Book>) => void
  onDeleteBook: (id: string) => void
  onAddBook?: () => void
}

export function BookList({ books, onUpdateBook, onDeleteBook, onAddBook }: BookListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("dateAdded-desc")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  // Show empty state if no books at all
  if (books.length === 0) {
    return <EmptyState type="books" onAction={onAddBook} />
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || book.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title)
      case "title-desc":
        return b.title.localeCompare(a.title)
      case "author-asc":
        return a.author.localeCompare(b.author)
      case "author-desc":
        return b.author.localeCompare(a.author)
      case "dateAdded-asc":
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
      case "dateAdded-desc":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0)
      case "rating-asc":
        return (a.rating || 0) - (b.rating || 0)
      default:
        return 0
    }
  })

  const groupedBooks = {
    "To Read": sortedBooks.filter((book) => book.status === "To Read"),
    "In Progress": sortedBooks.filter((book) => book.status === "In Progress"),
    Completed: sortedBooks.filter((book) => book.status === "Completed"),
    "Did Not Finish": sortedBooks.filter((book) => book.status === "Did Not Finish"),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Read":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Did Not Finish":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getGenreColor = (genre: string) => {
    const colors = {
      Fiction: "bg-purple-50 text-purple-700",
      "Non-Fiction": "bg-green-50 text-green-700",
      Mystery: "bg-gray-50 text-gray-700",
      Romance: "bg-pink-50 text-pink-700",
      "Sci-Fi": "bg-blue-50 text-blue-700",
      Fantasy: "bg-indigo-50 text-indigo-700",
      Biography: "bg-orange-50 text-orange-700",
      History: "bg-yellow-50 text-yellow-700",
    }
    return colors[genre as keyof typeof colors] || "bg-slate-50 text-slate-700"
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter, and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Books</SelectItem>
            <SelectItem value="To Read">To Read</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Did Not Finish">Did Not Finish</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-56">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded-desc">Newest First</SelectItem>
            <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="author-asc">Author (A-Z)</SelectItem>
            <SelectItem value="author-desc">Author (Z-A)</SelectItem>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
            <SelectItem value="rating-asc">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Book Groups */}
      {Object.entries(groupedBooks).map(
        ([status, statusBooks]) =>
          statusBooks.length > 0 && (
            <div key={status}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {status}
                <Badge variant="outline">{statusBooks.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statusBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl || "/placeholder.svg"}
                          alt={`${book.title} cover`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div
                        className={`flex flex-col items-center justify-center text-slate-500 ${book.coverUrl ? "hidden" : ""}`}
                      >
                        <BookOpen className="h-12 w-12 mb-2" />
                        <span className="text-xs text-center px-2">{book.title}</span>
                      </div>
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(book.status)} shadow-sm`}>
                        {book.status}
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {book.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <Badge variant="secondary" className={`text-xs w-fit ${getGenreColor(book.genre)}`}>
                          {book.genre}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {book.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Rating:</span>
                            <div className="text-amber-400">
                              {"★".repeat(book.rating)}
                              {"☆".repeat(5 - book.rating)}
                            </div>
                          </div>
                        )}
                        {book.startDate && (
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(book.startDate).toLocaleDateString()}
                          </p>
                        )}
                        {book.finishDate && (
                          <p className="text-xs text-muted-foreground">
                            Finished: {new Date(book.finishDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                        onClick={() => setSelectedBook(book)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ),
      )}

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No books found. Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Book Details Dialog */}
      {selectedBook && (
        <BookDetails
          book={selectedBook}
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          onUpdateBook={onUpdateBook}
          onDeleteBook={onDeleteBook}
        />
      )}
    </div>
  )
}
