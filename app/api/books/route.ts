import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import BookModel from "@/lib/models/Book"
import { createBookSchema } from "@/lib/validations"
import { v4 as uuidv4 } from "uuid"

// GET /api/books - Get all books for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()

    const books = await BookModel.find({ userId }).sort({ dateAdded: -1 }).lean()

    // Transform MongoDB documents to match our Book type
    const transformedBooks = books.map((book) => ({
      id: book._id.toString(),
      userId: book.userId,
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
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: transformedBooks,
    })
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch books",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = createBookSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    await dbConnect()

    // Generate a UUID for the book if not provided
    const bookId = uuidv4()

    // Create book with userId
    const book = await BookModel.create({
      ...validation.data,
      userId,
      _id: bookId,
      dateAdded: validation.data.dateAdded || new Date().toISOString(),
    })

    // Transform to our Book type
    const transformedBook = {
      id: book._id.toString(),
      userId: book.userId,
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
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedBook,
        message: "Book created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create book",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
