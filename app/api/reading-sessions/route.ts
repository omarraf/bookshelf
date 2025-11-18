import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import dbConnect from "@/lib/mongodb"
import ReadingSessionModel from "@/lib/models/ReadingSession"
import { createReadingSessionSchema } from "@/lib/validations"

// GET /api/reading-sessions - Get all reading sessions for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    await dbConnect()

    const sessions = await ReadingSessionModel.find({ userId })
      .sort({ date: -1 })
      .lean()

    // Transform MongoDB documents to match our ReadingSession type
    const transformedSessions = sessions.map((session) => ({
      id: session._id.toString(),
      userId: session.userId,
      date: session.date,
      minutes: session.minutes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: transformedSessions,
    })
  } catch (error) {
    console.error("Error fetching reading sessions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reading sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST /api/reading-sessions - Create a new reading session
export async function POST(request: NextRequest) {
  try {
    const authSession = await getSession()

    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = authSession.user.id

    const body = await request.json()

    // Validate request body
    const validation = createReadingSessionSchema.safeParse(body)

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

    // Check if a session already exists for this date
    const existingSession = await ReadingSessionModel.findOne({
      userId,
      date: validation.data.date,
    })

    let readingSession

    if (existingSession) {
      // If minutes is 0, delete the session (for delete functionality)
      if (validation.data.minutes === 0) {
        await ReadingSessionModel.findByIdAndDelete(existingSession._id)
        return NextResponse.json({
          success: true,
          message: "Reading session deleted successfully",
        })
      }

      // Update existing session by setting minutes (not adding)
      readingSession = await ReadingSessionModel.findByIdAndUpdate(
        existingSession._id,
        { minutes: validation.data.minutes },
        { new: true }
      )
    } else {
      // Don't create a session with 0 minutes
      if (validation.data.minutes === 0) {
        return NextResponse.json({
          success: true,
          message: "No session to delete",
        })
      }

      // Create new session (let Mongoose auto-generate ObjectId)
      readingSession = await ReadingSessionModel.create({
        ...validation.data,
        userId,
      })
    }

    if (!readingSession) {
      return NextResponse.json(
        { success: false, error: "Failed to create reading session" },
        { status: 500 }
      )
    }

    // Transform to our ReadingSession type
    const transformedSession = {
      id: readingSession._id.toString(),
      userId: readingSession.userId,
      date: readingSession.date,
      minutes: readingSession.minutes,
      createdAt: readingSession.createdAt,
      updatedAt: readingSession.updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedSession,
        message: existingSession
          ? "Reading session updated successfully"
          : "Reading session created successfully",
      },
      { status: existingSession ? 200 : 201 }
    )
  } catch (error) {
    console.error("Error creating reading session:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reading session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
