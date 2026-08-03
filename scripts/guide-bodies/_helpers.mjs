/**
 * Shared helpers for ClearMoney guide bodies.
 */
export const UPDATED = "2026-08-03";

export const URGENT_HUBS = new Set([
  "managing-debt",
  "financial-scams",
  "check-report",
  "online-safety",
  "natural-disasters",
]);

export const URGENT_SLUG_RE =
  /urgent|hardship|scam|abuse|debt-collector|bankruptcy|repossess|payday|identity-theft|fraud|financial-abuse/;

export function yamlList(items) {
  if (!items?.length) return "[]";
  return `\n${items.map((i) => `  - ${i}`).join("\n")}`;
}

export function yamlQuote(str) {
  return JSON.stringify(String(str));
}

export function frontmatter(guide, pillar, hub, relatedGuides) {
  const tags = guide.tags?.length ? guide.tags : [hub.replace(/-/g, " ")];
  const tools = guide.tools?.length ? guide.tools : undefined;
  return `---
title: ${yamlQuote(guide.title)}
description: ${yamlQuote(guide.description || guide.title)}
pillar: ${pillar}
hub: ${hub}
slug: ${guide.slug}
updated: "${UPDATED}"
tags: ${yamlList(tags)}
${tools ? `relatedTools: ${yamlList(tools)}\n` : ""}relatedGuides: ${yamlList(relatedGuides)}
---`;
}

export function toolLabel(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function toolLinks(guide) {
  if (!guide.tools?.length) return [];
  return guide.tools.map(
    (id) => `[${toolLabel(id)}](/tools/${id})`,
  );
}

export function guideLink(pillar, hub, slug, title) {
  return `[${title}](/topics/${pillar}/${hub}/${slug})`;
}

export function needsUrgent(hub, slug) {
  return URGENT_HUBS.has(hub) || URGENT_SLUG_RE.test(slug);
}

export function urgentBlurb(hub, slug) {
  if (!needsUrgent(hub, slug)) return "";
  return ` If money stress is affecting essentials this week, start at [Urgent help](/urgent).`;
}

export function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function pick(arr, slug, salt = 0) {
  return arr[(hashSlug(slug) + salt) % arr.length];
}

export function siblingPaths(pillar, hub, guides, excludeSlug) {
  return guides
    .filter((g) => g.slug !== excludeSlug)
    .map((g) => `${pillar}/${hub}/${g.slug}`);
}

export function nextStepsSection(bullets) {
  return `## What to do next\n\n${bullets.map((b) => `- ${b}`).join("\n")}\n`;
}
