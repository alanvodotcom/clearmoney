import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { pillars } from "@/lib/content/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[var(--max)] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Clear, calm guidance for everyday money decisions. General
            information only—not personal financial advice.
          </p>
        </div>
        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="text-sm font-semibold">
            Explore
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/topics">Topics</Link>
            </li>
            <li>
              <Link href="/tools">Tools</Link>
            </li>
            <li>
              <Link href="/urgent">Urgent help</Link>
            </li>
            <li>
              <Link href="/glossary">Glossary</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-topics">
          <h2 id="footer-topics" className="text-sm font-semibold">
            Topics
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {pillars.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link href={`/topics/${p.id}`}>{p.shortLabel}</Link>
              </li>
            ))}
            <li>
              <Link href="/topics">All topics</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[var(--max)] px-4 py-4 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} ClearMoney. Portfolio project inspired by
          public financial education themes. Not affiliated with ASIC or the
          Australian Government.
        </p>
      </div>
    </footer>
  );
}
