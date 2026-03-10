"use client";

/**
 * App – root page composing all crossword components.
 */

import Header from "@/components/crossword/Header";
import CrosswordBoard from "@/components/crossword/CrosswordBoard";
import CluesPanel from "@/components/crossword/CluesPanel";
import Controls from "@/components/crossword/Controls";
import ScoreBoard from "@/components/crossword/ScoreBoard";
import Footer from "@/components/crossword/Footer";
import { useCrossword } from "@/hooks/use-crossword";

export default function CrosswordApp() {
  const {
    grid,
    userValues,
    cellStates,
    selectedCell,
    activeWordCells,
    activeWordId,
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
    handleReset,
  } = useCrossword();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden relative">
        {/* ── Clues panel ── */}
        <section className="w-full lg:w-72 xl:w-80 lg:h-[calc(100vh-57px)] order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-[var(--panel-border)] bg-[var(--panel-bg)] flex flex-col">
          <CluesPanel
            acrossWords={acrossWords}
            downWords={downWords}
            activeWordId={activeWordId}
            completedWordIds={completedWordIds}
            onClueClick={handleClueClick}
          />
        </section>

        {/* ── Board + controls ── */}
        <section className="flex-1 flex flex-col items-center justify-start gap-4 p-2 sm:p-6 overflow-auto order-1 lg:order-2 w-full">
          <div className="w-full flex flex-col items-center gap-4 max-w-full">
            <CrosswordBoard
              grid={grid}
              userValues={userValues}
              cellStates={cellStates}
              selectedCell={selectedCell}
              activeWordCells={activeWordCells}
              onCellInput={handleCellInput}
              onCellFocus={handleCellFocus}
              onCellClick={handleCellClick}
              onCellKeyDown={handleCellKeyDown}
            />

            <div className="w-full max-w-md flex flex-col gap-4">
              <ScoreBoard
                correct={correctCount}
                total={totalWords}
                isComplete={isComplete}
              />

              <Controls
                onVerify={handleVerify}
                onReset={handleReset}
                isComplete={isComplete}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
