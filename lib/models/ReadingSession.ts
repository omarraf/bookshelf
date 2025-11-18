import mongoose, { Schema, Model } from "mongoose"
import type { ReadingSession } from "@/types"

// Mongoose Document type
export interface ReadingSessionDocument extends Omit<ReadingSession, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId
}

const ReadingSessionSchema = new Schema<ReadingSessionDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      index: true,
      // Validate YYYY-MM-DD format
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    minutes: {
      type: Number,
      required: [true, "Minutes is required"],
      min: [0, "Minutes must be at least 0"],
      max: [1440, "Minutes cannot exceed 24 hours (1440 minutes)"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound indexes for efficient queries
ReadingSessionSchema.index({ userId: 1, date: -1 })
// Prevent duplicate sessions on the same day (optional - remove if users can log multiple sessions per day)
// ReadingSessionSchema.index({ userId: 1, date: 1 }, { unique: true })

// In dev mode, delete the cached model to ensure schema updates are picked up
if (process.env.NODE_ENV === "development" && mongoose.models.ReadingSession) {
  delete mongoose.models.ReadingSession
  delete mongoose.connection.models.ReadingSession
}

const ReadingSessionModel: Model<ReadingSessionDocument> =
  mongoose.model<ReadingSessionDocument>("ReadingSession", ReadingSessionSchema)

export default ReadingSessionModel
