"use client";

/**
 * useCrossword – central state management hook.
 *
 * Responsibilities:
 * - Builds & memoizes the crossword grid
 * - Manages user input per cell
 * - Handles keyboard navigation (arrows, Tab, Backspace, Enter)
 * - Validates answers (correct / incorrect cell states)
 * - Reveals the full solution
 * - Resets the puzzle
 * - Persists progress to localStorage
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { buildCrossword, PlacedWord, CrosswordGrid } from "@/lib/crossword-engine";
import { CellState } from "@/components/crossword/Cell";

const STORAGE_KEY = "playwright-crossword-v1";

export interface CrosswordState {
  grid: CrosswordGrid;
  userValues: string[][];
  cellStates: CellState[][];
  selectedCell: { row: number; col: number } | null;
  activeWordId: number | null;
  activeDirection: "across" | "down";
  activeWordCells: Set<string>;
  acrossWords: PlacedWord[];
  downWords: PlacedWord[];
  completedWordIds: Set<number>;
  correctCount: number;
  totalWords: number;
  isComplete: boolean;
  // Actions
  handleCellInput: (row: number, col: number, value: string) => void;
  handleCellFocus: (row: number, col: number) => void;
  handleCellClick: (row: number, col: number) => void;
  handleCellKeyDown: (row: number, col: number, e: React.KeyboardEvent) => void;
  handleClueClick: (word: PlacedWord) => void;
  handleVerify: () => void;
  handleReveal: () => void;
  handleReset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyValues(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

function emptyStates(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array(cols).fill("empty") as CellState[]
  );
}

/** Given a cell, find which word it belongs to (preferring the current direction). */
function findWordForCell(
  grid: CrosswordGrid,
  row: number,
  col: number,
  preferredDir: "across" | "down"
): PlacedWord | null {
  const cell = grid.cells[row]?.[col];
  if (!cell || cell.isBlack) return null;
  const wordsInCell = grid.placedWords.filter((w) => cell.wordIds.includes(w.id));
  if (wordsInCell.length === 0) return null;
  const preferred = wordsInCell.find((w) => w.direction === preferredDir);
  return preferred ?? wordsInCell[0];
}

/** Compute the set of "row,col" keys belonging to a word. */
function wordCellKeys(word: PlacedWord): Set<string> {
  const keys = new Set<string>();
  const dr = word.direction === "down" ? 1 : 0;
  const dc = word.direction === "across" ? 1 : 0;
  for (let i = 0; i < word.answer.length; i++) {
    keys.add(`${word.row + dr * i},${word.col + dc * i}`);
  }
  return keys;
}

/** Next non-black cell in direction, wrapping word boundary. */
function nextCell(
  grid: CrosswordGrid,
  row: number,
  col: number,
  dr: number,
  dc: number
): { row: number; col: number } | null {
  const nr = row + dr;
  const nc = col + dc;
  if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) return null;
  if (grid.cells[nr][nc].isBlack) return null;
  return { row: nr, col: nc };
}

