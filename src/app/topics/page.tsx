import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content/articles";
import { getHubsForPillar, pillars } from "@/lib/content/taxonomy";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse ClearMoney guidance by topic.",
};

export default function TopicsPage() {
  const all = getAllArticles();
  const totalGuides = all.length;

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Topics</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Seven pillars and {totalGuides} guides covering everyday money
        decisions—from budgets to scams—aligned with the full MoneySmart topic
        map (original ClearMoney copy).
      </p>
      <div className="mt-12 space-y-12">
        {pillars.map((pillar) => {
          const hubs = getHubsForPillar(pillar.id);
          const guideCount = all.filter((a) => a.pillar === pillar.id).length;
          return (
            <section key={pillar.id}>
              <h2 className="font-display text-2xl tracking-tight">
                <Link href={`/topics/${pillar.id}`} className="hover:text-accent">
                  {pillar.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {pillar.description} · {guideCount} guides
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hubs.map((hub) => (
                  <li key={hub.id}>
                    <Link
                      href={`/topics/${pillar.id}/${hub.id}`}
                      className="text-sm text-foreground hover:text-accent"
                    >
                      {hub.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
