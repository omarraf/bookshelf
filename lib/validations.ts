import { z } from "zod"

// Book validation schema
export const bookSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(500),
  author: z.string().min(1, "Author is required").max(200),
  genre: z.string().min(1, "Genre is required"),
  status: z.enum(["To Read", "In Progress", "Completed", "Did Not Finish"]),
  startDate: z.string().optional(),
  finishDate: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().max(5000).optional(),
  dateAdded: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  quotes: z.array(z.string()).optional(),
})

export const createBookSchema = bookSchema.omit({ id: true })
export const updateBookSchema = bookSchema.partial().required({ id: true })

// Reading Session validation schema
export const readingSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  minutes: z.number().min(1, "Minutes must be at least 1").max(1440, "Minutes cannot exceed 24 hours"),
})

export const createReadingSessionSchema = readingSessionSchema

// User Settings validation schema
export const userSettingsSchema = z.object({
  yearlyGoal: z.number().min(1, "Yearly goal must be at least 1").max(1000, "Yearly goal cannot exceed 1000"),
  preferences: z.object({
    theme: z.string().optional(),
    defaultView: z.string().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
})

export const updateUserSettingsSchema = userSettingsSchema.partial()

// Migration data validation schema
export const migrationDataSchema = z.object({
  books: z.array(bookSchema.omit({ id: true })),
  readingSessions: z.array(readingSessionSchema),
})

// Type inference from schemas
export type BookInput = z.infer<typeof bookSchema>
export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type ReadingSessionInput = z.infer<typeof readingSessionSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema>
export type MigrationDataInput = z.infer<typeof migrationDataSchema>
