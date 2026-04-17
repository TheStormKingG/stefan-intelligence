# Cowork Daily Consolidated Ops — Task Suggestion Output

**EIS — Executive Intelligence System | Dr. Stefan Gravesande | April 2026**

---

## 1. Context & Purpose

The EIS app now has a **Daily Work Tab** that lets Dr. Gravesande select two focus tasks each morning from a prioritised suggestion list, then execute them in timed focus blocks with evidence capture.

This modification adds a **new final step** to the existing daily consolidated ops Cowork task: after producing the intelligence report (unchanged), Cowork must generate a structured JSON payload of task suggestions and write them to the Supabase table `eis_task_suggestions`.

The existing intelligence report output is **not modified**. The task suggestion payload is a separate output stream appended as the final step in the same Cowork run.

---

## 2. Analysis Inputs

Analyse the following data sources (same inputs as the existing consolidated ops analysis) to derive task suggestions:

| Source | What to Extract for Task Prioritisation |
|---|---|
| Gmail / UPES Outlook | Emails requiring action, pending responses, deadlines surfaced in correspondence |
| Google Calendar | Today's scheduled commitments; any prep tasks implied by upcoming meetings/events |
| Google Drive | Documents in draft / overdue / flagged status; project artefacts needing updates |
| EIS Session Memory | Carry-forward tasks from previous days' intelligence reports; deferred items |
| CYCLE / GYBN / Preqal | Project-specific outstanding actions known from prior sessions and Drive content |
| Academic (UoPeople, LJMU) | Assignment deadlines, overdue submissions, required admin actions |

---

## 3. Scoring Methodology

Each candidate task is scored on two independent axes:

### priority_impact — High / Moderate / Low

- **High**: Deadline within 48 hours, OR blocks another system (e.g. UoPeople documents block enrollment)
- **Moderate**: Deadline within 7 days, OR supports an active project milestone
- **Low**: Useful but not time-critical

### difficulty — Hard / Medium / Easy

- **Hard**: Requires >45 min focused work, multiple dependencies, or significant cognitive load
- **Medium**: 20-45 min, mostly self-contained
- **Easy**: <20 min, clear steps, low cognitive load

### Rank Order

Sort by `priority_impact` first (High > Moderate > Low), then by `difficulty` (Easy > Medium > Hard within the same priority band — surface quick wins first at each priority level).

---

## 4. Output Requirements

### 4.1 JSON Schema

Produce a valid JSON object as the final output block of the daily consolidated ops run. **No prose, no preamble — raw JSON only in this block.**

```json
{
  "date": "YYYY-MM-DD",
  "generated_at": "ISO8601 timestamp",
  "task_suggestions": [
    {
      "rank": 1,
      "task_name": "Submit UoPeople Foundation Documents",
      "description": "Upload the required Foundation documents to Brightspace to unblock Degree Student status. Student ID C537987. Documents are overdue since Apr 1.",
      "priority_impact": "High",
      "difficulty": "Easy",
      "execution_tips": "Log into Brightspace at studentportal.uopeople.edu. Navigate to Foundation Documents submission. Upload each required file. Screenshot confirmation page as evidence."
    },
    {
      "rank": 2,
      "task_name": "...",
      "description": "...",
      "priority_impact": "High",
      "difficulty": "Medium",
      "execution_tips": "..."
    }
  ]
}
```

### 4.2 Volume

Generate a **minimum of 5** and **maximum of 10** task suggestions per run. If fewer than 5 actionable tasks can be identified from the data, generate placeholders using known ongoing commitments (CYCLE, GYBN, Preqal, academic) at Moderate/Low priority.

### 4.3 Field Specifications

| Field | Specification |
|---|---|
| `task_name` | Concise action-oriented name. Max 60 characters. **Must start with a verb** (Submit, Review, Draft, Complete, Update, Call, Send, Prepare). |
| `description` | 2-4 sentences. Include: what the task is, why it matters now, any key identifiers (deadlines, links, names) needed to execute. Max 300 characters. |
| `execution_tips` | 2-4 sentences. Specific, actionable guidance on HOW to execute: where to go, what to do first, what evidence to capture. **Do not repeat the description.** |
| `priority_impact` | Exactly one of: `High`, `Moderate`, `Low`. Use the scoring criteria in section 3. No other values. |
| `difficulty` | Exactly one of: `Hard`, `Medium`, `Easy`. Use the scoring criteria in section 3. No other values. |
| `rank` | Integer 1-N. 1 = highest priority shown first in dropdown. No duplicates. |

---

## 5. Supabase Write Instruction

After generating the JSON payload, write the `task_suggestions` array to Supabase using the following approach:

1. **DELETE** existing rows in `eis_task_suggestions` WHERE `date` = today's date (prevents duplicates on re-run)
2. **INSERT** all rows from the `task_suggestions` array
3. **Log** success/failure to the EIS ops log

