import mongoose, { Schema, Model } from "mongoose"
import type { Book } from "@/types"

// Mongoose Document type
export interface BookDocument extends Omit<Book, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId
}

const BookSchema = new Schema<BookDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [500, "Title cannot exceed 500 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      maxlength: [200, "Author cannot exceed 200 characters"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["To Read", "In Progress", "Completed", "Did Not Finish"],
      required: [true, "Status is required"],
      index: true,
    },
    startDate: {
      type: String,
      required: false,
    },
    finishDate: {
      type: String,
      required: false,
      index: true, // For querying books completed in a time range
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: false,
    },
    notes: {
      type: String,
      maxlength: [5000, "Notes cannot exceed 5000 characters"],
      required: false,
    },
    dateAdded: {
      type: String,
      required: [true, "Date added is required"],
      index: true,
    },
    coverUrl: {
      type: String,
      required: false,
    },
    quotes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // Convert _id to id and remove __v when converting to JSON
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

// Compound index for efficient user-specific queries
BookSchema.index({ userId: 1, dateAdded: -1 })
BookSchema.index({ userId: 1, status: 1 })
BookSchema.index({ userId: 1, finishDate: -1 })

// Prevent model recompilation in development
// In dev mode, delete the cached model to ensure schema updates are picked up
if (process.env.NODE_ENV === "development" && mongoose.models.Book) {
  delete mongoose.models.Book
  delete mongoose.connection.models.Book
}

const BookModel: Model<BookDocument> = mongoose.model<BookDocument>("Book", BookSchema)

export default BookModel
