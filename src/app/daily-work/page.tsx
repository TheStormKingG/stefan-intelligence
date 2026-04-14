"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import { Clock, CheckCircle2, AlertCircle, Coffee, Sun, Sparkles, ChevronDown } from "lucide-react";
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

type Phase = "loading" | "intake" | "waiting" | "focus" | "completion" | "done";
type CompletionTrigger = "user_completed" | "timer_expired";

export default function DailyWorkPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [completionTrigger, setCompletionTrigger] = useState<CompletionTrigger>("user_completed");
  const [overflow, dispatchOverflow] = useReducer(overflowReducer, INITIAL_STATE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTask = tasks[activeTaskIndex] ?? null;
  const activeSuggestion = suggestions.find(
    (s) => activeTask && s.task_name === activeTask.task_name
  ) ?? null;

  // ── Initial load ──
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
          setPhase("intake");
        } else if (todayTasks.length === 0) {
          setPhase("waiting");
        } else {
          resolveActivePhase(todayTasks);
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

  // ── Intake submit ──
  async function handleIntakeSubmit(
    task1: { task_name: string; task_description: string },
    task2: { task_name: string; task_description: string }
  ) {
    const created = await createDailyTasks(task1, task2);
    setTasks(created);
    resolveActivePhase(created);
  }

  // ── Focus mode callbacks ──
  const handleUserCompleted = useCallback(() => {
    setCompletionTrigger("user_completed");
    setPhase("completion");
  }, []);

  const handleTimerExpired = useCallback(() => {
    setCompletionTrigger("timer_expired");
    setPhase("completion");
  }, []);

  // ── Completion modal actions ──
  function handleOverflowAction(action: OverflowAction) {
    if (action.type === "KEEP_WORKING") {
      setPhase("focus");
      return;
    }

    if (action.type === "CONFIRM_COMPLETED") {
      // Phase stays on "completion" — evidence form is shown inside the modal
      return;
    }

    // Extension or borrow: update state machine, add time, handle TB2 borrow side-effects
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
      // Partial borrow doesn't defer, but Task 2 start shifts
      await updateDailyTask(task2.id, {
        assigned_block: task2.assigned_block,
      });
    }
  }

  // ── Evidence submission ──
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

    // Move to next task or done
    const nextPending = updatedTasks.find(
      (t) => t.status !== "completed" && t.status !== "deferred"
    );
    if (nextPending) {
      setActiveTaskIndex(updatedTasks.indexOf(nextPending));
      dispatchOverflow({ type: "KEEP_WORKING" }); // Reset isn't needed; TB2 starts fresh
      resolveActivePhase(updatedTasks);
    } else {
      setPhase("done");
    }
  }

  // ── Toast ──
  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  }

  const completionOptions = getOptionsForState(overflow.overflowState, completionTrigger);

  // ── Render ──
  return (
    <>
      {/* Focus Mode overlay */}
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
      {phase === "intake" && (
        <MorningIntakeModal
          suggestions={suggestions}
          onSubmit={handleIntakeSubmit}
        />
      )}

      {/* Completion modal */}
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

      {/* Base page (visible when no overlay) */}
      <div className="min-h-screen bg-[#0a0a1a] px-4 pt-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Clock size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Daily Work</h1>
              <p className="text-xs text-white/40">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Loading state */}
          {phase === "loading" && (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Waiting state — tasks not yet set or outside active blocks */}
          {phase === "waiting" && tasks.length === 0 && (
            <StatusCard
              icon={<Sun size={24} className="text-amber-400" />}
              title="No tasks set today"
              description="Tasks are set during the morning intake window (08:00 - 08:30). Come back then, or wait for the next scheduled block."
            />
          )}

          {phase === "waiting" && tasks.length > 0 && (
            <div className="space-y-3">
              <StatusCard
                icon={<Coffee size={24} className="text-indigo-400" />}
                title="Between blocks"
                description="Your next focus block will start automatically at the scheduled time."
              />
              {tasks.map((task) => (
                <TaskStatusCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Done state */}
          {phase === "done" && (
            <div className="space-y-3">
              <StatusCard
                icon={<CheckCircle2 size={24} className="text-emerald-400" />}
                title="All tasks complete"
                description="Great work today. Your evidence has been captured."
              />
              {tasks.map((task) => (
                <TaskStatusCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Suggested Tasks section */}
          {phase !== "loading" && suggestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <Sparkles size={14} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
                  Suggested Tasks
                </h2>
                <span className="text-[10px] text-white/30 ml-auto">{suggestions.length} tasks</span>
              </div>
              {suggestions.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-[120] px-4">
          <div className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-lg flex items-center gap-2 max-w-sm">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <span className="text-sm text-white/80">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ──

function StatusCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-3">
      {icon}
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="text-sm text-white/50 leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

function TaskStatusCard({ task }: { task: DailyTask }) {
  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: "Pending", color: "text-white/50", dot: "bg-white/30" },
    in_progress: { label: "In Progress", color: "text-amber-400", dot: "bg-amber-400" },
    completed: { label: "Completed", color: "text-emerald-400", dot: "bg-emerald-400" },
    deferred: { label: "Deferred", color: "text-red-400", dot: "bg-red-400" },
  };

  const cfg = statusConfig[task.status] ?? statusConfig.pending;

  return (
    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{task.task_name}</p>
        <p className="text-xs text-white/40">
          Block {task.task_number} · {cfg.label}
        </p>
      </div>
    </div>
  );
}

const PRIORITY_BADGE: Record<PriorityImpact, string> = {
  High: "bg-red-500/15 text-red-400 border-red-500/30",
  Moderate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Hard: "bg-red-500/15 text-red-400 border-red-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function SuggestionCard({ suggestion }: { suggestion: TaskSuggestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{suggestion.task_name}</p>
          <p className="text-xs text-white/40 mt-1 line-clamp-2">{suggestion.description}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[suggestion.priority_impact]}`}>
              {suggestion.priority_impact}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFFICULTY_BADGE[suggestion.difficulty]}`}>
              {suggestion.difficulty}
            </span>
            <span className="text-[10px] text-white/25 ml-1">#{suggestion.rank}</span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-white/30 mt-1 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && suggestion.execution_tips && (
        <div className="px-4 pb-3 pt-0">
          <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Execution Tips</p>
            <p className="text-xs text-white/50 leading-relaxed">{suggestion.execution_tips}</p>
          </div>
        </div>
      )}
    </div>
  );
}
