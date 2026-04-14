import type { OverflowState } from "@/lib/types";

// ── Action types ──

export type OverflowAction =
  | { type: "EXTEND_30" }
  | { type: "EXTEND_60" }
  | { type: "BORROW_30_TB2" }
  | { type: "BORROW_60_TB2" }
  | { type: "BORROW_ALL_TB2" }
  | { type: "TAKE_REST_TB2" }
  | { type: "CONFIRM_COMPLETED" }
  | { type: "KEEP_WORKING" };

// ── Completion option descriptors shown in the UI ──

export interface CompletionOption {
  label: string;
  action: OverflowAction;
  variant: "primary" | "secondary" | "destructive";
}

export function getOptionsForState(
  state: OverflowState | null,
  trigger: "user_completed" | "timer_expired"
): CompletionOption[] {
  if (trigger === "user_completed") {
    return [
      { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
      { label: "Keep Working", action: { type: "KEEP_WORKING" }, variant: "secondary" },
    ];
  }

  switch (state) {
    case "TB1_NOMINAL_END":
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
        { label: "Need 30 More Minutes", action: { type: "EXTEND_30" }, variant: "secondary" },
        { label: "Need 60 More Minutes", action: { type: "EXTEND_60" }, variant: "secondary" },
      ];

    case "TB1_EXTENDED_30":
    case "TB1_EXTENDED_60":
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
        { label: "Need 30 More Minutes", action: { type: "EXTEND_30" }, variant: "secondary" },
      ];

    case "TB1_EXTENDED_60_THEN_30":
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
        { label: "Borrow 30 min of Task 2", action: { type: "BORROW_30_TB2" }, variant: "destructive" },
        { label: "Borrow 60 min of Task 2", action: { type: "BORROW_60_TB2" }, variant: "destructive" },
        { label: "Borrow all of Task 2", action: { type: "BORROW_ALL_TB2" }, variant: "destructive" },
      ];

    case "TB2_BORROW_30":
    case "TB2_BORROW_60":
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
        { label: "Take rest of Task 2 time", action: { type: "TAKE_REST_TB2" }, variant: "destructive" },
      ];

    case "TB2_FULLY_USED":
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
      ];

    default:
      return [
        { label: "Confirm Completed", action: { type: "CONFIRM_COMPLETED" }, variant: "primary" },
        { label: "Need 30 More Minutes", action: { type: "EXTEND_30" }, variant: "secondary" },
        { label: "Need 60 More Minutes", action: { type: "EXTEND_60" }, variant: "secondary" },
      ];
  }
}

// ── State transitions ──

export interface OverflowMachineState {
  overflowState: OverflowState;
  addedMinutes: number;
  completed: boolean;
  keepWorking: boolean;
}

export const INITIAL_STATE: OverflowMachineState = {
  overflowState: "TB1_NOMINAL_END",
  addedMinutes: 0,
  completed: false,
  keepWorking: false,
};

export function overflowReducer(
  state: OverflowMachineState,
  action: OverflowAction
): OverflowMachineState {
  switch (action.type) {
    case "CONFIRM_COMPLETED":
      return { ...state, completed: true, keepWorking: false };

    case "KEEP_WORKING":
      return { ...state, keepWorking: true };

    case "EXTEND_30":
      return resolveExtend30(state);

    case "EXTEND_60":
      return resolveExtend60(state);

    case "BORROW_30_TB2":
      return { ...state, overflowState: "TB2_BORROW_30", addedMinutes: state.addedMinutes + 30 };

    case "BORROW_60_TB2":
      return { ...state, overflowState: "TB2_BORROW_60", addedMinutes: state.addedMinutes + 60 };

    case "BORROW_ALL_TB2":
      return { ...state, overflowState: "TB2_FULLY_USED", addedMinutes: state.addedMinutes + 90 };

    case "TAKE_REST_TB2":
      return { ...state, overflowState: "TB2_FULLY_USED", addedMinutes: state.addedMinutes + 90 };

    default:
      return state;
  }
}

function resolveExtend30(state: OverflowMachineState): OverflowMachineState {
  const added = state.addedMinutes + 30;

  switch (state.overflowState) {
    case "TB1_NOMINAL_END":
      return { ...state, overflowState: "TB1_EXTENDED_30", addedMinutes: added };
    case "TB1_EXTENDED_60":
      return { ...state, overflowState: "TB1_EXTENDED_60_THEN_30", addedMinutes: added };
    case "TB1_EXTENDED_30":
      return { ...state, overflowState: "TB1_EXTENDED_60_THEN_30", addedMinutes: added };
    default:
      return { ...state, addedMinutes: added };
  }
}

function resolveExtend60(state: OverflowMachineState): OverflowMachineState {
  const added = state.addedMinutes + 60;

  switch (state.overflowState) {
    case "TB1_NOMINAL_END":
      return { ...state, overflowState: "TB1_EXTENDED_60", addedMinutes: added };
    default:
      return { ...state, addedMinutes: added };
  }
}

/** Minutes to add to the countdown for a given action */
export function getAddedMinutesForAction(action: OverflowAction): number {
  switch (action.type) {
    case "EXTEND_30":
    case "BORROW_30_TB2":
      return 30;
    case "EXTEND_60":
    case "BORROW_60_TB2":
      return 60;
    case "BORROW_ALL_TB2":
    case "TAKE_REST_TB2":
      return 90;
    default:
      return 0;
  }
}
