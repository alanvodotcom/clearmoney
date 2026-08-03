"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { pillars } from "@/lib/content/taxonomy";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--max)] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav
          className="hidden items-center gap-6 text-sm md:flex"
          aria-label="Primary"
        >
          <Link href="/topics" className="text-muted hover:text-foreground">
            Topics
          </Link>
          <Link href="/tools" className="text-muted hover:text-foreground">
            Tools
          </Link>
          <Link
            href="/urgent"
            className="font-medium text-urgent hover:underline"
          >
            Urgent help
          </Link>
          <Link href="/search" className="text-muted hover:text-foreground">
            Search
          </Link>
        </nav>
        <button
          ref={buttonRef}
          type="button"
          className="min-h-11 min-w-11 rounded-[var(--radius)] border border-border-strong px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <div
          id={menuId}
          ref={panelRef}
          className="border-t border-border bg-surface md:hidden"
        >
          <nav
            className="mx-auto flex max-w-[var(--max)] flex-col gap-1 px-4 py-4 text-sm"
            aria-label="Mobile"
          >
            <Link
              href="/topics"
              className="min-h-11 py-2"
              onClick={() => setOpen(false)}
            >
              All topics
            </Link>
            <Link
              href="/tools"
              className="min-h-11 py-2"
              onClick={() => setOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="/urgent"
              className="min-h-11 py-2 font-medium text-urgent"
              onClick={() => setOpen(false)}
            >
              Urgent help
            </Link>
            <Link
              href="/search"
              className="min-h-11 py-2"
              onClick={() => setOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/about"
              className="min-h-11 py-2"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Topics
              </p>
              {pillars.map((p) => (
                <Link
                  key={p.id}
                  href={`/topics/${p.id}`}
                  className="block min-h-11 py-2 text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
