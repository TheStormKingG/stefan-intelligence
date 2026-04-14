"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Plus, Sparkles } from "lucide-react";
import type { TaskSuggestion, PriorityImpact, Difficulty } from "@/lib/types";

interface TaskFormData {
  task_name: string;
  task_description: string;
  selectedSuggestionId: string | null;
  isCustom: boolean;
}

const EMPTY_FORM: TaskFormData = {
  task_name: "",
  task_description: "",
  selectedSuggestionId: null,
  isCustom: false,
};

interface MorningIntakeModalProps {
  suggestions: TaskSuggestion[];
  onSubmit: (
    task1: { task_name: string; task_description: string },
    task2: { task_name: string; task_description: string }
  ) => Promise<void>;
  onClose?: () => void;
}

const PRIORITY_COLORS: Record<PriorityImpact, string> = {
  High: "bg-red-500/15 text-red-600 border-red-500/30",
  Moderate: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Hard: "bg-red-500/15 text-red-600 border-red-500/30",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Easy: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${colorClass}`}>
      {label}
    </span>
  );
}

function TaskDropdown({
  label,
  suggestions,
  value,
  onChange,
}: {
  label: string;
  suggestions: TaskSuggestion[];
  value: TaskFormData;
  onChange: (data: TaskFormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(s: TaskSuggestion) {
    onChange({
      task_name: s.task_name,
      task_description: s.description,
      selectedSuggestionId: s.id,
      isCustom: false,
    });
    setOpen(false);
  }

  function selectCustom() {
    onChange({ task_name: "", task_description: "", selectedSuggestionId: null, isCustom: true });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-body-sm font-semibold text-foreground">{label}</h3>

      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-button text-left text-body-sm transition-colors"
          style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
        >
          <span className={value.task_name ? "text-foreground" : "text-tertiary"}>
            {value.task_name || "Select a task..."}
          </span>
          <ChevronDown size={16} className={`text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-card border shadow-lg"
            style={{ background: "var(--color-surface-solid)", borderColor: "var(--color-border)" }}
          >
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSuggestion(s)}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b last:border-0 hover:bg-black/[0.03] ${
                  value.selectedSuggestionId === s.id ? "bg-black/[0.04]" : ""
                }`}
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={12} className="text-severity-medium shrink-0" />
                      <span className="text-body-sm font-medium text-foreground truncate">{s.task_name}</span>
                    </div>
                    <p className="text-caption text-tertiary line-clamp-2">
                      {s.description.length > 80 ? s.description.slice(0, 80) + "..." : s.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Badge label={s.priority_impact} colorClass={PRIORITY_COLORS[s.priority_impact]} />
                    <Badge label={s.difficulty} colorClass={DIFFICULTY_COLORS[s.difficulty]} />
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={selectCustom}
              className="w-full text-left px-3 py-2.5 hover:bg-black/[0.03] transition-colors flex items-center gap-2 text-body-sm text-secondary"
            >
              <Plus size={14} />
              Enter New Task
            </button>
          </div>
        )}
      </div>

      {value.isCustom && (
        <input
          type="text"
          placeholder="Task name"
          value={value.task_name}
          onChange={(e) => onChange({ ...value, task_name: e.target.value })}
          className="w-full px-3 py-2 rounded-button text-body-sm text-foreground placeholder:text-tertiary focus:outline-none"
          style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
        />
      )}

      <textarea
        placeholder="Task description"
        rows={3}
        value={value.task_description}
        onChange={(e) => onChange({ ...value, task_description: e.target.value })}
        className="w-full px-3 py-2 rounded-button text-body-sm text-foreground placeholder:text-tertiary focus:outline-none resize-none"
        style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
      />
    </div>
  );
}

export function MorningIntakeModal({ suggestions, onSubmit, onClose }: MorningIntakeModalProps) {
  const [task1, setTask1] = useState<TaskFormData>({ ...EMPTY_FORM });
  const [task2, setTask2] = useState<TaskFormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    task1.task_name.trim().length > 0 &&
    task2.task_name.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(
        { task_name: task1.task_name, task_description: task1.task_description },
        { task_name: task2.task_name, task_description: task2.task_description }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tasks");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-card"
        style={{ background: "var(--color-surface-solid)", boxShadow: "var(--neu-shadow)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{ background: "var(--color-surface-solid)", borderColor: "var(--color-border)" }}
        >
          <div>
            <h2 className="text-title-sm text-foreground">Set Today&apos;s Tasks</h2>
            <p className="text-caption text-tertiary mt-0.5">Choose your two focus tasks</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary hover:text-foreground transition-colors"
              style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <TaskDropdown
            label="Task 1 — Morning Block (09:30 - 11:00)"
            suggestions={suggestions}
            value={task1}
            onChange={setTask1}
          />

          <div className="separator" />

          <TaskDropdown
            label="Task 2 — Afternoon Block (13:30 - 15:00)"
            suggestions={suggestions}
            value={task2}
            onChange={setTask2}
          />

          {error && (
            <div className="px-3 py-2 rounded-card bg-red-500/10 border border-red-500/20 text-body-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-3 rounded-button text-body-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{ background: "var(--accent-gradient)", boxShadow: "0 2px 8px rgba(91, 141, 239, 0.35)" }}
          >
            {submitting ? "Saving..." : "Lock In Today\u2019s Tasks"}
          </button>
        </form>
      </div>
    </div>
  );
}
