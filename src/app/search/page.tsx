import type { Metadata } from "next";
import { getAllArticles } from "@/lib/content/articles";
import { tools } from "@/lib/content/taxonomy";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search ClearMoney guides and tools.",
};

export default function SearchPage() {
  const articles = getAllArticles().map((a) => ({
    title: a.title,
    description: a.description,
    pillar: a.pillar,
    hub: a.hub,
    slug: a.slug,
    tags: a.tags,
    relatedTools: a.relatedTools,
    searchText: [
      a.title,
      a.description,
      a.hub,
      a.pillar,
      ...(a.tags ?? []),
      ...(a.relatedTools ?? []),
      a.body.slice(0, 800),
    ]
      .join(" ")
      .toLowerCase(),
  }));

  const toolItems = tools.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    href: t.href,
  }));

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Search</h1>
      <SearchClient articles={articles} tools={toolItems} />
    </main>
  );
}
