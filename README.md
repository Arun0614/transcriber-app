# VoiceScript — Audio Transcription App

A full-stack Next.js application for audio transcription using Gemini AI.

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Railway)
- **Auth**: Better Auth (username + password)
- **Transcription**: Google Gemini 1.5 Flash API
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
```

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

## Deployment on Railway

### Step 1: Create Railway Account
- Go to [railway.app](https://railway.app) and sign up for free
- You get $5 free credits (enough for testing)

### Step 2: Create PostgreSQL Database
1. New Project → Add a Service → Database → PostgreSQL
2. Copy the `DATABASE_URL` from the Variables tab

### Step 3: Deploy App
1. New Service → GitHub Repo (connect your repo)
2. Add environment variables:
   - `DATABASE_URL` = PostgreSQL connection string
   - `BETTER_AUTH_SECRET` = run `openssl rand -base64 32`
   - `BETTER_AUTH_URL` = your Railway app URL (e.g., `https://your-app.up.railway.app`)
   - `GEMINI_API_KEY` = your Gemini API key

### Step 4: Run Migrations on Railway
After deployment, open Railway's terminal or use a one-time job:
```bash
node -r dotenv/config scripts/migrate.mjs
node -r dotenv/config scripts/seed.mjs
```

Or add to your build command: `npm run build && npm run db:migrate && npm run db:seed`

## Core Flow

1. Admin logs in at `/login` with username + password
2. Admin uploads an audio file (MP3, WAV, OGG, etc., under 1 min / 10MB)
3. App sends audio to Gemini 1.5 Flash API for transcription
4. Only the transcript text is stored in PostgreSQL (not the audio file)
5. Admin can view all past transcripts on the dashboard
6. Admin can copy or delete any transcript
7. Logout button in the header

## API Routes

- `POST /api/upload` — Upload audio, transcribe with Gemini, save to DB
- `GET /api/transcripts` — Fetch all transcripts for logged-in user
- `DELETE /api/transcripts?id=<uuid>` — Delete a transcript
- `GET/POST /api/auth/[...all]` — Better Auth handler

## Getting a Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key to your `.env.local`

The free tier supports up to 1,500 requests/day which is more than enough.
