import "server-only";
import Fuse from "fuse.js";
import { getAllArticles, type LoadedArticle } from "@/lib/content/articles";
import { tools } from "@/lib/content/taxonomy";
import type { ToolMeta } from "@/lib/content/types";

export type GuideChunk = {
  id: string;
  title: string;
  description: string;
  pillar: string;
  hub: string;
  slug: string;
  tags: string[];
  relatedTools: string[];
  href: string;
  heading: string;
  text: string;
};

export type RetrievedContext = {
  chunks: GuideChunk[];
  matchingTools: ToolMeta[];
};

const TOP_CHUNKS = 8;
const TOP_TOOLS = 4;

let chunkIndex: GuideChunk[] | null = null;
let fuse: Fuse<GuideChunk> | null = null;
let toolFuse: Fuse<ToolMeta> | null = null;

function articleHref(article: LoadedArticle): string {
  return `/topics/${article.pillar}/${article.hub}/${article.slug}`;
}

function stripShortcodes(body: string): string {
  return body
    .replace(/:::[\s\S]*?:::/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a guide into lead + H2 section chunks for retrieval. */
export function chunkArticle(article: LoadedArticle): GuideChunk[] {
  const href = articleHref(article);
  const tags = article.tags ?? [];
  const relatedTools = article.relatedTools ?? [];
  const base = {
    title: article.title,
    description: article.description,
    pillar: article.pillar,
    hub: article.hub,
    slug: article.slug,
    tags,
    relatedTools,
    href,
  };

  const lines = article.body.split("\n");
  const chunks: GuideChunk[] = [];
  let currentHeading = "Overview";
  let buffer: string[] = [];
  let sectionIndex = 0;

  const flush = () => {
    const raw = buffer.join("\n").trim();
    if (!raw) return;
    const text = stripShortcodes(raw);
    if (text.length < 40) return;
    chunks.push({
      ...base,
      id: `${article.pillar}/${article.hub}/${article.slug}#${sectionIndex}`,
      heading: currentHeading,
      text: text.slice(0, 1200),
    });
    sectionIndex += 1;
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line.trim());
    if (h2) {
      flush();
      currentHeading = h2[1].trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }
  flush();

  if (chunks.length === 0) {
    const text = stripShortcodes(article.body).slice(0, 1200);
    if (text) {
      chunks.push({
        ...base,
        id: `${article.pillar}/${article.hub}/${article.slug}#0`,
        heading: "Overview",
        text,
      });
    }
  }

  return chunks;
}

function ensureIndex() {
  if (chunkIndex && fuse && toolFuse) return;

  chunkIndex = getAllArticles().flatMap(chunkArticle);
  fuse = new Fuse(chunkIndex, {
    keys: [
      { name: "title", weight: 2.5 },
      { name: "heading", weight: 2 },
      { name: "description", weight: 1.5 },
      { name: "tags", weight: 1.5 },
      { name: "text", weight: 1 },
      { name: "relatedTools", weight: 0.8 },
    ],
    threshold: 0.42,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  toolFuse = new Fuse(tools, {
    keys: [
      { name: "title", weight: 2 },
      { name: "description", weight: 1.5 },
      { name: "id", weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  });
}

const NUMERIC_HINT =
  /\b(how much|calculate|estimat|repay|interest|tax|gst|hecs|mortgage|loan|super|budget|save|compound|fee|inflation|borrow|afford)\b/i;

/**
 * Retrieve top guide chunks and related tools for a user query.
 */
export function retrieveContext(query: string): RetrievedContext {
  const q = query.trim();
  if (!q) return { chunks: [], matchingTools: [] };

  ensureIndex();

  const hits = fuse!.search(q, { limit: TOP_CHUNKS * 2 });
  const seen = new Set<string>();
  const chunks: GuideChunk[] = [];

  for (const hit of hits) {
    const key = `${hit.item.href}::${hit.item.heading}`;
    if (seen.has(key)) continue;
    seen.add(key);
    chunks.push(hit.item);
    if (chunks.length >= TOP_CHUNKS) break;
  }

  let matchingTools: ToolMeta[] = [];
  if (NUMERIC_HINT.test(q) || chunks.some((c) => c.relatedTools.length > 0)) {
    const toolHits = toolFuse!.search(q, { limit: TOP_TOOLS });
    matchingTools = toolHits.map((h) => h.item);

    const relatedIds = new Set(chunks.flatMap((c) => c.relatedTools));
    for (const id of relatedIds) {
      const meta = tools.find((t) => t.id === id);
      if (meta && !matchingTools.some((t) => t.id === meta.id)) {
        matchingTools.push(meta);
      }
      if (matchingTools.length >= TOP_TOOLS) break;
    }
    matchingTools = matchingTools.slice(0, TOP_TOOLS);
  }

  return { chunks, matchingTools };
}

/** Format retrieved context for injection into the system prompt. */
export function formatRetrievedContext(ctx: RetrievedContext): string {
  if (!ctx.chunks.length && !ctx.matchingTools.length) {
    return "No strongly matching guides found. Answer carefully from general ClearMoney principles and ask clarifying questions. Prefer linking to /topics or /tools when unsure.";
  }

  const guideBlock = ctx.chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title} — ${c.heading}\nURL: ${c.href}\n${c.text}`,
    )
    .join("\n\n");

  const toolBlock =
    ctx.matchingTools.length > 0
      ? ctx.matchingTools
          .map((t) => `- ${t.title} (${t.href}): ${t.description}`)
          .join("\n")
      : "(none)";

  return `## Retrieved guides\n\n${guideBlock}\n\n## Related tools\n${toolBlock}`;
}

/** Test helper: reset cached index (e.g. after mock content). */
export function resetRetrieveCache() {
  chunkIndex = null;
  fuse = null;
  toolFuse = null;
}
