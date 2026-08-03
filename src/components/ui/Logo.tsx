import Link from "next/link";

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius)] focus:bg-surface focus:px-4 focus:py-2 focus:shadow"
    >
      Skip to main content
    </a>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display text-xl font-medium tracking-tight text-foreground no-underline ${className}`}
    >
      Clear<span className="text-accent">Money</span>
    </Link>
  );
}
