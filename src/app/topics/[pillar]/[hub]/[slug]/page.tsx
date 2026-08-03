import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/Markdown";
import { Disclaimer } from "@/components/ui/Disclaimer";
import {
  getAllArticles,
  getArticle,
  resolveRelatedGuides,
} from "@/lib/content/articles";
import { getHub, getPillar, getTool } from "@/lib/content/taxonomy";

type Props = {
  params: Promise<{ pillar: string; hub: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllArticles().map((article) => ({
    pillar: article.pillar,
    hub: article.hub,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar, hub, slug } = await params;
  const article = getArticle(pillar, hub, slug);
  if (!article) return { title: "Guide" };
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({ params }: Props) {
  const { pillar: pillarId, hub: hubId, slug } = await params;
  const article = getArticle(pillarId, hubId, slug);
  const pillar = getPillar(pillarId);
  const hub = getHub(pillarId, hubId);
  if (!article || !pillar || !hub) notFound();

  const relatedTools = (article.relatedTools ?? [])
    .map((id) => getTool(id))
    .filter(Boolean);
  const relatedGuides = resolveRelatedGuides(article);

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/topics">Topics</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/topics/${pillarId}`}>{pillar.title}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/topics/${pillarId}/${hubId}`}>{hub.title}</Link>
          </li>
        </ol>
      </nav>
      <article className="mt-4 max-w-3xl">
        <h1 className="font-display text-4xl tracking-tight">{article.title}</h1>
        <p className="mt-3 text-lg text-muted">{article.description}</p>
        <p className="mt-2 text-xs text-muted">
          Updated {article.updated} · {article.readingMinutes} min read
        </p>

        {relatedTools.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {relatedTools.map((tool) =>
              tool ? (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="rounded-[var(--radius)] bg-accent-soft px-3 py-1.5 font-medium text-accent no-underline"
                >
                  {tool.title}
                </Link>
              ) : null,
            )}
          </div>
        ) : null}

        {article.headings.length > 1 ? (
          <nav
            aria-label="On this page"
            className="mt-8 rounded-[var(--radius)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              On this page
            </p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
              {article.headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="text-accent hover:underline">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-10">
          <Markdown content={article.body} />
        </div>

        {relatedGuides.length > 0 ? (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-2xl tracking-tight">Related guides</h2>
            <ul className="mt-4 space-y-3">
              {relatedGuides.map((guide) => (
                <li key={`${guide.hub}-${guide.slug}`}>
                  <Link
                    href={`/topics/${guide.pillar}/${guide.hub}/${guide.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {guide.title}
                  </Link>
                  <p className="text-sm text-muted">{guide.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-12">
          <Disclaimer />
        </div>
      </article>
    </main>
  );
}
