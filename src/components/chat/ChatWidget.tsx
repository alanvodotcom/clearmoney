"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      "button, textarea, input, a",
    );
    firstFocusable?.focus();
  }, [open]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="ClearMoney chat"
          className="pointer-events-auto flex h-[min(34rem,calc(100dvh-6.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius)] border border-border-strong bg-background shadow-[0_12px_40px_rgba(20,32,28,0.18)]"
        >
          <ChatPanel onRequestClose={() => setOpen(false)} />
        </div>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        className="pointer-events-auto min-h-12 rounded-full border border-border-strong bg-accent px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(11,110,110,0.35)] hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close chat" : "Ask ClearMoney"}
      </button>
    </div>
  );
}
