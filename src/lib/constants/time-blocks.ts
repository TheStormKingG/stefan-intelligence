export const INTAKE_WINDOW_START = "08:00";
export const INTAKE_WINDOW_END = "08:30";
export const TIME_BLOCK_1_START = "09:30";
export const TIME_BLOCK_2_START = "13:30";
export const TB1_END = "11:00";
export const TB2_END = "15:00";
export const BLOCK_DURATION_MIN = 90;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function isInIntakeWindow(): boolean {
  const now = nowMinutes();
  return now >= timeToMinutes(INTAKE_WINDOW_START) && now < timeToMinutes(INTAKE_WINDOW_END);
}

export function getCurrentBlock(): 1 | 2 | null {
  const now = nowMinutes();
  if (now >= timeToMinutes(TIME_BLOCK_1_START) && now < timeToMinutes(TB1_END)) return 1;
  if (now >= timeToMinutes(TIME_BLOCK_2_START) && now < timeToMinutes(TB2_END)) return 2;
  return null;
}

export function getBlockStartTime(block: 1 | 2): string {
  return block === 1 ? TIME_BLOCK_1_START : TIME_BLOCK_2_START;
}

export function getBlockEndTime(block: 1 | 2): string {
  return block === 1 ? TB1_END : TB2_END;
}

export function getRemainingSecondsInBlock(block: 1 | 2): number {
  const endMinutes = timeToMinutes(getBlockEndTime(block));
  const now = nowMinutes();
  const remaining = endMinutes - now;
  return Math.max(0, remaining * 60);
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