### Target Table

**Table name:** `eis_task_suggestions`

**Column mapping (matches JSON schema exactly):**

| Column | Type | Constraint |
|---|---|---|
| `id` | UUID | Auto-generated (DEFAULT gen_random_uuid()) |
| `date` | DATE | NOT NULL — use today's date (YYYY-MM-DD) |
| `task_name` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL |
| `priority_impact` | TEXT | CHECK IN ('High', 'Moderate', 'Low') |
| `difficulty` | TEXT | CHECK IN ('Hard', 'Medium', 'Easy') |
| `execution_tips` | TEXT | Nullable |
| `rank` | INTEGER | 1 = highest priority |
| `created_at` | TIMESTAMPTZ | Auto-generated (DEFAULT now()) |

Use the existing Supabase service role key already configured in the Cowork environment.

### Supabase Connection Details

Use the same Supabase project URL and service role key that are already configured for the EIS intelligence report ingestion. The table `eis_task_suggestions` has been created and has RLS enabled with a permissive policy (allow all).

### Fallback on Write Failure

If the Supabase write fails, Cowork must:
1. Log the error
2. Output the raw JSON payload to the intelligence report as a fallback, so Dr. Gravesande can manually review the suggestions even without app integration

---

## 6. Integration with Existing Report

The task suggestion generation runs **AFTER** the existing intelligence report is produced, as a final step. The structure of the Cowork run is:

1. Run existing intelligence analysis (**unchanged**)
2. Generate and send/draft the intelligence report email (**unchanged**)
3. Run task suggestion analysis (**new** — sections 2-4 above)
4. Write task suggestions to Supabase `eis_task_suggestions` (**new**)
5. Log completion status

**Do NOT modify the intelligence report content or format.** The task suggestions are a separate output stream. The only shared input is the same data source analysis from step 1.

---

## 7. Verification Checklist

After the first run, verify:

- [ ] JSON payload is valid and contains 5-10 suggestions
- [ ] All `priority_impact` values are exactly `High`, `Moderate`, or `Low`
- [ ] All `difficulty` values are exactly `Hard`, `Medium`, or `Easy`
- [ ] All `task_name` values start with a verb and are ≤60 characters
- [ ] All `description` values are ≤300 characters
- [ ] `rank` values are sequential integers with no duplicates
- [ ] Rows appear in `eis_task_suggestions` table in Supabase with today's date
- [ ] Previous day's rows are cleaned up (DELETE before INSERT)
- [ ] The existing intelligence report is unchanged
- [ ] The EIS app's Daily Work tab shows the suggestions in the "Suggested Tasks" section

---

## 8. Scheduling

This task suggestion output should run as part of the **daily consolidated ops scheduled task** that already runs each morning. The suggestions must be written to Supabase **before 08:00 AST (UTC-4)** so they are available when the EIS app's morning intake auto-prompt triggers at 08:15.

If the consolidated ops task runs at its current scheduled time, no schedule change is needed — just append steps 3-5 from section 6 to the end of the existing run.

---

## 9. Resilience & Quality Checks

These checks must be executed on **every run** to ensure data integrity and continuity.

### 9.1 Supabase Backfill Pattern

In pre-flight (before generating today's suggestions), query `eis_task_suggestions` for **yesterday's date**. If 0 rows exist, backfill from the prior report's task list before proceeding with today's generation. This prevents gaps in the suggestion history when a run was missed or failed silently.

### 9.2 Description Character Limit Enforcement

Before each INSERT, validate that every `description` field is **≤300 characters**. If a description exceeds the limit, truncate it at the last whole word before 297 characters and append `"..."` rather than risking a silent INSERT failure from the CHECK constraint on the column.

### 9.3 ChatGPT as Optional Intelligence Source

When a ChatGPT tab is open in Chrome, use `mcp__Control_Chrome__execute_javascript` with the selector `document.querySelectorAll('[data-message-author-role]')` to extract conversation content. Treat this as an **additional** input source alongside Gmail, Calendar, Drive, and session memory. If the tab is not available, skip silently — this source is opportunistic, not required.

### 9.4 Gmail Tool Name Consistency

Use **full MCP tool names** throughout all Gmail interactions (e.g. `mcp__d5dad8a0-4d6c-4f8a-b131-c8e6e16e5075__gmail_read_thread`). Audit all references for shorthand names like `gmail_search_messages` and replace with the full MCP-prefixed form. Mismatched tool names cause silent failures in the Cowork runtime.

### 9.5 Score History Verification

On each run, confirm the **previous run's score** from the Self-Improvement Review thread. If the inferred score recorded in session history does not match the actual score in the review, correct the history record before proceeding. Accurate score history is required for trend analysis and coaching insight generation.
