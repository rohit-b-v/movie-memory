# Movie Memory

A full-stack Next.js application that allows users to save their favorite movie and discover AI-generated trivia.

## Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up a PostgreSQL database and add the connection string to your `.env` file.
4. Run `npx prisma db push` to initialize the database schema.
5. Run `npx prisma generate` to generate the typed client.
6. Run `npm run dev` to start the development server.

## Required Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
OPENAI_API_KEY="your_openai_key"
GEMINI_API_KEY="your_gemini_key"
```

## Architecture Overview
This application is built on the Next.js App Router framework, leveraging both Client and Server Components to optimize performance and SEO.

### The Backend
The server layer consists of Next.js API Routes that act as a bridge between the frontend and the PostgreSQL database. I chose Prisma as the ORM because of its excellent TypeScript integration and type safety. Authentication is handled by NextAuth.js using the Google OAuth provider. The session is managed via JWTs, ensuring that only authenticated users can access the /api/me and /api/fact endpoints.

### AI Implementation & Resilience
A key feature of the architecture is the AI Fallback System. The backend is designed for high availability by attempting to fetch movie trivia from OpenAI (GPT-4o-mini) first. If the request fails due to rate limits or account quotas, the system catches the error and executes a fallback request to Google Gemini 2.5 Flash. This graceful degradation ensures the user experience is never interrupted by third party API downtime.

### The Frontend
The UI is styled with Tailwind CSS for a clean and responsive dashboard. For data fetching and state management, I implemented SWR (Stale-While-Revalidate). This allows for:

Automatic Revalidation: Data stays fresh without manual refreshes.

Request Deduping: Multiple components can request the same data without triggering redundant network calls.

Optimistic UI Updates: The UI responds instantly to user input while the database updates in the background.

## Variant Chosen: Variant B (Frontend/API-Focused)
I chose Variant B because client orchestration and defining strong API contracts are critical for building scalable user interfaces. I implemented a strongly-typed API wrapper (`lib/api.ts`) to normalize error handling across the app. 

For the inline edit flow, I utilized SWR to provide an optimistic UI update. When a user saves a new movie, the UI updates instantly while the network request processes in the background. If the request fails, SWR automatically rolls back the UI to the previous state. I also configured SWR to cache the AI-generated facts with a 30-second deduping interval to prevent unnecessary API calls.

## Tradeoffs
* **Prisma `db push` vs Migrations:** Used `db push` for rapid prototyping in this exercise. In a production setting I would use standard Prisma migrations to safely evolve the database schema.
* **API Fallback Latency:** While the OpenAI to Gemini fallback ensures reliability, it does introduce additional latency for the user when the primary API fails. In a larger application I might implement circuit breakers to fail faster if the primary API is known to be down.

## Future Improvements
* Implement a global toast notification system to display API errors more elegantly than inline text.
* Add end-to-end tests using Playwright to test the full authentication flow.
* Extract the Dashboard UI into smaller and more reusable components.

## Walkthrough Video
[Walkthrough](https://www.loom.com/share/64b6ab75ecd34216b88445b5ff776fc7)

## AI Usage
* Used AI to generate boilerplate Next.js and Prisma configuration.
* Used AI to troubleshoot a breaking change in Prisma 7 regarding database adapter configuration.
* Used AI to help structure Jest tests for React components containing SWR hooks.