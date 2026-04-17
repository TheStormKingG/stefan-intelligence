# Updated Cowork Patch — Post-Session April 15, 2026

**Applies to:** daily-consolidated-ops (Run #24+)
**Previous:** Run #23 (Score: 8.9/10, Apr 15)
**Issued by:** Cursor session — EIS app maintenance + Run #23 self-improvement review

---

## Run #23 Cowork Patch Items — ALL CLOSED ✅

| # | Item | Resolution |
|---|---|---|
| 1 | Supabase: replace browser JS with MCP connector | ✅ Rewritten in Steps 5C/5D/5E |
| 2 | Calendar: replace deprecated `gcal_list_events` with new tool name | ✅ Phase 2 updated with Chrome JS fallback |
| 3 | Facebook own profile: add fallback JS selector | ✅ Phase 1C updated |
| 4 | Preqal.org: use Chrome Control, not WebFetch (proxy blocked) | ✅ Execution Rules note added |
| 5 | GYBN Announcements 2: reclassify from "empty" to admin-only | ✅ New query 6 added |
| 6 | ZISFROMME: enforce verification before attributing messages | ✅ Accuracy Rules section added |
| 7 | Read `EIS_DailyTaskMod_Prompts.docx` in pre-flight | ✅ Pre-flight step 1 added |
| 8 | Healthy Farmer's Initiative: change "approved" to "proposed/discussed" | ✅ Accuracy Rules section |

No Run #23 Cowork Patch items remain open.

---

## Run #23 Cursor Patch Items — ALL CLOSED ✅

| # | Item | Resolution |
|---|---|---|
| 1 | Vercel production deployment failure (Apr 14) | ✅ FIXED — ESLint unused-variable errors resolved in commit `2f41182`. Build passes and deployed. |
| 2 | Dashboard staleness detection — no report date or run number visible | ✅ FIXED — Header component now displays `Report: Apr 14 | Run #23` alongside "Last sync" time. New `reportDate` and `runNumber` props added. |
| 3 | `run_number` not stored in database | ✅ FIXED — `run_number INTEGER` column added to `reports` table. Migration: `scripts/migrate-run-number.sql`. Ingest maps `payload.run` → `run_number`. |
| 4 | EIS API ingest uses browser fetch() | ✅ NO CHANGE NEEDED — server-side Vercel API route, not a client secret exposure issue. `POST` returns `{"success":true}` as expected. |

No Run #23 Cursor Patch items remain open.

---

## New Items for Run #24+ — Embedded in `COWORK_TASK_SUGGESTIONS_PROMPT.md` Section 9

The following 5 items were identified during the April 15 session and have been **permanently embedded** in `COWORK_TASK_SUGGESTIONS_PROMPT.md` Section 9 (Resilience & Quality Checks). They execute on **every run** automatically — no manual patch carry-forward needed.

| # | Item | Prompt Location |
|---|---|---|
| 1 | **Supabase backfill pattern** — Check `eis_task_suggestions` for yesterday's date; if 0 rows, backfill from prior report's task list before proceeding | Section 9.1 |
| 2 | **Description character limit enforcement** — Validate `description` ≤300 chars; truncate at last whole word + `"..."` before INSERT | Section 9.2 |
| 3 | **ChatGPT as optional intelligence source** — Use `mcp__Control_Chrome__execute_javascript` with `document.querySelectorAll('[data-message-author-role]')` when ChatGPT tab is open | Section 9.3 |
| 4 | **Gmail tool name consistency** — Use full MCP-prefixed names (e.g. `mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__gmail_read_thread`); audit and replace shorthand references | Section 9.4 |
| 5 | **Score history verification** — Confirm previous run's score from Self-Improvement Review thread; correct history record if inferred score was wrong | Section 9.5 |

---

## Ongoing Methodology Items (Carry Forward)

These items from the Run #23 review are implemented in the main Cowork prompt but should be **verified on each run**:

### Intelligence Source Fallbacks

- **Google Calendar**: When `gcal_list_events` fails (stale tool definitions), use Chrome JS injection on `calendar.google.com` tab as primary source. This is sufficient but less precise than API access.
- **Facebook own profile**: Use `https://www.facebook.com/stefan.gravesande.7` with JS selector `document.querySelectorAll('[data-ad-preview="message"]')` to extract post content. If "content unavailable", read home feed + shortcuts instead.
- **Preqal.org**: Load via `mcp__Control_Chrome__open_url` + `get_page_content` (WebFetch is blocked by network egress proxy).

### Content Quality

- **Positive world events section**: Use WebSearch every run. Stefan's interests: biodiversity, Caribbean, youth leadership, sustainability, renewable energy, governance. This section was confirmed in scope as of Run #23.
- **WhatsApp ZISFROMME flag**: All attributions must be verified before inclusion. Do not attribute messages to Stefan without explicit ZISFROMME confirmation.

### Pre-flight

- **Read `EIS_DailyTaskMod_Prompts.docx`**: Check Stefan's Downloads/Projects folder for this file at the start of each run. Apply any new instructions before executing the intelligence analysis.

### Scheduling Note

- Stefan self-noted "change cowork to once a week" on Apr 15. If the cadence changes to weekly (recommended: every Monday at 08:00 GYT), the `eis_task_suggestions` backfill logic in Section 9.1 becomes critical — it must fill gaps for any days without a run.

---

## EIS App Code Changes Made This Session

For Cowork's awareness when verifying dashboard freshness via `get_page_content`:

| File | Change |
|---|---|
| `scripts/migrate-run-number.sql` | NEW — `ALTER TABLE reports ADD COLUMN IF NOT EXISTS run_number INTEGER` |
| `scripts/schema.sql` | `run_number INTEGER` added to reports CREATE TABLE |
| `src/lib/types.ts` | `run_number: number \| null` added to `Report` interface |
| `src/lib/ingest.ts` | `payload.run` mapped to `run_number` in report upsert |
| `src/components/layout/Header.tsx` | New props `reportDate`, `runNumber`; displays `Report: Apr 14 \| Run #23` inline with sync time |
| `src/app/dashboard/page.tsx` | Passes `latestReport.report_date` and `latestReport.run_number` to Header |
| `COWORK_TASK_SUGGESTIONS_PROMPT.md` | Section 9 added (5 resilience & quality checks) |

### Freshness Verification for Cowork

After each EIS API POST, Cowork can verify the dashboard displays fresh data by checking the Header for:

```
Report: [Month Day] | Run #[N]
```

This replaces the previous method of deep DOM inspection. A single `get_page_content` call on the dashboard URL should surface this string in the header area.

---

## Summary

- **Run #23 Cowork Patch**: 8/8 items CLOSED ✅
- **Run #23 Cursor Patch**: 4/4 items CLOSED ✅
- **New persistent checks**: 5 items embedded in `COWORK_TASK_SUGGESTIONS_PROMPT.md` Section 9
- **Dashboard freshness**: Now displays report date + run number — verifiable by Cowork in one call
- **Next action**: Run `scripts/migrate-run-number.sql` against Supabase to apply the `run_number` column, then Run #24 will store and display the run number automatically
