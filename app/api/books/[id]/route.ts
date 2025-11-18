import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import BookModel from "@/lib/models/Book"
import { updateBookSchema } from "@/lib/validations"

// PUT /api/books/[id] - Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validation = updateBookSchema.safeParse({ ...body, id })

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

    // Find the book and verify ownership
    const existingBook = await BookModel.findById(id)

    if (!existingBook) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      )
    }

    if (existingBook.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden - You can only update your own books" },
        { status: 403 }
      )
    }

    // Update the book
    const { id: _, ...updateData } = validation.data
    const updatedBook = await BookModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: "Failed to update book" },
        { status: 500 }
      )
    }

    // Transform to our Book type
    const transformedBook = {
      id: updatedBook._id.toString(),
      userId: updatedBook.userId,
      title: updatedBook.title,
      author: updatedBook.author,
      genre: updatedBook.genre,
      status: updatedBook.status,
      startDate: updatedBook.startDate,
      finishDate: updatedBook.finishDate,
      rating: updatedBook.rating,
      notes: updatedBook.notes,
      dateAdded: updatedBook.dateAdded,
      coverUrl: updatedBook.coverUrl,
      quotes: updatedBook.quotes || [],
      createdAt: updatedBook.createdAt,
      updatedAt: updatedBook.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedBook,
      message: "Book updated successfully",
    })
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update book",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await dbConnect()

    // Find the book and verify ownership
    const book = await BookModel.findById(id)

    if (!book) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      )
    }

    if (book.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden - You can only delete your own books" },
        { status: 403 }
      )
    }

    // Delete the book
    await BookModel.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Book deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete book",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
