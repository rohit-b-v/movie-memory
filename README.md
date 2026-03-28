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
This application uses the Next.js App Router for both frontend React components and backend API routes. Prisma serves as the ORM to interact with a PostgreSQL database. Authentication is handled securely via NextAuth.js with Google OAuth. State management and data fetching on the client are handled by SWR to provide a fast and reactive user experience. 

For the AI trivia generation, the backend implements a graceful degradation strategy. The API first attempts to fetch a fact using the OpenAI API. If the request fails due to rate limits or network issues, it catches the error and automatically falls back to the Google Gemini API. This ensures high availability and a seamless user experience even when third-party services experience downtime.

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