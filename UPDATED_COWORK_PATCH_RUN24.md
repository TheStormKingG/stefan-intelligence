# Updated Cowork Patch — Run #24 (EIS App + Ingest)

**April 17, 2026 | stefan-intelligence (Vercel)**

This document describes **code and API changes** you must align with on your next daily-consolidated-ops run. It supersedes ad-hoc instructions for the items below.

---

## 1. Task suggestions MUST go through `/api/ingest` (preferred)

**Problem fixed:** The EIS app read `eis_task_suggestions` by date, but **`POST /api/ingest` ignored `task_suggestions`** — so if you only sent the intelligence report through the API and wrote suggestions elsewhere, or expected the API to persist them, the Daily Work tab stayed empty.

**New behavior:** Include a top-level **`task_suggestions`** array on the **same JSON body** as the report. The server will:

1. After upserting the `reports` row for `date` / `report_date`, **DELETE** all rows in `eis_task_suggestions` with `date` equal to that report date.
2. **INSERT** the new rows.

**If you omit the `task_suggestions` key entirely**, existing suggestion rows for any date are **not** touched (you can still write via direct Supabase if needed).

**If you send `"task_suggestions": []`**, suggestions for that report date are **cleared**.

**Payload shape (per item):**

| Field | Required | Notes |
|--------|----------|--------|
| `task_name` | Yes | Mapped from `title` if `task_name` missing. |
| `description` | Yes | Long text is truncated to 300 characters server-side (word-safe + `...`) so CHECK constraints do not fail. |
| `priority_impact` | No | `High` / `Moderate` / `Low`; invalid values default to `Moderate`. |
| `difficulty` | No | `Hard` / `Medium` / `Easy`; invalid values default to `Medium`. |
| `execution_tips` | No | Optional string. |
| `rank` | No | Defaults to array index + 1. |

**Example fragment:**

```json
{
  "date": "2026-04-17",
  "run": 24,
  "summary": "...",
  "tasks": [],
  "risks": [],
  "objectives": [],
  "metrics": [],
  "task_suggestions": [
    {
      "rank": 1,
      "task_name": "Submit UoPeople documents",
      "description": "Short description under 300 chars.",
      "priority_impact": "High",
      "difficulty": "Easy",
      "execution_tips": "Brightspace → upload → screenshot."
    }
  ]
}
```

Use the same `Authorization: Bearer <INGEST_API_TOKEN>` as today.

---

## 2. Calendar fallback — optional `calendar_events` on ingest

When **Google Calendar MCP** fails (stale tool definitions, etc.), attach structured events to the report:

**Field:** `calendar_events` (optional)

- **Type:** JSON array of objects on the ingest payload.
- **Stored on:** `reports.calendar_events` (JSONB) for the ingested report date.
- **Dashboard:** Renders a **“Today’s schedule”** card when the array is non-empty.

**Suggested object shape:**

```json
"calendar_events": [
  {
    "title": "Meeting with …",
    "start": "2026-04-17T09:00:00-04:00",
    "end": "2026-04-17T10:00:00-04:00",
    "location": "Zoom",
    "all_day": false
  }
]
```

Only **`title`** is required for display; other fields are optional.

**Omit the key** if you are not sending calendar data — the column is not cleared on omit (same pattern as other optional report fields).

---

## 3. Risks on the dashboard = **latest report only**

**Problem fixed:** The dashboard showed risks from a **30-day** window, so “Attention Required” mixed old and new scans.

**New behavior:** Only risks whose **`report_id`** matches the **latest** `reports` row (by `report_date`) are shown.

**Your action:** Each run must send the **current** set of active risks you want surfaced in the app for that report. Do not rely on old risk rows lingering in the UI from previous days.

---

## 4. Dashboard verification (freshness + momentum)

After a successful ingest:

1. **Header** still shows **Last sync**, **Report: [date]**, **Run #[N]** (from `run` → `reports.run_number`).
2. **Score momentum** — an SVG **sparkline** appears when there are **at least two** historical `performance_score` values; it uses the last **14** scored reports (chronological).
3. **Today’s schedule** — appears when `calendar_events` is non-empty on the latest report.

You can sanity-check deployment with **`get_page_content`** on `/dashboard` and look for “Score momentum” and “Today’s schedule” when applicable.

---

## 5. Database migration (Supabase SQL)

Run once on the EIS Supabase project (if not already applied):

```sql
-- From scripts/migrate-v24-patches.sql
ALTER TABLE reports ADD COLUMN IF NOT EXISTS calendar_events JSONB;
```

The `run_number` column from the earlier patch must also exist for Run display:

```sql
ALTER TABLE reports ADD COLUMN IF NOT EXISTS run_number INTEGER;
```

---

## 6. Daily Work tab — local date for “today”

The client uses the **browser’s local calendar date** (not UTC-only) when querying `eis_task_suggestions` for “today”. Align the **`date`** field on suggestion rows with the **same calendar day** as the user in Guyana (GYT) when you choose the report date for that run.

---

## 7. Reference docs (unchanged role)

- **`COWORK_TASK_SUGGESTIONS_PROMPT.md`** — Still the canonical spec for scoring, volume, and Section 9 resilience checks. Combine it with **`task_suggestions` in `/api/ingest`** so the app and Supabase stay in sync.
- **`UPDATED_COWORK_PATCH.md`** — Historical closure notes from Run #23; this Run #24 file is the operational addendum for ingest + dashboard behavior.
