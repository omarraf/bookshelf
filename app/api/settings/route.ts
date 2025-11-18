import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import UserSettingsModel from "@/lib/models/UserSettings"
import { updateUserSettingsSchema } from "@/lib/validations"

// GET /api/settings - Get user settings
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

    let settings = await UserSettingsModel.findOne({ userId }).lean()

    // If no settings exist, create default settings
    if (!settings) {
      const newSettings = await UserSettingsModel.create({
        userId,
        yearlyGoal: 24,
        preferences: {
          notifications: true,
        },
      })
      settings = newSettings.toObject()
    }

    // Transform to our UserSettings type
    const transformedSettings = {
      id: settings._id.toString(),
      userId: settings.userId,
      yearlyGoal: settings.yearlyGoal,
      preferences: settings.preferences,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedSettings,
    })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
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
    const validation = updateUserSettingsSchema.safeParse(body)

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

    // Find existing settings
    let settings = await UserSettingsModel.findOne({ userId })

    if (!settings) {
      // Create new settings if they don't exist
      settings = await UserSettingsModel.create({
        userId,
        yearlyGoal: validation.data.yearlyGoal || 24,
        preferences: validation.data.preferences,
      })
    } else {
      // Update existing settings
      if (validation.data.yearlyGoal !== undefined) {
        settings.yearlyGoal = validation.data.yearlyGoal
      }
      if (validation.data.preferences !== undefined) {
        settings.preferences = {
          ...settings.preferences,
          ...validation.data.preferences,
        }
      }
      await settings.save()
    }

    // Transform to our UserSettings type
    const transformedSettings = {
      id: settings._id.toString(),
      userId: settings.userId,
      yearlyGoal: settings.yearlyGoal,
      preferences: settings.preferences,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedSettings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
