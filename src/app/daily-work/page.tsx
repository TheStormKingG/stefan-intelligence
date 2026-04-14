"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Coffee,
  PlusCircle,
  Sparkles,
  ChevronDownIcon,
  InboxIcon,
  ClockIcon,
} from "lucide-react";
import type { DailyTask, TaskSuggestion, EvidenceItem, PriorityImpact, Difficulty } from "@/lib/types";
import {
  isInIntakeWindow,
  getCurrentBlock,
} from "@/lib/constants/time-blocks";
import {
  fetchTodaySuggestions,
  fetchTodayTasks,
  createDailyTasks,
  updateDailyTask,
  submitTaskCompletion,
  uploadEvidence,
} from "@/lib/supabase/daily-tasks";
import {
  overflowReducer,
  INITIAL_STATE,
  getOptionsForState,
  getAddedMinutesForAction,
  type OverflowAction,
} from "@/lib/overflow-state-machine";
import { MorningIntakeModal } from "@/components/daily-work/MorningIntakeModal";
import { FocusModeScreen } from "@/components/daily-work/FocusModeScreen";
import { CompletionModal } from "@/components/daily-work/CompletionModal";

type Phase = "loading" | "waiting" | "focus" | "completion" | "done";
type CompletionTrigger = "user_completed" | "timer_expired";

