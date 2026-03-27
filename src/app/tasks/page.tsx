import { createServerClient } from "@/lib/supabase";
import { Task } from "@/lib/types";
import { TasksPageClient } from "./TasksPageClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getAllTasks(): Promise<Task[]> {
  const supabase = createServerClient();

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  if (!report) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("report_id", report.id)
    .order("created_at");

  return tasks ?? [];
}

export default async function TasksPage() {
  const tasks = await getAllTasks();

  return <TasksPageClient tasks={tasks} />;
}
