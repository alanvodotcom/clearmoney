import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesForHub } from "@/lib/content/articles";
import {
  getHub,
  getPillar,
  getToolsForHub,
  hubs,
} from "@/lib/content/taxonomy";

type Props = { params: Promise<{ pillar: string; hub: string }> };

export function generateStaticParams() {
  return hubs.map((h) => ({ pillar: h.pillar, hub: h.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar, hub } = await params;
  const hubMeta = getHub(pillar, hub);
  if (!hubMeta) return { title: "Hub" };
  return { title: hubMeta.title, description: hubMeta.description };
}

export default async function HubPage({ params }: Props) {
  const { pillar: pillarId, hub: hubId } = await params;
  const pillar = getPillar(pillarId);
  const hub = getHub(pillarId, hubId);
  if (!pillar || !hub) notFound();

  const articles = getArticlesForHub(pillarId, hubId);
  const relatedTools = getToolsForHub(hubId);

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <p className="text-sm text-muted">
        <Link href="/topics">Topics</Link>
        {" / "}
        <Link href={`/topics/${pillarId}`}>{pillar.title}</Link>
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">{hub.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{hub.description}</p>

      {relatedTools.length > 0 ? (
        <section className="mt-8 rounded-[var(--radius)] bg-accent-soft/50 p-4">
          <p className="text-sm font-semibold">Try a tool</p>
          <ul className="mt-2 flex flex-wrap gap-4 text-sm">
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

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Guides
        </h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-muted">More guides coming soon for this hub.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {articles.map((article) => (
              <li key={article.slug} className="border-t border-border pt-4">
                <Link
                  href={`/topics/${pillarId}/${hubId}/${article.slug}`}
                  className="block no-underline"
                >
                  <span className="font-semibold hover:text-accent">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {article.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
