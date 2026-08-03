import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Article, PillarId } from "./types";

const GUIDES_ROOT = path.join(process.cwd(), "content", "guides");

export type LoadedArticle = Article & {
  readingMinutes: number;
  headings: { id: string; text: string }[];
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(body: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  for (const line of body.split("\n")) {
    const match = /^##\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[1].trim();
      headings.push({ id: slugifyHeading(text), text });
    }
  }
  return headings;
}

function loadAllFromDisk(): LoadedArticle[] {
  if (!fs.existsSync(GUIDES_ROOT)) return [];

  const articles: LoadedArticle[] = [];

  for (const pillar of fs.readdirSync(GUIDES_ROOT)) {
    const pillarDir = path.join(GUIDES_ROOT, pillar);
    if (!fs.statSync(pillarDir).isDirectory()) continue;

    for (const hub of fs.readdirSync(pillarDir)) {
      const hubDir = path.join(pillarDir, hub);
      if (!fs.statSync(hubDir).isDirectory()) continue;

      for (const file of fs.readdirSync(hubDir)) {
        if (!file.endsWith(".md")) continue;
        const full = path.join(hubDir, file);
        const raw = fs.readFileSync(full, "utf8");
        const { data, content } = matter(raw);
        const slug = (data.slug as string) || file.replace(/\.md$/, "");
        const body = content.trim();
        const stats = readingTime(body);

        articles.push({
          title: String(data.title ?? slug),
          description: String(data.description ?? ""),
          pillar: (data.pillar as PillarId) || (pillar as PillarId),
          hub: String(data.hub ?? hub),
          slug,
          updated: String(data.updated ?? "2026-08-03"),
          relatedTools: Array.isArray(data.relatedTools)
            ? data.relatedTools.map(String)
            : undefined,
          relatedGuides: Array.isArray(data.relatedGuides)
            ? data.relatedGuides.map(String)
            : undefined,
          tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
          body,
          readingMinutes: Math.max(1, Math.ceil(stats.minutes)),
          headings: extractHeadings(body),
        });
      }
    }
  }

  return articles.sort((a, b) => a.title.localeCompare(b.title));
}

let cache: LoadedArticle[] | null = null;

export function getAllArticles(): LoadedArticle[] {
  if (!cache) cache = loadAllFromDisk();
  return cache;
}

export function getArticle(
  pillar: string,
  hub: string,
  slug: string,
): LoadedArticle | undefined {
  return getAllArticles().find(
    (article) =>
      article.pillar === pillar && article.hub === hub && article.slug === slug,
  );
}

export function getArticlesForHub(pillar: string, hub: string) {
  return getAllArticles().filter(
    (article) => article.pillar === pillar && article.hub === hub,
  );
}

export function getArticlesForPillar(pillar: string) {
  return getAllArticles().filter((article) => article.pillar === pillar);
}

export function searchArticles(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllArticles().filter((article) => {
    const hay = [
      article.title,
      article.description,
      article.hub,
      article.pillar,
      article.body,
      ...(article.tags ?? []),
      ...(article.relatedTools ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function resolveRelatedGuides(article: LoadedArticle): LoadedArticle[] {
  if (!article.relatedGuides?.length) return [];
  const all = getAllArticles();
  return article.relatedGuides
    .map((ref) => {
      const parts = ref.split("/");
      if (parts.length === 3) {
        return all.find(
          (a) =>
            a.pillar === parts[0] && a.hub === parts[1] && a.slug === parts[2],
        );
      }
      return all.find((a) => a.slug === ref && a.pillar === article.pillar);
    })
    .filter((a): a is LoadedArticle => Boolean(a));
}
