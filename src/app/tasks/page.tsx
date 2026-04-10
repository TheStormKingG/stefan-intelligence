import { createServerClient } from "@/lib/supabase";
import { Task } from "@/lib/types";
import { TasksPageClient } from "./TasksPageClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function dedupeByTitle(rows: Task[]): Task[] {
  const map = new Map<string, Task>();
  // Prefer completed tasks over newer incomplete ones with the same title.
  const sorted = [...rows].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  for (const row of sorted) {
    if (!map.has(row.title)) {
      map.set(row.title, row);
    }
  }
  return Array.from(map.values());
}

async function getAllTasks(): Promise<Task[]> {
  const supabase = createServerClient();

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  return dedupeByTitle((tasks ?? []) as Task[]);
}

export default async function TasksPage() {
  const tasks = await getAllTasks();

  return <TasksPageClient tasks={tasks} />;
}
