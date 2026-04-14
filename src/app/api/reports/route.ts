import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { processIngestion } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function checkAuth(request: NextRequest): boolean {
  const expected = process.env.INGEST_API_TOKEN?.trim();
  if (!expected) return true; // no token configured — allow (dev mode)
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();
  return token === expected;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS }
    );
  }

  const result = await processIngestion(body);

  if (!result.success) {
    return NextResponse.json(result, { status: 400, headers: CORS });
  }

  return NextResponse.json(result, { status: 200, headers: CORS });
}

export async function GET() {
  const supabase = createServerClient();

  const { data: latestReport, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  if (reportError || !latestReport) {
    return NextResponse.json(
      { report: null, tasks: [], risks: [], objectives: [], metrics: [] },
      { headers: CORS }
    );
  }

  const [tasksRes, risksRes, objectivesRes, metricsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("risks")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("objectives")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("metrics")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json(
    {
      report: latestReport,
      tasks: tasksRes.data ?? [],
      risks: risksRes.data ?? [],
      objectives: objectivesRes.data ?? [],
      metrics: metricsRes.data ?? [],
    },
    { headers: CORS }
  );
}
