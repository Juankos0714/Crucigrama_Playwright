"use client";

/**
 * Header – top bar with title and subtitle.
 */

import React from "react";

export default function Header() {
  return (
    <header className="border-b border-[var(--header-border)] bg-[var(--header-bg)] px-6 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--brand-bg)] border border-[var(--brand-border)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4 text-[var(--brand-icon)]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[var(--header-title)] text-balance leading-tight">
              Crucigrama de Automatización con Playwright
            </h1>
            <p className="text-[11px] text-[var(--header-subtitle)] font-mono mt-0.5">
              Testing · CI/CD · Browsers · Frameworks
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--badge-border)] bg-[var(--badge-bg)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--badge-dot)] animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--badge-text)] tracking-wide">
            Interactive
          </span>
        </div>
      </div>
    </header>
  );
}
