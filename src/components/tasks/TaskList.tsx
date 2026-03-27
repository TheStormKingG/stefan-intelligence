"use client";

import { Task } from "@/lib/types";
import { sortTasksByPriority } from "@/lib/utils";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "@/components/system/EmptyState";
import { CheckCircle2Icon } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description="Tasks for this timeframe will appear here"
        icon={<CheckCircle2Icon size={32} strokeWidth={1.5} />}
      />
    );
  }

  const sorted = sortTasksByPriority(tasks);
  const incomplete = sorted.filter((t) => !t.completed);
  const completed = sorted.filter((t) => t.completed);

  return (
    <div>
      {incomplete.length > 0 && (
        <div className="card divide-y divide-border mb-4">
          {incomplete.map((task, i) => (
            <TaskItem key={task.id} task={task} index={i} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-caption text-tertiary font-medium uppercase tracking-wide mb-2 px-1">
            Completed ({completed.length})
          </p>
          <div className="card divide-y divide-border">
            {completed.map((task, i) => (
              <TaskItem key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
