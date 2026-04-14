"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import type { DailyTask, TaskSuggestion } from "@/lib/types";
import { useCountdown, CountdownDisplay } from "./CountdownTimer";
import { FocusBanner } from "./FocusBanner";
import { BLOCK_DURATION_MIN } from "@/lib/constants/time-blocks";

interface FocusModeScreenProps {
  task: DailyTask;
  suggestion: TaskSuggestion | null;
  onCompleted: () => void;
  onTimerExpired: () => void;
  addedMinutes: number;
}

export function FocusModeScreen({
  task,
  suggestion,
  onCompleted,
  onTimerExpired,
  addedMinutes,
}: FocusModeScreenProps) {
  const countdown = useCountdown(BLOCK_DURATION_MIN);
  const prevAddedRef = useRef(0);
  const expiredHandled = useRef(false);

  // Sync external added minutes into the countdown
  useEffect(() => {
    const delta = addedMinutes - prevAddedRef.current;
    if (delta > 0) {
      countdown.addTime(delta);
      expiredHandled.current = false;
    }
    prevAddedRef.current = addedMinutes;
  }, [addedMinutes, countdown]);

  // Fire onTimerExpired once when countdown reaches 0
  useEffect(() => {
    if (countdown.isExpired && !expiredHandled.current) {
      expiredHandled.current = true;
      onTimerExpired();
    }
  }, [countdown.isExpired, onTimerExpired]);

  // Log PWA notification limitation once
  useEffect(() => {
    console.warn(
      "[EIS Focus Mode] OS-level notification suppression requires a native app wrapper. " +
      "In-app notifications are suppressed; calls are not blocked."
    );
  }, []);

  const tips = suggestion?.execution_tips ?? null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a1a] overflow-hidden">
      <FocusBanner />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 overflow-y-auto">
        {/* Timer */}
        <div className="mb-10">
          <CountdownDisplay
            minutes={countdown.minutes}
            seconds={countdown.seconds}
            isExpired={countdown.isExpired}
          />
        </div>

        {/* Task info */}
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {task.task_name}
          </h1>

          {task.task_description && (
            <p className="text-sm text-white/60 leading-relaxed">
              {task.task_description}
            </p>
          )}

          {tips && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">
                Execution Tips
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{tips}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom action */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a] to-transparent">
        <button
          onClick={onCompleted}
          className="w-full py-4 rounded-2xl text-base font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20"
        >
          <CheckCircle2 size={20} />
          Mark Completed
        </button>
      </div>
    </div>
  );
}
