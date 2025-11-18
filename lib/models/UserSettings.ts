import mongoose, { Schema, Model } from "mongoose"
import type { UserSettings } from "@/types"

// Mongoose Document type
export interface UserSettingsDocument extends Omit<UserSettings, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId
}

const UserSettingsSchema = new Schema<UserSettingsDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    yearlyGoal: {
      type: Number,
      required: true,
      default: 24,
      min: [1, "Yearly goal must be at least 1"],
      max: [1000, "Yearly goal cannot exceed 1000"],
    },
    preferences: {
      theme: {
        type: String,
        required: false,
      },
      defaultView: {
        type: String,
        required: false,
      },
      notifications: {
        type: Boolean,
        required: false,
        default: true,
      },
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

const UserSettingsModel: Model<UserSettingsDocument> =
  mongoose.models.UserSettings ||
  mongoose.model<UserSettingsDocument>("UserSettings", UserSettingsSchema)

export default UserSettingsModel
