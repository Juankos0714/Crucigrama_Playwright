/**
 * Crossword layout engine.
 * Responsible for placing words on a 2D grid with shared letter intersections.
 */

import { ENCRYPTED_CLUES, ClueEntry } from "./crossword-data";
import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_CROSSWORD_SECRET || "plw_cr0ssw0rd_s3cur3_k3y_98Xq!";
const bytes = CryptoJS.AES.decrypt(ENCRYPTED_CLUES, secretKey);
const CLUES: ClueEntry[] = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

export type Direction = "across" | "down";

export interface PlacedWord {
  id: number;
  clue: string;
  answer: string;
  direction: Direction;
  row: number; // top-left cell row
  col: number; // top-left cell col
  number: number; // clue number displayed on grid
}

export interface GridCell {
  letter: string;      // correct letter
  row: number;
  col: number;
  isBlack: boolean;    // true → blocked cell
  wordIds: number[];   // IDs of words that pass through this cell
  number?: number;     // clue number if this is the first cell of a word
}

export interface CrosswordGrid {
  cells: GridCell[][];
  rows: number;
  cols: number;
  placedWords: PlacedWord[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface Grid {
  rows: number;
  cols: number;
  data: (string | null)[][];
}

function makeGrid(rows: number, cols: number): Grid {
  return {
    rows,
    cols,
    data: Array.from({ length: rows }, () => Array(cols).fill(null)),
  };
}

function canPlace(
  grid: Grid,
  word: string,
  row: number,
  col: number,
  dir: Direction
): boolean {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;

  // Check bounds
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);
  if (endRow >= grid.rows || endCol >= grid.cols || row < 0 || col < 0) return false;

  // Cell before start must be empty or out of bounds
  const prevRow = row - dr;
  const prevCol = col - dc;
  if (prevRow >= 0 && prevCol >= 0 && grid.data[prevRow][prevCol] !== null) return false;

  // Cell after end must be empty or out of bounds
  const afterRow = endRow + dr;
  const afterCol = endCol + dc;
  if (afterRow < grid.rows && afterCol < grid.cols && grid.data[afterRow][afterCol] !== null) return false;

  let hasIntersection = false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = grid.data[r][c];
    if (existing === null) {
      // Check perpendicular neighbors don't bleed into another word
      const perpR = r + dc; // dc used as dr for perpendicular
      const perpC = c + dr;
      const prevPerpR = r - dc;
      const prevPerpC = c - dr;
      if (
        existing === null &&
        (
          (perpR < grid.rows && perpC < grid.cols && grid.data[perpR][perpC] !== null) ||
          (prevPerpR >= 0 && prevPerpC >= 0 && grid.data[prevPerpR][prevPerpC] !== null)
        )
      ) {
        // Could be problematic neighbor — skip for simplicity
        return false;
      }
    } else if (existing !== word[i]) {
      return false;
    } else {
      hasIntersection = true;
    }
  }
  return hasIntersection;
}

function placeWord(
  grid: Grid,
  word: string,
  row: number,
  col: number,
  dir: Direction
): void {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  for (let i = 0; i < word.length; i++) {
    grid.data[row + dr * i][col + dc * i] = word[i];
  }
}

// ---------------------------------------------------------------------------
// Core layout algorithm
// ---------------------------------------------------------------------------

/**
 * Build a crossword grid from the CLUES list.
 * Strategy: greedy placement with intersection scoring.
 * First word goes horizontal in the center; subsequent words are placed
 * wherever they share the most intersections.
 */
