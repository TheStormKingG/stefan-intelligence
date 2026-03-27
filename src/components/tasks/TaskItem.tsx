"use client";

import { useState, useTransition } from "react";
import { Task } from "@/lib/types";
import { PRIORITY_CONFIG, VERIFICATION_CONFIG } from "@/lib/constants";
import { formatRelativeDate, isOverdue } from "@/lib/utils";
import { CheckCircle2Icon, XCircleIcon, ClockIcon, MinusCircleIcon } from "lucide-react";

interface TaskItemProps {
  task: Task;
  index?: number;
  compact?: boolean;
}

export function TaskItem({ task, index = 0, compact = false }: TaskItemProps) {
  const isFailed = task.verification_status === "failed_verification";
  const [completed, setCompleted] = useState(isFailed ? false : task.completed);
  const [verificationStatus, setVerificationStatus] = useState(task.verification_status);
  const [, startTransition] = useTransition();
  const config = PRIORITY_CONFIG[task.priority];
  const overdue = !completed && isOverdue(task.due_date);

  async function toggleComplete() {
    const newState = !completed;
    setCompleted(newState);
    setVerificationStatus(newState ? "pending_verification" : null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: newState }),
        });
        if (!res.ok) {
          setCompleted(!newState);
          setVerificationStatus(task.verification_status);
        }
      } catch {
        setCompleted(!newState);
        setVerificationStatus(task.verification_status);
      }
    });
  }

  const vConfig = verificationStatus ? VERIFICATION_CONFIG[verificationStatus] : null;

  return (
    <div
      className={`flex items-center gap-3.5 p-4 transition-all duration-300 animate-slide-up ${
        completed && verificationStatus === "verified" ? "opacity-40" : ""
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className={`priority-dot ${config.dotColor}`} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-body-md font-medium leading-snug ${
            completed && verificationStatus !== "failed_verification"
              ? "line-through text-tertiary"
              : "text-foreground"
          }`}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {vConfig && (
            <span
              className={`inline-flex items-center gap-1 status-badge ${vConfig.color}`}
            >
              <VerificationIcon status={verificationStatus!} />
              {vConfig.label}
            </span>
          )}

          {!compact && (
            <>
              {task.category && (
                <span className="text-caption text-tertiary">{task.category}</span>
              )}
              {task.due_date && (
                <>
                  {(task.category || vConfig) && (
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
            </>
          )}
          {compact && !vConfig && task.category && (
            <span className="text-caption text-tertiary">{task.category}</span>
          )}
        </div>
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

function VerificationIcon({ status }: { status: string }) {
  const size = 11;
  const strokeWidth = 2;
  switch (status) {
    case "verified":
      return <CheckCircle2Icon size={size} strokeWidth={strokeWidth} />;
    case "failed_verification":
      return <XCircleIcon size={size} strokeWidth={strokeWidth} />;
    case "pending_verification":
      return <ClockIcon size={size} strokeWidth={strokeWidth} />;
    default:
      return <MinusCircleIcon size={size} strokeWidth={strokeWidth} />;
  }
}
