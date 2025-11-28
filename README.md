# Smart Bookmark

A full-stack, intelligent web application created to effectively manage, arrange, and retrieve your web bookmarks. It has a relational tagging system, strong user authentication, and an AI-driven auto-tagging engine that automatically creates pertinent tags by analyzing website content.

# Features

1. User Authentication using JWT tokens
2. Bookmark Management: Create, Read, Update, and Delete (CRUD) bookmarks with titles, URLs, and descriptions.
3. AI Auto-Tagging: scrapes metadata and keywords from URLs
4. Search & Filtering
5. Responsive UI

# Tech Stack

Frontend

1. Framework: Next.js
2. Styling: Tailwind
3. State Management: React Context API

Backend

1. Framework: Nestjs
2. ORM: TypeORM
3. Database: PostgresQL 15
4. Security: Passport.js and JWT Strategy

# AI/NLP

1. Scrapping: Cheerio & Axios
2. Analysis: Keyword-extractor

# DevOps

1. Containerization: Docker and Docker Compose

# Project Structure

smart-bookmark/
├── client/ # Next.js Frontend Application
│ ├── src/
│ ├── public/
│ └── package.json
├── server/ # NestJS Backend Application
│ ├── src/
│ ├── test/
│ └── package.json
└── docker-compose.yml # Database & Admin Panel configuration

# Prerequisites

Ensure you have:

1. Nodejs installed
2. Docker Desktop installed

# Get Started

## Part one

1. Use docker to spin up pgAdmin and Database

run this in the root direcory: docker-compose up -d .

2. pgAdmin URL: http://localhost:5050 (Email: admin@admin.com / Pass: root)

## part two

1. create a .env file in the server directory with the following credentials

### server/.env.local

#DB
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=user
POSTGRES_PASSWORD=password123
POSTGRES_DB=bookmark_manager
JWT_SECRET=YOUR_JWT_SECRET

#SMTP Config
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_gmail
MAIL_PASS=Your_16_character_password_generated_from_gmail_apps
MAIL_FROM="SmartMarks Support <your_gmail>"

2. create a .env file in your client directory:

### client/.env.local

NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend Setup

cd server

npm install
npm run start:dev

The server will start on http://localhost:4000

# frontend setup

cd client
npm install
npm run dev

The client will start on http://localhost:3000.

# AI & Auto-Tagging

The ability of Smart Bookmark to automatically create tags in the absence of user input is one of its key features.

Trigger: A bookmark with an empty tags field is submitted by the user

Scraping Layer: Axios and Cheerio are used by the backend to retrieve the target URL's HTML. The <title> and <meta name="description"> are extracted.

NLP Analysis: The keyword-extractor receives the content

Common words (and, the, is, etc.) are eliminated using stop-word removal.

Tag Generation: The bookmark's top five statistically significant keywords are chosen and saved as tags.

# Architecture Decision

Why Postgresql

1. To keep relational integrity: Users have bookmarks and Bookmarks have tags
2. Cascading Deletes: If a user is deleted then their bookmarks are deleted
3. ACID Compliance: Ensures reliable transaction processing.

Why TypeORM

1. Security: Built-in protection against SQL Injection attacks.

2. Flexibility: Database agnostic, allowing for easier switching of DBs if necessary in the future.

# Testing

I used Jest for testing across the entire stack

# Backend tests:

cd server
npx jest

# Frontend tests:

cd client
npm test

# Production Roadmap

If this project were to move to a full-scale production environment, the following enhancements would be prioritized:

1. Advanced AI Microservice: Replace the current `keyword-extractor` library with a dedicated Python microservice (using FastAPI and models like BERT or OPENAI) to provide deep-learning-based classification and semantic understanding of bookmark content.
2. Enhanced Authentication: Implement OAuth2 and 2FA
3. Infrastructure & DevOps: Establish a CI/CD pipeline using GitHub
4. Performance Optimization: Use Redis to capture frequently accessed bookmarks
5. Browser extension support.

# Honesty Declaration

I confirm that this submission is my own work. I have:
[ ] Not copied code from existing solutions or other candidates
[ ] Used AI assistants only for syntax help and debugging specific errors
[ ] Not received human help during the assignment period
[ ] Built the core logic and architecture myself
[ ] Cited any references used for specific solutions
