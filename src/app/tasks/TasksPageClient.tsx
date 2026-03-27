"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { getTasksForTimeframe } from "@/lib/utils";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import { TaskList } from "@/components/tasks/TaskList";

const SEGMENTS = [
  { value: "1", label: "24h" },
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
];

interface TasksPageClientProps {
  tasks: Task[];
}

export function TasksPageClient({ tasks }: TasksPageClientProps) {
  const [timeframe, setTimeframe] = useState("7");

  const filtered = getTasksForTimeframe(tasks, parseInt(timeframe));

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-caption text-tertiary uppercase tracking-widest mb-1">Execution</p>
          <h1 className="text-title-lg text-foreground tracking-tight">Tasks</h1>
        </div>
        <SegmentedControl
          segments={SEGMENTS}
          value={timeframe}
          onChange={setTimeframe}
        />
      </div>

      <TaskList tasks={filtered} />
    </div>
  );
}
