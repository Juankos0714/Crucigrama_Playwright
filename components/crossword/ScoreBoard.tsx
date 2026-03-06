"use client";

/**
 * ScoreBoard – shows correct answer count and a completion message.
 */

import React from "react";
import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  correct: number;
  total: number;
  isComplete: boolean;
}

export default function ScoreBoard({ correct, total, isComplete }: ScoreBoardProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-500",
        isComplete
          ? "border-[var(--score-complete-border)] bg-[var(--score-complete-bg)]"
          : "border-[var(--score-border)] bg-[var(--score-bg)]"
      )}
    >
      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 rounded-full bg-[var(--score-bar-track)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--score-bar-fill)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-[var(--score-text)] font-mono">
        <span className="font-bold text-[var(--score-highlight)]">{correct}</span>
        {" / "}
        {total}
        {" respuestas correctas"}
      </p>

      {isComplete && (
        <p className="text-sm font-semibold text-[var(--score-complete-text)] animate-pulse">
          ¡Crucigrama completado! Excelente trabajo.
        </p>
      )}
    </div>
  );
}
