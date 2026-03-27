# Executive Intelligence System (EIS)

A personal executive operating system built as a Progressive Web App. Ingests daily intelligence reports from Cowork AI and presents them as a decision-first, mobile-native interface.

## Quick Start

### 1. Supabase Setup

Create a Supabase project and run the schema in the SQL Editor:

```bash
# Run these in order via Supabase SQL Editor
scripts/schema.sql    # Creates tables, indexes, RLS policies
scripts/seed.sql      # Inserts sample data for testing
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
INGEST_API_TOKEN=your-secret-token
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser (max-width 430px).

## Ingest API

Send structured intelligence data via POST:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "report_date": "2026-03-27",
    "summary": "Daily summary text",
    "raw_content": "Full report content",
    "generated_at": "2026-03-27T20:00:00Z",
    "risks": [
      { "title": "Risk title", "severity": "critical", "category": "Engineering", "description": "Details", "mitigation": "Action plan" }
    ],
    "tasks": [
      { "title": "Task title", "priority": "high", "category": "Revenue", "due_date": "2026-03-28" }
    ],
    "objectives": [
      { "title": "Objective title", "type": "revenue", "status": "on_track", "due_date": "2026-04-30", "description": "Details", "notes": "Progress notes" }
    ],
    "metrics": [
      { "label": "Unread Emails", "value": 23, "unit": "emails", "change_direction": "up" }
    ]
  }'
```

## Architecture

```
Cowork AI → Parser → POST /api/ingest → Supabase → EIS PWA → Executive
```

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (PostgreSQL)
- PWA via @ducanh2912/next-pwa
- lucide-react icons

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set the three environment variables in Vercel dashboard.
