// Core data types for the bookshelf application

export interface Book {
  id: string
  userId: string
  title: string
  author: string
  genre: string
  status: "To Read" | "In Progress" | "Completed" | "Did Not Finish"
  startDate?: string
  finishDate?: string
  rating?: number
  notes?: string
  dateAdded: string
  coverUrl?: string
  quotes?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ReadingSession {
  id: string
  userId: string
  date: string
  minutes: number
  createdAt?: Date
  updatedAt?: Date
}

export interface UserSettings {
  id: string
  userId: string
  yearlyGoal: number
  preferences?: {
    theme?: string
    defaultView?: string
    notifications?: boolean
  }
  createdAt?: Date
  updatedAt?: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types for client-side (without userId and database-specific fields)
export interface BookFormData {
  id?: string
  title: string
  author: string
  genre: string
  status: "To Read" | "In Progress" | "Completed" | "Did Not Finish"
  startDate?: string
  finishDate?: string
  rating?: number
  notes?: string
  dateAdded?: string
  coverUrl?: string
  quotes?: string[]
}

export interface ReadingSessionFormData {
  date: string
  minutes: number
}

export interface UserSettingsFormData {
  yearlyGoal: number
  preferences?: {
    theme?: string
    defaultView?: string
    notifications?: boolean
  }
}

// Migration types
export interface MigrationData {
  books: BookFormData[]
  readingSessions: ReadingSessionFormData[]
}