export function buildCrossword(): CrosswordGrid {
  const GRID_SIZE = 38; // large enough to hold all words
  const grid = makeGrid(GRID_SIZE, GRID_SIZE);

  // Sort words: longest first to maximise intersection opportunities
  const sorted = [...CLUES].sort((a, b) => b.answer.length - a.answer.length);

  const placed: Array<{ entry: ClueEntry; row: number; col: number; dir: Direction }> = [];

  // Place the first (longest) word horizontally in the center
  const first = sorted[0];
  const centerRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - first.answer.length) / 2);
  placeWord(grid, first.answer, centerRow, startCol, "across");
  placed.push({ entry: first, row: centerRow, col: startCol, dir: "across" });

  // Place remaining words
  for (let wi = 1; wi < sorted.length; wi++) {
    const entry = sorted[wi];
    let bestScore = -1;
    let bestRow = -1;
    let bestCol = -1;
    let bestDir: Direction = "across";

    for (const p of placed) {
      // Try each letter of the already-placed word as an intersection point
      for (let pi = 0; pi < p.entry.answer.length; pi++) {
        const gridRow = p.dir === "down" ? p.row + pi : p.row;
        const gridCol = p.dir === "across" ? p.col + pi : p.col;
        const existingLetter = p.entry.answer[pi];

        // Try each letter of the new word that matches
        for (let ni = 0; ni < entry.answer.length; ni++) {
          if (entry.answer[ni] !== existingLetter) continue;

          // Try perpendicular direction
          const newDir: Direction = p.dir === "across" ? "down" : "across";
          const dr = newDir === "down" ? 1 : 0;
          const dc = newDir === "across" ? 1 : 0;
          const newRow = gridRow - dr * ni;
          const newCol = gridCol - dc * ni;

          if (canPlace(grid, entry.answer, newRow, newCol, newDir)) {
            // Score = number of intersections
            let score = 0;
            for (let k = 0; k < entry.answer.length; k++) {
              if (grid.data[newRow + dr * k][newCol + dc * k] !== null) score++;
            }
            if (score > bestScore) {
              bestScore = score;
              bestRow = newRow;
              bestCol = newCol;
              bestDir = newDir;
            }
          }
        }
      }
    }

    if (bestRow !== -1) {
      placeWord(grid, entry.answer, bestRow, bestCol, bestDir);
      placed.push({ entry, row: bestRow, col: bestCol, dir: bestDir });
    }
  }

  // ---------------------------------------------------------------------------
  // Crop the grid to used area only (with 1-cell padding)
  // ---------------------------------------------------------------------------
  let minRow = GRID_SIZE, maxRow = 0, minCol = GRID_SIZE, maxCol = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid.data[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  const PAD = 1;
  minRow = Math.max(0, minRow - PAD);
  maxRow = Math.min(GRID_SIZE - 1, maxRow + PAD);
  minCol = Math.max(0, minCol - PAD);
  maxCol = Math.min(GRID_SIZE - 1, maxCol + PAD);

  const finalRows = maxRow - minRow + 1;
  const finalCols = maxCol - minCol + 1;

  // Adjust placed coordinates to cropped grid
  const adjustedPlaced = placed.map((p) => ({
    ...p,
    row: p.row - minRow,
    col: p.col - minCol,
  }));

  // ---------------------------------------------------------------------------
  // Build PlacedWord list with clue numbers
  // ---------------------------------------------------------------------------
  // Assign numbers: sort by row then col
  const sortedPlaced = [...adjustedPlaced].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );

  let clueNumber = 1;
  const numberMap = new Map<string, number>(); // "row,col" → number

  for (const p of sortedPlaced) {
    const key = `${p.row},${p.col}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, clueNumber++);
    }
  }

  const placedWords: PlacedWord[] = adjustedPlaced.map((p) => ({
    id: p.entry.id,
    clue: p.entry.clue,
    answer: p.entry.answer,
    direction: p.dir,
    row: p.row,
    col: p.col,
    number: numberMap.get(`${p.row},${p.col}`) ?? 0,
  }));

  // ---------------------------------------------------------------------------
  // Build final GridCell matrix
  // ---------------------------------------------------------------------------
  const cells: GridCell[][] = Array.from({ length: finalRows }, (_, r) =>
    Array.from({ length: finalCols }, (_, c) => ({
      letter: "",
      row: r,
      col: c,
      isBlack: true,
      wordIds: [],
    }))
  );

  // Fill in actual letters
  for (const p of adjustedPlaced) {
    const dr = p.dir === "down" ? 1 : 0;
    const dc = p.dir === "across" ? 1 : 0;
    for (let i = 0; i < p.entry.answer.length; i++) {
      const r = p.row + dr * i;
      const c = p.col + dc * i;
      cells[r][c].isBlack = false;
      cells[r][c].letter = p.entry.answer[i];
      if (!cells[r][c].wordIds.includes(p.entry.id)) {
        cells[r][c].wordIds.push(p.entry.id);
      }
    }
  }

  // Assign clue numbers to first cells of words
  for (const pw of placedWords) {
    const cell = cells[pw.row][pw.col];
    if (cell.number === undefined || cell.number === 0) {
      cell.number = pw.number;
    }
  }

  return { cells, rows: finalRows, cols: finalCols, placedWords };
}
