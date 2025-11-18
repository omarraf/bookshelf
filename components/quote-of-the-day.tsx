"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "lucide-react"
import type { Book } from "@/app/page"

interface QuoteOfTheDayProps {
  books: Book[]
}

export function QuoteOfTheDay({ books }: QuoteOfTheDayProps) {
  const getRandomQuote = () => {
    const allQuotes = books
      .filter((book) => book.quotes && book.quotes.length > 0)
      .flatMap((book) => book.quotes!.map((quote) => ({ quote, book: book.title, author: book.author })))

    if (allQuotes.length === 0) {
      return {
        quote: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
        book: "A Dance with Dragons",
        author: "George R.R. Martin",
      }
    }

    const today = new Date().toDateString()
    const savedQuote = localStorage.getItem(`quote-${today}`)

    if (savedQuote) {
      return JSON.parse(savedQuote)
    }

    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)]
    localStorage.setItem(`quote-${today}`, JSON.stringify(randomQuote))

    return randomQuote
  }

  const { quote, book, author } = getRandomQuote()

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Quote className="h-5 w-5" />
          Quote of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="text-sm text-blue-900 italic leading-relaxed">"{quote}"</blockquote>
        <footer className="mt-3 text-xs text-blue-700">
          — <cite className="font-medium">{book}</cite> by {author}
        </footer>
      </CardContent>
    </Card>
  )
}
