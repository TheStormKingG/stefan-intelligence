"use client";

import { Task } from "@/lib/types";
import { sortTasksByPriority } from "@/lib/utils";
import { SectionContainer } from "@/components/system/SectionContainer";
import { EmptyState } from "@/components/system/EmptyState";
import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { TaskItem } from "@/components/tasks/TaskItem";

interface ExecutionZoneProps {
  tasks: Task[];
}

export function ExecutionZone({ tasks }: ExecutionZoneProps) {
  const sorted = sortTasksByPriority(tasks);
  const incomplete = sorted.filter((t) => !t.completed).slice(0, 5);

  if (incomplete.length === 0) {
    return (
      <SectionContainer title="Next 24h" subtitle="Execution queue">
        <EmptyState
          title="All caught up"
          description="No pending tasks for the next 24 hours"
          icon={<CheckCircle2Icon size={32} strokeWidth={1.5} />}
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer
      title="Next 24h"
      subtitle="Execution queue"
      action={
        <Link
          href="/tasks"
          className="text-body-sm text-objective-revenue font-medium"
        >
          See all
        </Link>
      }
    >
      <div className="card divide-y divide-border">
        {incomplete.map((task, i) => (
          <TaskItem key={task.id} task={task} index={i} compact />
        ))}
      </div>
    </SectionContainer>
  );
}
