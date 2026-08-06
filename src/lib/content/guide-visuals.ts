import type { PillarId } from "./types";
import {
  GUIDE_VISUALS,
  type GuideVisualDef,
  visualFigureHtml,
} from "./guide-visuals-catalog";

export type GuideVisualContext = {
  pillar: PillarId;
  hub: string;
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  body: string;
  /** Frontmatter diagram id already shown in chrome */
  diagram?: string;
};

/** ~1 in-body visual per 220 words; always at least 1; cap at 5. */
export function visualQuota(wordCount: number): number {
  return Math.max(1, Math.min(5, Math.round(wordCount / 220)));
}

export function countBodyWords(body: string): number {
  return body
    .replace(/^:::[\s\S]*?^:::\s*$/gm, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function countExistingBodyVisuals(body: string): number {
  const diagrams = body.match(/^::: diagram\s+/gim)?.length ?? 0;
  const figures = body.match(/class="cm-visual"/g)?.length ?? 0;
  return diagrams + figures;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function scoreVisual(def: GuideVisualDef, ctx: GuideVisualContext, hay: string): number {
  let score = 0;
  if (def.pillars.includes(ctx.pillar)) score += 4;
  if (def.hubs?.includes(ctx.hub)) score += 6;
  for (const kw of def.keywords) {
    if (hay.includes(kw.toLowerCase())) score += 3;
  }
  // Stable tie-break so the same guide keeps the same set
  score += (hashSeed(ctx.slug + def.id) % 100) / 1000;
  return score;
}

/**
 * Pick contextual visuals for a guide. Prefers hub/keyword matches;
 * always fills the word-count quota from the pillar pool if needed.
 */
export function selectGuideVisuals(ctx: GuideVisualContext): GuideVisualDef[] {
  const words = countBodyWords(ctx.body);
  const existing = countExistingBodyVisuals(ctx.body) + (ctx.diagram ? 1 : 0);
  const needed = Math.max(0, visualQuota(words) - existing);
  if (needed === 0) return [];

  const hay = [
    ctx.slug,
    ctx.title,
    ctx.description,
    ctx.hub,
    ...(ctx.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const exclude = new Set<string>();
  if (ctx.diagram) exclude.add(ctx.diagram);
  for (const m of ctx.body.matchAll(/^::: diagram\s+([a-z0-9-]+)/gim)) {
    exclude.add(m[1]);
  }

  const ranked = GUIDE_VISUALS.filter((v) => !exclude.has(v.id))
    .map((v) => ({ v, score: scoreVisual(v, ctx, hay) }))
    .sort((a, b) => b.score - a.score);

  const picked: GuideVisualDef[] = [];
  const used = new Set<string>();

  for (const { v, score } of ranked) {
    if (picked.length >= needed) break;
    // Require some relevance unless we are still short after first pass
    if (score < 4 && picked.length > 0) continue;
    if (used.has(v.id)) continue;
    picked.push(v);
    used.add(v.id);
  }

  // Fill remaining from same-pillar pool, then universals
  if (picked.length < needed) {
    for (const { v } of ranked) {
      if (picked.length >= needed) break;
      if (used.has(v.id)) continue;
      if (!v.pillars.includes(ctx.pillar) && v.pillars.length < 5) continue;
      picked.push(v);
      used.add(v.id);
    }
  }

  // Absolute fallback: any unused visuals
  if (picked.length < needed) {
    for (const v of GUIDE_VISUALS) {
      if (picked.length >= needed) break;
      if (used.has(v.id) || exclude.has(v.id)) continue;
      picked.push(v);
      used.add(v.id);
    }
  }

  return picked;
}

/**
 * Insert figure HTML between lead and H2 sections so visuals pace with the article.
 * Skips injection when quota already satisfied by authored diagrams.
 */
export function injectGuideVisuals(
  body: string,
  visuals: GuideVisualDef[],
): string {
  if (visuals.length === 0) return body;

  const figures = visuals.map(visualFigureHtml);
  const parts = body.split(/(?=^## )/m);

  if (parts.length === 1) {
    // No H2s — place after first paragraph block
    const paras = body.split(/\n{2,}/);
    if (paras.length <= 1) return `${body}\n\n${figures.join("\n\n")}\n`;
    const out: string[] = [];
    let fi = 0;
    for (let i = 0; i < paras.length; i++) {
      out.push(paras[i]);
      const shouldInsert =
        fi < figures.length &&
        (i === 0 ||
          (i + 1) % Math.max(1, Math.floor(paras.length / (figures.length + 1))) ===
            0);
      if (shouldInsert) {
        out.push(figures[fi++]);
      }
    }
    while (fi < figures.length) out.push(figures[fi++]);
    return out.join("\n\n");
  }

  // parts[0] = lead; parts[1..] = ## sections
  const out: string[] = [];
  let fi = 0;

  // Always place first visual after the lead when present
  out.push(parts[0].trimEnd());
  if (fi < figures.length) {
    out.push("");
    out.push(figures[fi++]);
    out.push("");
  }

  const sections = parts.slice(1);
  const step = Math.max(1, Math.floor(sections.length / Math.max(1, figures.length - fi + 1)));

  for (let i = 0; i < sections.length; i++) {
    out.push(sections[i].trimEnd());
    if (fi < figures.length && (i + 1) % step === 0) {
      out.push("");
      out.push(figures[fi++]);
      out.push("");
    }
  }

  while (fi < figures.length) {
    out.push("");
    out.push(figures[fi++]);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function applyGuideVisuals(ctx: GuideVisualContext): string {
  const visuals = selectGuideVisuals(ctx);
  return injectGuideVisuals(ctx.body, visuals);
}
