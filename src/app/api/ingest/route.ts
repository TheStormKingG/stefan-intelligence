import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { IngestPayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  const expected = process.env.INGEST_API_TOKEN?.trim();

  if (!token || !expected || token !== expected) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let payload: IngestPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload.report_date) {
    return NextResponse.json(
      { error: "report_date is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.risks) || !Array.isArray(payload.tasks) ||
      !Array.isArray(payload.objectives) || !Array.isArray(payload.metrics)) {
    return NextResponse.json(
      { error: "risks, tasks, objectives, and metrics must be arrays" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("report_date", payload.report_date)
      .single();

    let reportId: string;

    if (existingReport) {
      reportId = existingReport.id;

      const { error: updateError } = await supabase
        .from("reports")
        .update({
          raw_content: payload.raw_content ?? null,
          summary: payload.summary ?? null,
          generated_at: payload.generated_at ?? null,
          ingested_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (updateError) throw updateError;

      const deletes = [
        supabase.from("risks").delete().eq("report_id", reportId),
        supabase.from("tasks").delete().eq("report_id", reportId),
        supabase.from("objectives").delete().eq("report_id", reportId),
        supabase.from("metrics").delete().eq("report_id", reportId),
      ];
      if (Array.isArray(payload.financial_entries)) {
        deletes.push(supabase.from("financial_entries").delete().eq("report_id", reportId));
      }
      await Promise.all(deletes);
    } else {
      const { data: newReport, error: insertError } = await supabase
        .from("reports")
        .insert({
          report_date: payload.report_date,
          raw_content: payload.raw_content ?? null,
          summary: payload.summary ?? null,
          generated_at: payload.generated_at ?? null,
          ingested_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError || !newReport) throw insertError;
      reportId = newReport.id;
    }

    if (payload.risks.length > 0) {
      const { error } = await supabase.from("risks").insert(
        payload.risks.map((r) => ({ ...r, report_id: reportId }))
      );
      if (error) throw error;
    }

    if (payload.tasks.length > 0) {
      const { error } = await supabase.from("tasks").insert(
        payload.tasks.map((t) => ({
          ...t,
          report_id: reportId,
          completed: t.completed ?? false,
          completed_at: t.completed_at ?? null,
          verification_status: t.verification_status ?? null,
        }))
      );
      if (error) throw error;
    }

    if (payload.objectives.length > 0) {
      const { error } = await supabase.from("objectives").insert(
        payload.objectives.map((o) => ({ ...o, report_id: reportId }))
      );
      if (error) throw error;
    }

    if (payload.metrics.length > 0) {
      const { error } = await supabase.from("metrics").insert(
        payload.metrics.map((m) => ({ ...m, report_id: reportId }))
      );
      if (error) throw error;
    }

    if (Array.isArray(payload.financial_entries) && payload.financial_entries.length > 0) {
      const { error } = await supabase.from("financial_entries").insert(
        payload.financial_entries.map((f) => ({ ...f, report_id: reportId }))
      );
      if (error) throw error;
    }

    if (Array.isArray(payload.balance_snapshots) && payload.balance_snapshots.length > 0) {
      const { error } = await supabase.from("balance_snapshots").insert(
        payload.balance_snapshots
      );
      if (error) throw error;
    }

    return NextResponse.json(
      { success: true, report_id: reportId },
      { status: 200 }
    );
  } catch (error) {
    const payloadSummary = {
      report_date: payload.report_date,
      risks: payload.risks?.length ?? 0,
      tasks: payload.tasks?.length ?? 0,
      objectives: payload.objectives?.length ?? 0,
      metrics: payload.metrics?.length ?? 0,
      financial_entries: payload.financial_entries?.length ?? 0,
      balance_snapshots: payload.balance_snapshots?.length ?? 0,
    };
    console.error("Ingest error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      report_date: payload.report_date,
      payload_summary: payloadSummary,
      timestamp: new Date().toISOString(),
    });
    const description = error instanceof Error ? error.message : "Unknown database error during ingestion";
    return NextResponse.json(
      { success: false, error: description, report_date: payload.report_date },
      { status: 500 }
    );
  }
}