/** Find the previous non-black cell. */
function prevCell(
  grid: CrosswordGrid,
  row: number,
  col: number,
  dr: number,
  dc: number
): { row: number; col: number } | null {
  return nextCell(grid, row, col, -dr, -dc);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCrossword(): CrosswordState {
  // Build grid once
  const grid = useMemo(() => buildCrossword(), []);

  // Across / Down word lists
  const acrossWords = useMemo(
    () => grid.placedWords.filter((w) => w.direction === "across"),
    [grid]
  );
  const downWords = useMemo(
    () => grid.placedWords.filter((w) => w.direction === "down"),
    [grid]
  );

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [userValues, setUserValues] = useState<string[][]>(() => {
    if (typeof window === "undefined") return emptyValues(grid.rows, grid.cols);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[][];
        if (parsed.length === grid.rows && parsed[0]?.length === grid.cols) {
          return parsed;
        }
      }
    } catch { }
    return emptyValues(grid.rows, grid.cols);
  });

  const [cellStates, setCellStates] = useState<CellState[][]>(() =>
    emptyStates(grid.rows, grid.cols)
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<"across" | "down">("across");
  const [activeWordId, setActiveWordId] = useState<number | null>(null);

  // -------------------------------------------------------------------------
  // Persist to localStorage on every input change
  // -------------------------------------------------------------------------
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userValues));
    } catch { }
  }, [userValues]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const activeWord = useMemo(
    () => (activeWordId ? grid.placedWords.find((w) => w.id === activeWordId) ?? null : null),
    [activeWordId, grid]
  );

  const activeWordCells = useMemo(
    () => (activeWord ? wordCellKeys(activeWord) : new Set<string>()),
    [activeWord]
  );

  /** A word is "complete" when all its cells have the correct user value. */
  const completedWordIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();
    for (const w of grid.placedWords) {
      const dr = w.direction === "down" ? 1 : 0;
      const dc = w.direction === "across" ? 1 : 0;
      let allCorrect = true;
      for (let i = 0; i < w.answer.length; i++) {
        const uv = userValues[w.row + dr * i]?.[w.col + dc * i] ?? "";
        if (uv !== w.answer[i]) { allCorrect = false; break; }
      }
      if (allCorrect) ids.add(w.id);
    }
    return ids;
  }, [userValues, grid]);

  const correctCount = completedWordIds.size;
  const totalWords = grid.placedWords.length;
  const isComplete = correctCount === totalWords;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /** Update a single cell's value and sync shared intersections. */
  const handleCellInput = useCallback(
    (row: number, col: number, value: string) => {
      setUserValues((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = value;
        return next;
      });

      // Reset validation state for this cell
      setCellStates((prev) => {
        const next = prev.map((r) => [...r]) as CellState[][];
        if (next[row][col] === "correct" || next[row][col] === "incorrect") {
          next[row][col] = "filled";
        }
        return next;
      });

      // Advance cursor if a letter was typed
      if (value !== "" && activeWord) {
        const dr = activeWord.direction === "down" ? 1 : 0;
        const dc = activeWord.direction === "across" ? 1 : 0;
        const n = nextCell(grid, row, col, dr, dc);
        if (n) setSelectedCell(n);
      }
    },
    [activeWord, grid]
  );

  /** Select a cell and determine the active word. */
  const handleCellFocus = useCallback(
    (row: number, col: number) => {
      // If we are already focused here, do nothing so we don't spam state updates
      if (selectedCell?.row === row && selectedCell?.col === col) return;

      const cell = grid.cells[row]?.[col];
      if (!cell || cell.isBlack) return;

      setSelectedCell({ row, col });

      const word = findWordForCell(grid, row, col, activeDirection);
      if (word && word.direction !== activeDirection) {
        setActiveDirection(word.direction);
      }
      setActiveWordId(word?.id ?? null);
    },
    [grid, selectedCell, activeDirection]
  );

  /** Toggle direction when an already selected cell is clicked. */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const cell = grid.cells[row]?.[col];
      if (!cell || cell.isBlack) return;

      let dir = activeDirection;
      if (selectedCell?.row === row && selectedCell?.col === col) {
        const wordsInCell = grid.placedWords.filter((w) => cell.wordIds.includes(w.id));
        const hasOtherDir = wordsInCell.some((w) => w.direction !== activeDirection);
        if (hasOtherDir) dir = activeDirection === "across" ? "down" : "across";

        setActiveDirection(dir);
        const word = findWordForCell(grid, row, col, dir);
        setActiveWordId(word?.id ?? null);
      }
    },
    [grid, selectedCell, activeDirection]
  );

  /** Jump to a word when clicking a clue. */
  const handleClueClick = useCallback(
    (word: PlacedWord) => {
      setSelectedCell({ row: word.row, col: word.col });
      setActiveDirection(word.direction);
      setActiveWordId(word.id);
    },
    []
  );

  /** Keyboard navigation. */
  const handleCellKeyDown = useCallback(
    (row: number, col: number, e: React.KeyboardEvent) => {
      const dr = activeDirection === "down" ? 1 : 0;
      const dc = activeDirection === "across" ? 1 : 0;

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          if (activeDirection === "across") {
            const n = nextCell(grid, row, col, 0, 1);
            if (n) handleCellFocus(n.row, n.col);
          } else {
            // Switch to across
            const word = findWordForCell(grid, row, col, "across");
            if (word) { setActiveDirection("across"); setActiveWordId(word.id); }
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          if (activeDirection === "across") {
            const p = prevCell(grid, row, col, 0, 1);
            if (p) handleCellFocus(p.row, p.col);
          } else {
            const word = findWordForCell(grid, row, col, "across");
            if (word) { setActiveDirection("across"); setActiveWordId(word.id); }
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          if (activeDirection === "down") {
            const n = nextCell(grid, row, col, 1, 0);
            if (n) handleCellFocus(n.row, n.col);
          } else {
            const word = findWordForCell(grid, row, col, "down");
            if (word) { setActiveDirection("down"); setActiveWordId(word.id); }
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (activeDirection === "down") {
            const p = prevCell(grid, row, col, 1, 0);
            if (p) handleCellFocus(p.row, p.col);
          } else {
            const word = findWordForCell(grid, row, col, "down");
            if (word) { setActiveDirection("down"); setActiveWordId(word.id); }
          }
          break;
        }
        case "Backspace": {
          e.preventDefault();
          if (userValues[row][col] !== "") {
            // Clear current cell and move backward
            handleCellInput(row, col, "");
            const p = prevCell(grid, row, col, dr, dc);
            if (p) setSelectedCell(p);
          } else {
            // Move back and clear that cell
            const p = prevCell(grid, row, col, dr, dc);
            if (p) {
              handleCellInput(p.row, p.col, "");
              setSelectedCell(p);
            }
          }
          break;
        }
        case "Delete": {
          e.preventDefault();
          handleCellInput(row, col, "");
          break;
        }
        case "Tab": {
          e.preventDefault();
          // Jump to next word in same direction
          const currentWords = e.shiftKey ? [...(activeDirection === "across" ? acrossWords : downWords)].reverse() : (activeDirection === "across" ? acrossWords : downWords);
          const sorted = currentWords.slice().sort((a, b) => a.number - b.number);
          const idx = sorted.findIndex((w) => w.id === activeWordId);
          const next = sorted[(idx + (e.shiftKey ? -1 : 1) + sorted.length) % sorted.length];
          if (next) handleClueClick(next);
          break;
        }
        case "Enter": {
          e.preventDefault();
          // Toggle direction
          const other = activeDirection === "across" ? "down" : "across";
          const word = findWordForCell(grid, row, col, other);
          if (word) {
            setActiveDirection(other);
            setActiveWordId(word.id);
          }
          break;
        }
        default:
          break;
      }
    },
    [
      grid,
      activeDirection,
      activeWordId,
      acrossWords,
      downWords,
      userValues,
      handleCellFocus,
      handleCellInput,
      handleClueClick,
    ]
  );

  /** Validate all filled cells. */
  const handleVerify = useCallback(() => {
    setCellStates(
      grid.cells.map((rowArr) =>
        rowArr.map((cell) => {
          if (cell.isBlack) return "empty";
          const uv = userValues[cell.row]?.[cell.col] ?? "";
          if (uv === "") return "empty";
          return uv === cell.letter ? "correct" : "incorrect";
        })
      ) as CellState[][]
    );
  }, [grid, userValues]);

  /** Reveal the full solution. */
  const handleReveal = useCallback(() => {
    const newValues = grid.cells.map((rowArr) =>
      rowArr.map((cell) => (cell.isBlack ? "" : cell.letter))
    );
    setUserValues(newValues);
    setCellStates(
      grid.cells.map((rowArr) =>
        rowArr.map((cell) => (cell.isBlack ? "empty" : "revealed"))
      ) as CellState[][]
    );
  }, [grid]);

  /** Reset everything. */
  const handleReset = useCallback(() => {
    setUserValues(emptyValues(grid.rows, grid.cols));
    setCellStates(emptyStates(grid.rows, grid.cols));
    setSelectedCell(null);
    setActiveWordId(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
  }, [grid]);

  return {
    grid,
    userValues,
    cellStates,
    selectedCell,
    activeWordId,
    activeDirection,
    activeWordCells,
    acrossWords,
    downWords,
    completedWordIds,
    correctCount,
    totalWords,
    isComplete,
    handleCellInput,
    handleCellFocus,
    handleCellClick,
    handleCellKeyDown,
    handleClueClick,
    handleVerify,
    handleReveal,
    handleReset,
  };
}
