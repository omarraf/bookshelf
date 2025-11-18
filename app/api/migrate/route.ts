import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import dbConnect from "@/lib/mongodb"
import BookModel from "@/lib/models/Book"
import ReadingSessionModel from "@/lib/models/ReadingSession"
import { migrationDataSchema } from "@/lib/validations"

// POST /api/migrate - Migrate localStorage data to database
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const body = await request.json()

    // Validate request body
    const validation = migrationDataSchema.safeParse(body)

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

    const { books, readingSessions } = validation.data
    const results = {
      booksCreated: 0,
      sessionsCreated: 0,
      errors: [] as string[],
    }

    // Migrate books
    for (const book of books) {
      try {
        await BookModel.create({
          ...book,
          userId,
          dateAdded: book.dateAdded || new Date().toISOString(),
        })
        results.booksCreated++
      } catch (error) {
        results.errors.push(
          `Failed to migrate book "${book.title}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      }
    }

    // Migrate reading sessions
    for (const session of readingSessions) {
      try {
        // Check if a session already exists for this date
        const existingSession = await ReadingSessionModel.findOne({
          userId,
          date: session.date,
        })

        if (existingSession) {
          // Update existing session by adding minutes
          await ReadingSessionModel.findByIdAndUpdate(existingSession._id, {
            $inc: { minutes: session.minutes },
          })
          results.sessionsCreated++
        } else {
          // Create new session (let Mongoose auto-generate ObjectId)
          await ReadingSessionModel.create({
            ...session,
            userId,
          })
          results.sessionsCreated++
        }
      } catch (error) {
        results.errors.push(
          `Failed to migrate reading session for ${session.date}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Migration completed: ${results.booksCreated} books and ${results.sessionsCreated} reading sessions imported`,
    })
  } catch (error) {
    console.error("Error during migration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
