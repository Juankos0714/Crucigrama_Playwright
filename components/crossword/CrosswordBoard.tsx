"use client";

/**
 * CrosswordBoard – renders the full grid of cells.
 * Receives the grid layout and user state from the parent hook.
 */

import React from "react";
import Cell, { CellState } from "./Cell";
import { CrosswordGrid } from "@/lib/crossword-engine";

interface CrosswordBoardProps {
  grid: CrosswordGrid;
  userValues: string[][];
  cellStates: CellState[][];
  selectedCell: { row: number; col: number } | null;
  activeWordCells: Set<string>; // "row,col" keys of the active word
  onCellInput: (row: number, col: number, value: string) => void;
  onCellFocus: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
  onCellKeyDown: (row: number, col: number, e: React.KeyboardEvent) => void;
}

export default function CrosswordBoard({
  grid,
  userValues,
  cellStates,
  selectedCell,
  activeWordCells,
  onCellInput,
  onCellFocus,
  onCellClick,
  onCellKeyDown,
}: CrosswordBoardProps) {
  return (
    <div
      className="overflow-auto rounded-lg border border-[var(--board-border)] bg-[var(--board-bg)] p-3 shadow-xl"
      role="grid"
      aria-label="Crossword puzzle grid"
    >
      <div
        className="inline-grid gap-px"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, auto)` }}
      >
        {grid.cells.map((rowArr, r) =>
          rowArr.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              row={r}
              col={c}
              letter={cell.letter}
              userValue={userValues[r]?.[c] ?? ""}
              number={cell.number}
              isBlack={cell.isBlack}
              isSelected={selectedCell?.row === r && selectedCell?.col === c}
              isHighlighted={activeWordCells.has(`${r},${c}`)}
              state={cellStates[r]?.[c] ?? "empty"}
              onInput={onCellInput}
              onFocus={onCellFocus}
              onClick={onCellClick}
              onKeyDown={onCellKeyDown}
            />
          ))
        )}
      </div>
    </div>
  );
}
