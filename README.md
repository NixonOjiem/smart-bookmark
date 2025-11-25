# Smart Bookmark

## PProject Structure

- `client/` → Next.js application
- `server/` → Nest.js application

## Get Started

# For the frontend (Next.js)

Go to terminal
cd client
npm install
npm run dev

# For the backend (Nest.js)

Go to terminal
cd server
npm install
npm run start:dev

# Using Postgresql

For the following reasons

1. The data is relational, users have bookmarks
2. Enforce Data Integrity, No ophaned bookmarks
3. Native Full Text search

## Connecting to Database

when in development: Use localhost, later when packaging for docker Use postgres

# Using TypeORM on Nestjs

1. Fast development
2. No sql Injections
