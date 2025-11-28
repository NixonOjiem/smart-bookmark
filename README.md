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

1. Containerization: Docker and Docker Compose for the database

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

1. POSTGRES_HOST=localhost
2. POSTGRES_PORT=5434
3. POSTGRES_USER=user
4. POSTGRES_PASSWORD=password123
5. POSTGRES_DB=bookmark_manager
6. JWT_SECRET=YOUR_JWT_SECRET

#SMTP Config

1. MAIL_HOST=smtp.gmail.com
2. MAIL_USER=your_gmail
3. MAIL_PASS=Your_16_character_password_generated_from_gmail_apps
4. MAIL_FROM="SmartMarks Support <your_gmail>"

create a .env file in your client directory:

### client/.env.local

NEXT_PUBLIC_API_URL=http://localhost:4000/v1

# Backend Setup

1. cd server
2. npm install
3. npm run start:dev

The server will start on http://localhost:4000

# frontend setup

1. cd client
2. npm install
3. npm run dev

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

1. cd server

2. npx jest

# Frontend tests:

1. cd client

2. npm test

# Production Roadmap

If this project were to move to a full-scale production environment, the following enhancements would be prioritized:

1. Advanced AI Microservice: Replace the current `keyword-extractor` library with a dedicated Python microservice (using FastAPI and models like BERT or OPENAI) to provide deep-learning-based classification and semantic understanding of bookmark content.
2. Enhanced Authentication: Implement OAuth2 and 2FA
3. Rate limiting on API end points
4. Infrastructure & DevOps: Establish a CI/CD pipeline using GitHub
5. Performance Optimization: Use Redis to capture frequently accessed bookmarks
6. Browser extension support.

# Resources

1. https://support.google.com/accounts/answer/185833
2. https://nodemailer.com/usage/using-gmail/
3. https://docs.nestjs.com/security/authentication
4. [NestJS Documentation](https://docs.nestjs.com/)
5. [Class Validator](https://github.com/typestack/class-validator)

# Honesty Declaration

I confirm that this submission is my own work. I have:

1. [ ] Not copied code from existing solutions or other candidates
2. [ ] Used AI assistants only for syntax help and debugging specific errors
3. [ ] Not received human help during the assignment period
4. [ ] Built the core logic and architecture myself
5. [ ] Cited any references used for specific solutions
