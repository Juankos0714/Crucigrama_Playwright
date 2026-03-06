"use client";

/**
 * Cell – a single square in the crossword grid.
 * Handles user input, keyboard navigation, and visual validation states.
 */

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type CellState = "empty" | "filled" | "correct" | "incorrect" | "revealed";

interface CellProps {
  row: number;
  col: number;
  letter: string;          // correct letter (used internally for validation)
  userValue: string;       // what the user has typed
  number?: number;         // clue number to display in corner
  isBlack: boolean;
  isSelected: boolean;     // currently focused cell
  isHighlighted: boolean;  // part of the active word
  state: CellState;
  onInput: (row: number, col: number, value: string) => void;
  onFocus: (row: number, col: number) => void;
  onClick: (row: number, col: number) => void;
  onKeyDown: (row: number, col: number, e: React.KeyboardEvent) => void;
}

export default function Cell({
  row,
  col,
  userValue,
  number,
  isBlack,
  isSelected,
  isHighlighted,
  state,
  onInput,
  onFocus,
  onClick,
  onKeyDown,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  if (isBlack) {
    return (
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--cell-black)]"
        aria-hidden="true"
      />
    );
  }

  // Determine background & text color from state
  const stateClasses: Record<CellState, string> = {
    empty: "bg-[var(--cell-bg)] text-[var(--cell-text)]",
    filled: "bg-[var(--cell-bg)] text-[var(--cell-text)]",
    correct: "bg-[var(--cell-correct-bg)] text-[var(--cell-correct-text)]",
    incorrect: "bg-[var(--cell-incorrect-bg)] text-[var(--cell-incorrect-text)]",
    revealed: "bg-[var(--cell-revealed-bg)] text-[var(--cell-revealed-text)]",
  };

  const highlightClass = isSelected
    ? "ring-2 ring-[var(--cell-selected-ring)] bg-[var(--cell-selected-bg)] text-[var(--cell-text)]"
    : isHighlighted
      ? "bg-[var(--cell-highlight-bg)] text-[var(--cell-text)]"
      : "";

  return (
    <div
      className={cn(
        "relative w-8 h-8 sm:w-9 sm:h-9 border border-[var(--cell-border)] rounded-sm transition-colors duration-150",
        state === "empty" || state === "filled" ? stateClasses[state] : stateClasses[state],
        (state === "empty" || state === "filled") && highlightClass
      )}
    >
      {/* Clue number */}
      {number !== undefined && number > 0 && (
        <span className="absolute top-0 left-0.5 text-[7px] leading-none font-mono text-[var(--cell-number)] select-none pointer-events-none z-10">
          {number}
        </span>
      )}

      {/* Hidden input for keyboard interaction */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        maxLength={2}
        value={userValue}
        aria-label={`Row ${row + 1}, Column ${col + 1}${number ? `, clue ${number}` : ""}`}
        className={cn(
          "absolute inset-0 w-full h-full text-center text-sm font-bold uppercase bg-transparent border-none outline-none cursor-pointer caret-transparent select-none",
          "pt-2 sm:pt-2"
        )}
        onFocus={() => onFocus(row, col)}
        onClick={() => onClick(row, col)}
        onChange={(e) => {
          // Take only the last typed character to allow overwrite
          const raw = e.target.value.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ]/g, "");
          const val = raw.slice(-1).toUpperCase();
          onInput(row, col, val);
        }}
        onKeyDown={(e) => onKeyDown(row, col, e)}
      />
    </div>
  );
}