export default function DailyWorkPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [completionTrigger, setCompletionTrigger] = useState<CompletionTrigger>("user_completed");
  const [overflow, dispatchOverflow] = useReducer(overflowReducer, INITIAL_STATE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  const activeTask = tasks[activeTaskIndex] ?? null;
  const activeSuggestion = suggestions.find(
    (s) => activeTask && s.task_name === activeTask.task_name
  ) ?? null;

  useEffect(() => {
    async function init() {
      try {
        const [todayTasks, todaySuggestions] = await Promise.all([
          fetchTodayTasks(),
          fetchTodaySuggestions(),
        ]);

        setTasks(todayTasks);
        setSuggestions(todaySuggestions);

        if (todayTasks.length === 0 && isInIntakeWindow()) {
          setShowIntakeModal(true);
        }

        if (todayTasks.length > 0) {
          resolveActivePhase(todayTasks);
        } else {
          setPhase("waiting");
        }
      } catch (err) {
        console.error("[DailyWork] Init error:", err);
        setPhase("waiting");
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function resolveActivePhase(taskList: DailyTask[]) {
    const pendingTasks = taskList.filter((t) => t.status !== "completed" && t.status !== "deferred");
    if (pendingTasks.length === 0) {
      setPhase("done");
      return;
    }

    const block = getCurrentBlock();
    if (block !== null) {
      const taskForBlock = taskList.find(
        (t) => t.assigned_block === block && t.status !== "completed" && t.status !== "deferred"
      );
      if (taskForBlock) {
        setActiveTaskIndex(taskList.indexOf(taskForBlock));
        setPhase("focus");
        return;
      }
    }

    setPhase("waiting");
  }

  async function handleIntakeSubmit(
    task1: { task_name: string; task_description: string },
    task2: { task_name: string; task_description: string }
  ) {
    const created = await createDailyTasks(task1, task2);
    setTasks(created);
    setShowIntakeModal(false);
    resolveActivePhase(created);
  }

  const handleUserCompleted = useCallback(() => {
    setCompletionTrigger("user_completed");
    setPhase("completion");
  }, []);

  const handleTimerExpired = useCallback(() => {
    setCompletionTrigger("timer_expired");
    setPhase("completion");
  }, []);

  function handleOverflowAction(action: OverflowAction) {
    if (action.type === "KEEP_WORKING") {
      setPhase("focus");
      return;
    }

    if (action.type === "CONFIRM_COMPLETED") {
      return;
    }

    getAddedMinutesForAction(action);
    dispatchOverflow(action);

    if (
      action.type === "BORROW_30_TB2" ||
      action.type === "BORROW_60_TB2" ||
      action.type === "BORROW_ALL_TB2" ||
      action.type === "TAKE_REST_TB2"
    ) {
      handleBorrowTB2(action);
    }

    setPhase("focus");
  }

  async function handleBorrowTB2(action: OverflowAction) {
    const task2 = tasks.find((t) => t.task_number === 2);
    if (!task2) return;

    if (action.type === "BORROW_ALL_TB2" || action.type === "TAKE_REST_TB2") {
      await updateDailyTask(task2.id, { status: "deferred" });
      setTasks((prev) =>
        prev.map((t) => (t.id === task2.id ? { ...t, status: "deferred" as const } : t))
      );
      showToast("Task 2 has been deferred — all time allocated to Task 1");
    } else {
      await updateDailyTask(task2.id, { assigned_block: task2.assigned_block });
    }
  }

  async function handleSubmitEvidence(data: { notes: string; evidence_items: EvidenceItem[] }) {
    if (!activeTask) return;

    await submitTaskCompletion({
      daily_task_id: activeTask.id,
      notes: data.notes,
      evidence_items: data.evidence_items,
      overflow_state: overflow.overflowState,
    });

    const updatedTasks = tasks.map((t) =>
      t.id === activeTask.id ? { ...t, status: "completed" as const } : t
    );
    setTasks(updatedTasks);

    const nextPending = updatedTasks.find(
      (t) => t.status !== "completed" && t.status !== "deferred"
    );
    if (nextPending) {
      setActiveTaskIndex(updatedTasks.indexOf(nextPending));
      dispatchOverflow({ type: "KEEP_WORKING" });
      resolveActivePhase(updatedTasks);
    } else {
      setPhase("done");
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  }

  const completionOptions = getOptionsForState(overflow.overflowState, completionTrigger);
  const hasTasksToday = tasks.length > 0;

  return (
    <>
      {/* Focus Mode overlay (stays dark) */}
      {phase === "focus" && activeTask && (
        <FocusModeScreen
          task={activeTask}
          suggestion={activeSuggestion}
          onCompleted={handleUserCompleted}
          onTimerExpired={handleTimerExpired}
          addedMinutes={overflow.addedMinutes}
        />
      )}

      {/* Intake modal */}
      {showIntakeModal && (
        <MorningIntakeModal
          suggestions={suggestions}
          onSubmit={handleIntakeSubmit}
          onClose={() => setShowIntakeModal(false)}
        />
      )}

      {/* Completion modal (stays dark) */}
      {phase === "completion" && (
        <CompletionModal
          trigger={completionTrigger}
          options={completionOptions}
          overflowState={overflow.overflowState}
          onAction={handleOverflowAction}
          onSubmitEvidence={handleSubmitEvidence}
          onUploadFile={uploadEvidence}
        />
      )}

      {/* Base page — standard light theme */}
      <div className="page-container">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <p className="text-caption text-tertiary uppercase tracking-widest mb-1">Execution</p>
          <h1 className="text-title-lg text-foreground tracking-tight">Daily Work</h1>
          <p className="text-body-sm text-secondary mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Loading */}
        {phase === "loading" && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full animate-spin"
              style={{ border: "2px solid var(--color-border)", borderTopColor: "var(--color-foreground)" }}
            />
          </div>
        )}

        {/* No tasks today — show add button */}
        {phase !== "loading" && !hasTasksToday && (
          <div className="card p-6 flex flex-col items-center text-center gap-3 mb-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-tertiary"
              style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
            >
              <ClockIcon size={24} strokeWidth={1.5} />
            </div>
            <p className="text-body-md text-secondary font-medium">No tasks set today</p>
            <p className="text-body-sm text-tertiary max-w-[260px]">
              Set your two focus tasks to get started
            </p>
            <button
              onClick={() => setShowIntakeModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-button text-body-sm font-semibold text-white transition-all active:scale-[0.97]"
              style={{ background: "var(--accent-gradient)", boxShadow: "0 2px 8px rgba(91, 141, 239, 0.35)" }}
            >
              <PlusCircle size={16} />
              Set Today&apos;s Tasks
            </button>
          </div>
        )}

        {/* Tasks set — between blocks */}
        {phase === "waiting" && hasTasksToday && (
          <div className="space-y-3 mb-6 animate-fade-in">
            <div className="card p-5 flex flex-col items-center text-center gap-2">
              <Coffee size={22} className="text-tertiary" />
              <p className="text-body-md text-foreground font-medium">Between blocks</p>
              <p className="text-body-sm text-tertiary">
                Your next focus block will start automatically at the scheduled time.
              </p>
            </div>
            {tasks.map((task) => (
              <TaskStatusCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Done state */}
        {phase === "done" && (
          <div className="space-y-3 mb-6 animate-fade-in">
            <div className="card p-5 flex flex-col items-center text-center gap-2">
              <CheckCircle2 size={22} className="text-severity-low" />
              <p className="text-body-md text-foreground font-medium">All tasks complete</p>
              <p className="text-body-sm text-tertiary">
                Great work today. Your evidence has been captured.
              </p>
            </div>
            {tasks.map((task) => (
              <TaskStatusCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Suggested Tasks section — always visible after loading */}
        {phase !== "loading" && (
          <section className="mb-8 animate-fade-in">
            <div className="flex items-baseline justify-between mb-4 px-1">
              <div>
                <h2 className="section-title">Suggested Tasks</h2>
                <p className="section-subtitle mt-0.5">AI-prioritised tasks for today</p>
              </div>
              {suggestions.length > 0 && (
                <span className="text-caption text-tertiary">{suggestions.length} tasks</span>
              )}
            </div>

            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-tertiary"
                  style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
                >
                  <InboxIcon size={24} strokeWidth={1.5} />
                </div>
                <p className="text-body-md text-secondary font-medium">No suggestions yet</p>
                <p className="text-body-sm text-tertiary mt-1.5 max-w-[260px]">
                  Cowork will populate task suggestions during the daily intelligence run
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-[120] px-4">
          <div className="card px-4 py-2.5 flex items-center gap-2 max-w-sm">
            <AlertCircle size={16} className="text-severity-medium shrink-0" />
            <span className="text-body-sm text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ──

function TaskStatusCard({ task }: { task: DailyTask }) {
  const statusConfig: Record<string, { label: string; dot: string }> = {
    pending: { label: "Pending", dot: "bg-tertiary" },
    in_progress: { label: "In Progress", dot: "bg-severity-medium" },
    completed: { label: "Completed", dot: "bg-severity-low" },
    deferred: { label: "Deferred", dot: "bg-severity-critical" },
  };

  const cfg = statusConfig[task.status] ?? statusConfig.pending;

  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`}
        style={{ boxShadow: "0 0 6px currentColor" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-foreground font-medium truncate">{task.task_name}</p>
        <p className="text-caption text-tertiary">
          Block {task.task_number} · {cfg.label}
        </p>
      </div>
    </div>
  );
}

const PRIORITY_BADGE: Record<PriorityImpact, string> = {
  High: "bg-red-500/15 text-red-600 border-red-500/30",
  Moderate: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Hard: "bg-red-500/15 text-red-600 border-red-500/30",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Easy: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

function SuggestionCard({ suggestion }: { suggestion: TaskSuggestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
      >
        <Sparkles size={14} className="text-severity-medium mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-foreground font-medium leading-snug">{suggestion.task_name}</p>
          <p className="text-caption text-tertiary mt-1 line-clamp-2">{suggestion.description}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[suggestion.priority_impact]}`}>
              {suggestion.priority_impact}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_BADGE[suggestion.difficulty]}`}>
              {suggestion.difficulty}
            </span>
            <span className="text-caption text-tertiary ml-1">#{suggestion.rank}</span>
          </div>
        </div>
        <ChevronDownIcon
          size={16}
          className={`text-tertiary mt-0.5 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && suggestion.execution_tips && (
        <div className="px-4 pb-3.5 pt-0 pl-11">
          <div className="px-3 py-2.5 rounded-card"
            style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
          >
            <p className="text-caption text-tertiary uppercase tracking-widest mb-1">Execution Tips</p>
            <p className="text-body-sm text-secondary leading-relaxed">{suggestion.execution_tips}</p>
          </div>
        </div>
      )}
    </div>
  );
}
