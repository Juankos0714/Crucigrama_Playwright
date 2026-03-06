"use client";

/**
 * Controls – action buttons below the crossword board.
 */

import React from "react";
import { cn } from "@/lib/utils";

interface ControlsProps {
  onVerify: () => void;
  onReset: () => void;
  isComplete: boolean;
}

function CtrlButton({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger" | "ghost";
}) {
  const variants: Record<string, string> = {
    default:
      "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] border border-[var(--btn-primary-border)]",
    danger:
      "bg-transparent text-[var(--btn-danger-text)] hover:bg-[var(--btn-danger-hover-bg)] border border-[var(--btn-danger-border)]",
    ghost:
      "bg-transparent text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-hover-bg)] border border-[var(--btn-ghost-border)]",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 active:scale-95",
        variants[variant]
      )}
    >
      {children}
    </button>
  );
}

export default function Controls({ onVerify, onReset, isComplete }: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center">
      <CtrlButton onClick={onVerify} variant="default">
        Verificar respuestas
      </CtrlButton>
      <CtrlButton onClick={onReset} variant="danger">
        Reiniciar
      </CtrlButton>
    </div>
  );
}
