"use client";

import { useState, useTransition } from "react";
import { Task } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { formatRelativeDate, isOverdue } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  index?: number;
  compact?: boolean;
}

export function TaskItem({ task, index = 0, compact = false }: TaskItemProps) {
  const [completed, setCompleted] = useState(task.completed);
  const [, startTransition] = useTransition();
  const config = PRIORITY_CONFIG[task.priority];
  const overdue = !completed && isOverdue(task.due_date);

  async function toggleComplete() {
    const newState = !completed;
    setCompleted(newState);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: newState }),
        });
        if (!res.ok) setCompleted(!newState);
      } catch {
        setCompleted(!newState);
      }
    });
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 transition-all duration-300 animate-slide-up ${
        completed ? "opacity-40" : ""
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className={`priority-dot ${config.dotColor}`} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-body-md font-medium leading-snug ${
            completed ? "line-through text-tertiary" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {!compact && (
          <div className="flex items-center gap-2 mt-1">
            {task.category && (
              <span className="text-caption text-tertiary">{task.category}</span>
            )}
            {task.due_date && (
              <>
                {task.category && (
                  <span className="text-tertiary text-caption">·</span>
                )}
                <span
                  className={`text-caption ${
                    overdue ? "text-severity-critical font-medium" : "text-tertiary"
                  }`}
                >
                  {formatRelativeDate(task.due_date)}
                </span>
              </>
            )}
          </div>
        )}
        {compact && task.category && (
          <span className="text-caption text-tertiary">{task.category}</span>
        )}
      </div>

      <input
        type="checkbox"
        checked={completed}
        onChange={toggleComplete}
        aria-label={`Mark "${task.title}" as ${completed ? "incomplete" : "complete"}`}
      />
    </div>
  );
}
