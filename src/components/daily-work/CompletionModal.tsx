"use client";

import { useState, useRef } from "react";
import { Camera, Monitor, Link2, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import type { EvidenceItem, OverflowState } from "@/lib/types";
import type { CompletionOption, OverflowAction } from "@/lib/overflow-state-machine";

interface CompletionModalProps {
  trigger: "user_completed" | "timer_expired";
  options: CompletionOption[];
  overflowState?: OverflowState | null;
  onAction: (action: OverflowAction) => void;
  onSubmitEvidence: (data: { notes: string; evidence_items: EvidenceItem[] }) => Promise<void>;
  onUploadFile: (file: File) => Promise<string>;
}

type ModalPhase = "confirmation" | "evidence";

const VARIANT_STYLES: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white",
  secondary:
    "bg-white/5 border border-white/10 hover:bg-white/10 text-white/80",
  destructive:
    "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400",
};

interface EvidenceRow {
  id: string;
  type: EvidenceItem["type"];
  value: string;
  uploading: boolean;
}

export function CompletionModal({
  trigger,
  options,
  onAction,
  onSubmitEvidence,
  onUploadFile,
}: CompletionModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("confirmation");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  function handleOptionClick(option: CompletionOption) {
    const { action } = option;

    if (action.type === "KEEP_WORKING") {
      onAction(action);
      return;
    }

    if (action.type === "CONFIRM_COMPLETED") {
      setPhase("evidence");
      return;
    }

    // Extension / borrow actions: propagate up and dismiss
    onAction(action);
  }

  function addRow(type: EvidenceItem["type"], value = "") {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, value, uploading: false },
    ]);
  }

  function updateRow(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleFileUpload(type: "photo" | "screenshot", files: FileList | null) {
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const rowId = crypto.randomUUID();
      setRows((prev) => [...prev, { id: rowId, type, value: "", uploading: true }]);

      try {
        const url = await onUploadFile(file);
        setRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, value: url, uploading: false } : r))
        );
      } catch {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, value: "Upload failed", uploading: false } : r
          )
        );
      }
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const evidenceItems: EvidenceItem[] = rows
        .filter((r) => r.value.trim().length > 0)
        .map((r) => ({ type: r.type, value: r.value }));

      await onSubmitEvidence({ notes, evidence_items: evidenceItems });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0f0f23] border border-white/10 shadow-2xl">
        {/* ── Confirmation phase ── */}
        {phase === "confirmation" && (
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {trigger === "user_completed" ? "Task Complete?" : "Time's Up"}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                {trigger === "user_completed"
                  ? "Confirm completion or keep working"
                  : "Your time block has ended. Choose how to proceed."}
              </p>
            </div>

            <div className="space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                    VARIANT_STYLES[opt.variant]
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Evidence phase ── */}
        {phase === "evidence" && (
          <div className="p-5 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Evidence & Notes</h2>
              <p className="text-xs text-white/40 mt-0.5">
                Capture your work output before closing this task
              </p>
            </div>

            {/* Evidence capture buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <Camera size={18} className="text-white/60" />
                <span className="text-[10px] text-white/50">Photo</span>
              </button>
              <button
                type="button"
                onClick={() => screenshotRef.current?.click()}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <Monitor size={18} className="text-white/60" />
                <span className="text-[10px] text-white/50">Screenshot</span>
              </button>
              <button
                type="button"
                onClick={() => addRow("file")}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <Link2 size={18} className="text-white/60" />
                <span className="text-[10px] text-white/50">File / URL</span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload("photo", e.target.files)}
            />
            <input
              ref={screenshotRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload("screenshot", e.target.files)}
            />

            {/* Evidence rows */}
            {rows.length > 0 && (
              <div className="space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    {row.uploading ? (
                      <Loader2 size={14} className="text-white/40 animate-spin shrink-0" />
                    ) : row.type === "photo" ? (
                      <Camera size={14} className="text-white/40 shrink-0" />
                    ) : row.type === "screenshot" ? (
                      <Monitor size={14} className="text-white/40 shrink-0" />
                    ) : (
                      <Link2 size={14} className="text-white/40 shrink-0" />
                    )}

                    {row.type === "file" ? (
                      <input
                        type="text"
                        placeholder="File path or Google Doc URL"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, e.target.value)}
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    ) : (
                      <span className="flex-1 text-sm text-white/60 truncate">
                        {row.uploading ? "Uploading..." : row.value || "Processing..."}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addRow("file")}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors px-1"
                >
                  <Plus size={12} />
                  Add another
                </button>
              </div>
            )}

            {/* Notes */}
            <textarea
              placeholder="Notes — what did you accomplish? Any follow-ups?"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
            />

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit Evidence
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
