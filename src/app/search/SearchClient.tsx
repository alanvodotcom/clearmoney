"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SearchItem = {
  title: string;
  description: string;
  pillar: string;
  hub: string;
  slug: string;
  tags?: string[];
  relatedTools?: string[];
  searchText: string;
};

export type SearchTool = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export function SearchClient({
  articles,
  tools,
}: {
  articles: SearchItem[];
  tools: SearchTool[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { articles: [] as SearchItem[], tools: [] as SearchTool[] };
    return {
      articles: articles.filter((a) => a.searchText.includes(q)),
      tools: tools.filter((t) =>
        [t.title, t.description].join(" ").toLowerCase().includes(q),
      ),
    };
  }, [query, articles, tools]);

  const hasQuery = Boolean(query.trim());
  const shownGuides = results.articles.slice(0, 40);
  const status = hasQuery
    ? results.articles.length === 0 && results.tools.length === 0
      ? `No results for “${query.trim()}”.`
      : `${results.tools.length} tools and ${results.articles.length} guides found.`
    : "";

  return (
    <>
      <label className="mt-6 block max-w-xl">
        <span className="sr-only">Search ClearMoney</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try budget, mortgage, scam…"
          className="cm-control w-full rounded-[var(--radius)] border bg-surface px-4 py-3"
        />
      </label>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </div>

      {!hasQuery ? (
        <p className="mt-8 text-muted">Type to search guides and tools.</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <p className="col-span-full text-sm text-muted" role="status">
            {status}
          </p>
          <section aria-labelledby="search-tools-heading">
            <h2
              id="search-tools-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted"
            >
              Tools ({results.tools.length})
            </h2>
            {results.tools.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No matching tools.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {results.tools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      className="font-medium hover:text-accent"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="search-guides-heading">
            <h2
              id="search-guides-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted"
            >
              Guides ({results.articles.length})
            </h2>
            {shownGuides.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No matching guides.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {shownGuides.map((article) => (
                  <li key={`${article.hub}-${article.slug}`}>
                    <Link
                      href={`/topics/${article.pillar}/${article.hub}/${article.slug}`}
                      className="font-medium hover:text-accent"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-muted">{article.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
