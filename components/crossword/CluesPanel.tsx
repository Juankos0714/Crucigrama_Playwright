"use client";

/**
 * CluesPanel – displays Across and Down clue lists.
 * Highlights the active clue and allows clicking to jump to a word.
 */

import React, { useRef, useEffect } from "react";
import { PlacedWord } from "@/lib/crossword-engine";
import { cn } from "@/lib/utils";

interface CluesPanelProps {
  acrossWords: PlacedWord[];
  downWords: PlacedWord[];
  activeWordId: number | null;
  completedWordIds: Set<number>;
  onClueClick: (word: PlacedWord) => void;
}

function ClueList({
  title,
  words,
  activeWordId,
  completedWordIds,
  onClueClick,
}: {
  title: string;
  words: PlacedWord[];
  activeWordId: number | null;
  completedWordIds: Set<number>;
  onClueClick: (word: PlacedWord) => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active clue into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeWordId]);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--clue-section-title)] mb-2 px-1">
        {title}
      </h3>
      <ul className="flex flex-col gap-0.5">
        {words
          .slice()
          .sort((a, b) => a.number - b.number)
          .map((w) => {
            const isActive = w.id === activeWordId;
            const isDone = completedWordIds.has(w.id);
            return (
              <li key={w.id}>
                <button
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onClueClick(w)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-xs leading-relaxed transition-all duration-150",
                    "flex items-start gap-2 group",
                    isActive
                      ? "bg-[var(--clue-active-bg)] text-[var(--clue-active-text)]"
                      : isDone
                      ? "text-[var(--clue-done-text)] hover:bg-[var(--clue-hover-bg)]"
                      : "text-[var(--clue-text)] hover:bg-[var(--clue-hover-bg)] hover:text-[var(--clue-hover-text)]"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 font-mono font-semibold text-[10px] leading-relaxed w-5 text-right",
                      isActive
                        ? "text-[var(--clue-number-active)]"
                        : "text-[var(--clue-number)]"
                    )}
                  >
                    {w.number}.
                  </span>
                  <span className={cn(isDone && "line-through opacity-50")}>
                    {w.clue}
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function CluesPanel({
  acrossWords,
  downWords,
  activeWordId,
  completedWordIds,
  onClueClick,
}: CluesPanelProps) {
  return (
    <aside
      className="flex flex-col h-full overflow-hidden rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-xl"
      aria-label="Crossword clues"
    >
      <div className="px-4 py-3 border-b border-[var(--panel-border)]">
        <h2 className="text-sm font-semibold text-[var(--panel-title)] tracking-wide">
          Pistas
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 scrollbar-thin">
        <ClueList
          title="Horizontal"
          words={acrossWords}
          activeWordId={activeWordId}
          completedWordIds={completedWordIds}
          onClueClick={onClueClick}
        />
        <ClueList
          title="Vertical"
          words={downWords}
          activeWordId={activeWordId}
          completedWordIds={completedWordIds}
          onClueClick={onClueClick}
        />
      </div>
    </aside>
  );
}
