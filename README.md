# VoiceScript — Audio Transcription App

A full-stack Next.js application for audio transcription using Gemini AI.

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Railway)
- **Auth**: Better Auth (username + password)
- **Transcription**: Google Gemini API
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Deployment**: Railway

## Admin Credentials

- **Username**: `admin`
- **Password**: `Admin@2024!`

## Local Development

### 1. Clone & Install

```bash
git clone <repo-url>
cd transcriber-app
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Required variables:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
GEMINI_API_KEY=<from https://aistudio.google.com/app/apikey>
GEMINI_MODEL=gemini-2.5-flash
```

On Railway, add all four variables to the app service before deploying. Without them the app will fail during startup.

### 3. Database Setup

```bash
# Create tables
npm run db:migrate

# Create admin user
npm run db:seed
```

If login was already failing before, run both commands again so the auth tables and admin account are corrected.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)


