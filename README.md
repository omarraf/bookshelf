# 📚 Bookshelf - Reading Tracker App

A beautiful, full-featured reading tracker application built with Next.js 14, MongoDB, and Clerk authentication. Track your books, reading sessions, set yearly goals, and visualize your reading journey.

## ✨ Features

- **Multi-User Support**: Secure authentication with Clerk
- **Book Management**: Add, edit, delete books with rich metadata (title, author, genre, status, ratings, notes, quotes, cover images)
- **Reading Sessions**: Track daily reading time with visual heatmap
- **Dashboard Stats**: Real-time statistics and progress tracking
- **Yearly Goals**: Set and track your reading goals
- **Data Migration**: Import existing localStorage data on first login
- **Beautiful UI**: Modern design with dark mode support
- **Optimistic Updates**: Fast, responsive UI with server validation
- **Toast Notifications**: User-friendly feedback for all actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Clerk account (free tier available)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bookshelf
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: We use `--legacy-peer-deps` due to React 19 compatibility with Next.js 14.

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and log in
3. Create a new cluster (free tier M0 is sufficient)
4. Click "Connect" and choose "Connect your application"
5. Copy your connection string (it looks like: `mongodb+srv://...`)
6. Replace `<password>` with your database user password
7. Replace `<database>` with your database name (e.g., `bookshelf`)

### 4. Set Up Clerk Authentication

1. Go to [Clerk](https://clerk.com)
2. Create a free account and log in
3. Create a new application
4. Go to "API Keys" in the dashboard
5. Copy your Publishable Key and Secret Key

### 5. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and fill in your credentials:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bookshelf?retryWrites=true&w=majority
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. First-Time Setup

1. Click "Sign Up" to create your account
2. If you have existing data in localStorage, you'll see a migration dialog
3. Choose to import your data or start fresh
4. Start tracking your books!

## 📖 Usage Guide

### Adding Books

1. Click the "Add a New Book" button
2. Fill in book details (title and author are required)
3. Add optional metadata: genre, status, dates, rating, notes, quotes, cover URL
4. Submit to save

### Tracking Reading Sessions

1. Find the reading heatmap on the dashboard
2. Click "Log Reading Time"
3. Select a date and enter minutes read
4. Sessions for the same day are automatically combined

### Setting Your Yearly Goal

1. Click the Settings icon in the header
2. Adjust your yearly reading goal
3. Save changes
4. Your dashboard will reflect the new goal

### Updating Books

1. Click on any book card to view details
2. Click "Edit" to modify book information
3. Changes are saved immediately

## 🔧 API Documentation

All API routes require authentication via Clerk. Requests without a valid session return `401 Unauthorized`.

### Books API

#### GET `/api/books`
Get all books for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user_xxx",
      "title": "Book Title",
      "author": "Author Name",
      "genre": "Fiction",
      "status": "Completed",
      "rating": 5,
      "dateAdded": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/books`
Create a new book.

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Fiction",
  "status": "To Read",
  "coverUrl": "https://...",
  "notes": "My notes",
  "quotes": ["Quote 1", "Quote 2"]
}
```

#### PUT `/api/books/[id]`
Update a book by ID.

**Request Body:**
```json
{
  "status": "Completed",
  "rating": 5,
  "finishDate": "2024-01-15"
}
```

#### DELETE `/api/books/[id]`
Delete a book by ID.

### Reading Sessions API

#### GET `/api/reading-sessions`
Get all reading sessions for the authenticated user.

#### POST `/api/reading-sessions`
Log reading time. If a session exists for the date, minutes are added to it.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "minutes": 60
}
```

### Settings API

#### GET `/api/settings`
Get user settings. Creates default settings if none exist.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user_xxx",
    "yearlyGoal": 24,
    "preferences": {
      "notifications": true
    }
  }
}
```

#### PUT `/api/settings`
Update user settings.

**Request Body:**
```json
{
  "yearlyGoal": 50
}
```

### Migration API

#### POST `/api/migrate`
Migrate localStorage data to database (one-time use for new users).

**Request Body:**
```json
{
  "books": [...],
  "readingSessions": [...]
}
```

## 🗄️ Database Schema

### Books Collection

```typescript
{
  _id: ObjectId,
  userId: String (indexed),
  title: String,
  author: String,
  genre: String (indexed),
  status: "To Read" | "In Progress" | "Completed" (indexed),
  startDate?: String,
  finishDate?: String (indexed),
  rating?: Number (0-5),
  notes?: String,
  dateAdded: String (indexed),
  coverUrl?: String,
  quotes?: String[],
  createdAt: Date,
  updatedAt: Date
}
```

### ReadingSessions Collection

```typescript
{
  _id: ObjectId,
  userId: String (indexed),
  date: String (YYYY-MM-DD format, indexed),
  minutes: Number (1-1440),
  createdAt: Date,
  updatedAt: Date
}
```

### UserSettings Collection

```typescript
{
  _id: ObjectId,
  userId: String (unique, indexed),
  yearlyGoal: Number (default: 24),
  preferences: {
    theme?: String,
    defaultView?: String,
    notifications?: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **Validation**: Zod schemas
- **Charts**: Recharts
- **Notifications**: Sonner
- **Animations**: Canvas Confetti
- **Deployment Ready**: Vercel

## 📂 Project Structure

```
bookshelf/
├── app/
│   ├── api/              # API routes
│   │   ├── books/        # Book CRUD operations
│   │   ├── reading-sessions/
│   │   ├── settings/
│   │   └── migrate/
│   ├── settings/         # Settings page
│   ├── sign-in/          # Clerk sign-in
│   ├── sign-up/          # Clerk sign-up
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── book-list.tsx
│   ├── dashboard-stats.tsx
│   ├── reading-heatmap.tsx
│   ├── migration-dialog.tsx
│   └── ...
├── lib/
│   ├── models/           # Mongoose schemas
│   ├── mongodb.ts        # Database connection
│   └── validations.ts    # Zod schemas
├── types/
│   └── index.ts          # TypeScript types
└── middleware.ts         # Clerk authentication

```

## 🚢 Deployment to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Deploy!

Vercel will automatically detect Next.js and configure the build.

## 🔒 Security Features

- All API routes protected with Clerk authentication
- User data isolation (users can only access their own data)
- Input validation with Zod schemas
- MongoDB injection protection via Mongoose
- Environment variables for sensitive data
- HTTPS enforced in production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Authentication by [Clerk](https://clerk.com/)
- Database by [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

Happy Reading! 📚✨
