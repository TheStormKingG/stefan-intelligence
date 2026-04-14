"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseCountdownReturn {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isRunning: boolean;
  addTime: (minutes: number) => void;
  pause: () => void;
  resume: () => void;
}

export function useCountdown(initialMinutes: number): UseCountdownReturn {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || totalSeconds <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, totalSeconds]);

  const addTime = useCallback((minutes: number) => {
    setTotalSeconds((prev) => prev + minutes * 60);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isExpired: totalSeconds <= 0,
    isRunning,
    addTime,
    pause,
    resume,
  };
}

interface CountdownDisplayProps {
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownDisplay({ minutes, seconds, isExpired }: CountdownDisplayProps) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`text-7xl font-mono font-bold tracking-tight tabular-nums ${
          isExpired
            ? "text-red-500"
            : minutes < 10
            ? "text-amber-500"
            : "text-white"
        }`}
      >
        {pad(minutes)}:{pad(seconds)}
      </div>
      <span className="text-xs text-white/50 uppercase tracking-widest">
        {isExpired ? "Time expired" : "Remaining"}
      </span>
    </div>
  );
}
