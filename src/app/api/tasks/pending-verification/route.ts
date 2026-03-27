import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== process.env.INGEST_API_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase = createServerClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("completed", true)
    .eq("verification_status", "pending_verification")
    .order("completed_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }

  return NextResponse.json({ tasks: tasks ?? [] });
}
