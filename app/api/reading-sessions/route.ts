import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import ReadingSessionModel from "@/lib/models/ReadingSession"
import { createReadingSessionSchema } from "@/lib/validations"
import { v4 as uuidv4 } from "uuid"

// GET /api/reading-sessions - Get all reading sessions for the authenticated user
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
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

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

    // Generate a UUID for the session
    const sessionId = uuidv4()

    // Check if a session already exists for this date
    const existingSession = await ReadingSessionModel.findOne({
      userId,
      date: validation.data.date,
    })

    let session

    if (existingSession) {
      // Update existing session by adding minutes
      session = await ReadingSessionModel.findByIdAndUpdate(
        existingSession._id,
        { $inc: { minutes: validation.data.minutes } },
        { new: true }
      )
    } else {
      // Create new session
      session = await ReadingSessionModel.create({
        ...validation.data,
        userId,
        _id: sessionId,
      })
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Failed to create reading session" },
        { status: 500 }
      )
    }

    // Transform to our ReadingSession type
    const transformedSession = {
      id: session._id.toString(),
      userId: session.userId,
      date: session.date,
      minutes: session.minutes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
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
