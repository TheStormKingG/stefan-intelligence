import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  let body: { completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "completed (boolean) is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed: body.completed,
      completed_at: body.completed ? new Date().toISOString() : null,
      verification_status: body.completed ? "pending_verification" : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, task: data });
}
