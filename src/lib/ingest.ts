import { createServerClient } from "@/lib/supabase";

const PRIORITY_IMPACTS = new Set(["High", "Moderate", "Low"]);
const DIFFICULTIES = new Set(["Hard", "Medium", "Easy"]);

function truncateSuggestionDescription(text: string, max = 300): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, 297);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 200 ? slice.slice(0, lastSpace) : slice;
  return `${base}...`;
}

/**
 * Shared ingestion engine used by both /api/reports and /api/ingest.
 * Accepts ANY reasonable field-name combination so Cowork never 400s
 * due to schema mismatch.
 */
export interface IngestResult {
  success: true;
  run: number;
  report_id: string;
  report_date: string;
}

export interface IngestError {
  success: false;
  error: string;
  report_date?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processIngestion(payload: any): Promise<IngestResult | IngestError> {
  const reportDate: string | undefined =
    payload.date ?? payload.report_date ?? payload.reportDate ?? undefined;

  if (!reportDate) {
    return {
      success: false,
      error:
        "Missing date. Send 'date' or 'report_date' as YYYY-MM-DD string.",
    };
  }

  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  const risks = Array.isArray(payload.risks) ? payload.risks : [];
  const objectives = Array.isArray(payload.objectives) ? payload.objectives : [];
  const metrics = Array.isArray(payload.metrics) ? payload.metrics : [];
  const financialEntries = Array.isArray(payload.financial_entries)
    ? payload.financial_entries
    : [];
  const balanceSnapshots = Array.isArray(payload.balance_snapshots)
    ? payload.balance_snapshots
    : [];
  const hasTaskSuggestionsKey = Object.prototype.hasOwnProperty.call(payload, "task_suggestions");
  const taskSuggestionsInput = hasTaskSuggestionsKey
    ? Array.isArray(payload.task_suggestions)
      ? payload.task_suggestions
      : []
    : null;

  const supabase = createServerClient();

  try {
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("report_date", reportDate)
      .single();

    let reportId: string;

    const reportRow: Record<string, unknown> = {
      raw_content: payload.raw_content ?? payload.whatsapp_insights ?? null,
      summary: payload.summary ?? null,
      generated_at: payload.generated_at ?? null,
      coaching_insight: payload.coaching_insight ?? null,
      performance_score: payload.performance_score ?? null,
      whatsapp_insights: payload.whatsapp_insights ?? null,
      run_number: payload.run ?? null,
      ingested_at: new Date().toISOString(),
    };
    if (Object.prototype.hasOwnProperty.call(payload, "calendar_events")) {
      reportRow.calendar_events = payload.calendar_events ?? null;
    }

    if (existingReport) {
      reportId = existingReport.id;

      const { error: updateError } = await supabase
        .from("reports")
        .update(reportRow)
        .eq("id", reportId);

      if (updateError) throw updateError;

      const deletes = [
        supabase.from("risks").delete().eq("report_id", reportId),
        supabase.from("tasks").delete().eq("report_id", reportId),
        supabase.from("objectives").delete().eq("report_id", reportId),
        supabase.from("metrics").delete().eq("report_id", reportId),
      ];
      if (financialEntries.length > 0) {
        deletes.push(
          supabase.from("financial_entries").delete().eq("report_id", reportId)
        );
      }
      await Promise.all(deletes);
    } else {
      const { data: newReport, error: insertError } = await supabase
        .from("reports")
        .insert({ report_date: reportDate, ...reportRow })
        .select("id")
        .single();

      if (insertError || !newReport) throw insertError;
      reportId = newReport.id;
    }

    if (risks.length > 0) {
      const { error } = await supabase.from("risks").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        risks.map((r: any) => ({
          report_id: reportId,
          title: r.title,
          description: r.description ?? null,
          severity: r.severity ?? "medium",
          category: r.category ?? null,
          mitigation: r.mitigation ?? null,
        }))
      );
      if (error) throw error;
    }

    if (tasks.length > 0) {
      const { error } = await supabase.from("tasks").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks.map((t: any) => ({
          report_id: reportId,
          title: t.title,
          description: t.description ?? null,
          priority: t.priority ?? "medium",
          category: t.category ?? null,
          due_date: t.due_date ?? null,
          completed: t.completed ?? false,
          completed_at: t.completed_at ?? null,
          verification_status: t.verification_status ?? null,
        }))
      );
      if (error) throw error;
    }

    if (objectives.length > 0) {
      const { error } = await supabase.from("objectives").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        objectives.map((o: any) => ({
          report_id: reportId,
          title: o.title,
          description: o.description ?? null,
          type: o.type ?? "operational",
          status: o.status ?? "on_track",
          due_date: o.due_date ?? null,
          notes: o.notes ?? null,
        }))
      );
      if (error) throw error;
    }

    if (metrics.length > 0) {
      const { error } = await supabase.from("metrics").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metrics.map((m: any) => ({
          report_id: reportId,
          label: m.label,
          value: m.value,
          unit: m.unit ?? null,
          change_direction: m.change_direction ?? null,
        }))
      );
      if (error) throw error;
    }

    if (financialEntries.length > 0) {
      const { error } = await supabase.from("financial_entries").insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        financialEntries.map((f: any) => ({ ...f, report_id: reportId }))
      );
      if (error) throw error;
    }

    if (balanceSnapshots.length > 0) {
      const { error } = await supabase
        .from("balance_snapshots")
        .insert(balanceSnapshots);
      if (error) throw error;
    }

    if (taskSuggestionsInput !== null) {
      const { error: delSug } = await supabase
        .from("eis_task_suggestions")
        .delete()
        .eq("date", reportDate);
      if (delSug) throw delSug;

      if (taskSuggestionsInput.length > 0) {
        const rows = taskSuggestionsInput.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any, index: number) => {
            const pi = String(s.priority_impact ?? "Moderate");
            const diff = String(s.difficulty ?? "Medium");
            return {
              date: reportDate,
              task_name: String(s.task_name ?? s.title ?? "Untitled task").slice(0, 200),
              description: truncateSuggestionDescription(
                String(s.description ?? "")
              ),
              priority_impact: PRIORITY_IMPACTS.has(pi) ? pi : "Moderate",
              difficulty: DIFFICULTIES.has(diff) ? diff : "Medium",
              execution_tips: s.execution_tips != null ? String(s.execution_tips) : null,
              rank: typeof s.rank === "number" ? s.rank : index + 1,
            };
          }
        );
        const { error: insSug } = await supabase.from("eis_task_suggestions").insert(rows);
        if (insSug) throw insSug;
      }
    }

    const { count } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true });

    const run = payload.run ?? (count ?? 1);

    return { success: true, run, report_id: reportId, report_date: reportDate };
  } catch (error) {
    console.error("Ingestion error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      report_date: reportDate,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      report_date: reportDate,
    };
  }
}
