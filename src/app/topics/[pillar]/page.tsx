import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesForPillar } from "@/lib/content/articles";
import {
  getHubsForPillar,
  getPillar,
  pillars,
  tools,
} from "@/lib/content/taxonomy";

type Props = { params: Promise<{ pillar: string }> };

export function generateStaticParams() {
  return pillars.map((p) => ({ pillar: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar: id } = await params;
  const pillar = getPillar(id);
  if (!pillar) return { title: "Topic" };
  return { title: pillar.title, description: pillar.description };
}

export default async function PillarPage({ params }: Props) {
  const { pillar: id } = await params;
  const pillar = getPillar(id);
  if (!pillar) notFound();

  const hubs = getHubsForPillar(id);
  const articles = getArticlesForPillar(id);
  const relatedTools = tools.filter((t) => t.pillar === id);

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <p className="text-sm text-muted">
        <Link href="/topics">Topics</Link>
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">{pillar.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{pillar.description}</p>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Hubs
        </h2>
        <ul className="mt-4 grid gap-6 sm:grid-cols-2">
          {hubs.map((hub) => (
            <li key={hub.id}>
              <Link
                href={`/topics/${id}/${hub.id}`}
                className="block no-underline"
              >
                <span className="font-semibold hover:text-accent">{hub.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {hub.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {relatedTools.length > 0 ? (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Related tools
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {relatedTools.map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href} className="text-accent hover:underline">
                  {tool.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 border-t border-border pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Guides ({articles.length})
        </h2>
        <ul className="mt-4 space-y-3">
          {articles.map((article) => (
            <li key={`${article.hub}/${article.slug}`}>
              <Link
                href={`/topics/${id}/${article.hub}/${article.slug}`}
                className="font-medium hover:text-accent"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
