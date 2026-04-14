import { getSupabase } from "@/lib/supabase";
import { getTodayDateString } from "@/lib/constants/time-blocks";
import type {
  TaskSuggestion,
  DailyTask,
  DailyTaskStatus,
  EvidenceItem,
  OverflowState,
} from "@/lib/types";

const supabase = getSupabase();

export async function fetchTodaySuggestions(): Promise<TaskSuggestion[]> {
  const { data, error } = await supabase
    .from("eis_task_suggestions")
    .select("*")
    .eq("date", getTodayDateString())
    .order("rank", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TaskSuggestion[];
}

export async function fetchTodayTasks(): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("date", getTodayDateString())
    .order("task_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyTask[];
}

export async function createDailyTasks(
  task1: { task_name: string; task_description: string },
  task2: { task_name: string; task_description: string }
): Promise<DailyTask[]> {
  const today = getTodayDateString();
  const rows = [
    {
      date: today,
      task_number: 1,
      task_name: task1.task_name,
      task_description: task1.task_description,
      assigned_block: 1,
      status: "pending" as const,
    },
    {
      date: today,
      task_number: 2,
      task_name: task2.task_name,
      task_description: task2.task_description,
      assigned_block: 2,
      status: "pending" as const,
    },
  ];

  const { data, error } = await supabase
    .from("daily_tasks")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []) as DailyTask[];
}

export async function updateDailyTask(
  id: string,
  fields: Partial<Pick<DailyTask, "status" | "assigned_block">>
): Promise<void> {
  const { error } = await supabase
    .from("daily_tasks")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
}

export async function submitTaskCompletion(data: {
  daily_task_id: string;
  notes: string;
  evidence_items: EvidenceItem[];
  overflow_state: OverflowState | null;
}): Promise<void> {
  const { error: completionError } = await supabase
    .from("task_completions")
    .insert({
      daily_task_id: data.daily_task_id,
      completed_at: new Date().toISOString(),
      notes: data.notes,
      evidence_items: data.evidence_items,
      overflow_state: data.overflow_state,
    });

  if (completionError) throw completionError;

  await updateDailyTask(data.daily_task_id, { status: "completed" as DailyTaskStatus });
}

export async function uploadEvidence(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `evidence/${getTodayDateString()}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("task-evidence")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("task-evidence")
    .getPublicUrl(path);

  return data.publicUrl;
}
