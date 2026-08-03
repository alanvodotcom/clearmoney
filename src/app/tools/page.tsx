import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/content/taxonomy";

export const metadata: Metadata = {
  title: "Tools",
  description: "All ClearMoney calculators in one place.",
};

export default function ToolsPage() {
  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Tools</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {tools.length} calculators aligned with MoneySmart-style features.
        Estimates only—not personal advice. The budget planner includes an{" "}
        <strong className="font-semibold text-foreground">Excel download</strong>{" "}
        for offline use (the only MoneySmart tool that ships a spreadsheet).
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id} className="border-t border-border pt-4">
            <Link href={tool.href} className="block no-underline">
              <span className="font-semibold hover:text-accent">
                {tool.title}
                {tool.id === "budget-planner" ? (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Excel
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {tool.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
