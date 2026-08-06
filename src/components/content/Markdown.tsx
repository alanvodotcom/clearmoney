import { marked, type Tokens } from "marked";
import { getDiagramHtml } from "@/components/content/diagrams";
import { applyGuideVisuals } from "@/lib/content/guide-visuals";
import type { PillarId } from "@/lib/content/types";

marked.setOptions({ gfm: true, breaks: false });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export type RelatedToolLink = {
  id: string;
  title: string;
  href: string;
};

export type GuideVisualMeta = {
  pillar: PillarId;
  hub: string;
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  diagram?: string;
};

const CALLOUT_LABELS: Record<string, string> = {
  tip: "Tip",
  warning: "Warning",
  checklist: "Checklist",
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function preprocessShortcodes(
  content: string,
  relatedTools: RelatedToolLink[],
): string {
  let text = content;

  text = text.replace(
    /^::: diagram\s+([a-z0-9-]+)\s*:::\s*$/gim,
    (_m, id: string) => getDiagramHtml(id.trim()),
  );

  text = text.replace(
    /^::: tool\s+relatedTools\[(\d+)\]\s*\n:::\s*$/gim,
    (_m, idxStr: string) => {
      const tool = relatedTools[Number(idxStr)];
      if (!tool) {
        return `<aside class="cm-callout cm-callout--tip" role="note"><p class="cm-callout__label">Tool</p><p>Related tool unavailable.</p></aside>`;
      }
      return `<aside class="cm-callout cm-callout--tool" role="note"><p class="cm-callout__label">Try a tool</p><p><a href="${escapeHtml(tool.href)}">${escapeHtml(tool.title)}</a></p></aside>`;
    },
  );

  text = text.replace(
    /^::: (tip|warning|checklist)\s*\n([\s\S]*?)^:::\s*$/gim,
    (_m, type: string, body: string) => {
      const label = CALLOUT_LABELS[type] ?? type;
      const inner = marked.parse(body.trim()) as string;
      return `<aside class="cm-callout cm-callout--${type}" role="note"><p class="cm-callout__label">${label}</p>${inner}</aside>\n`;
    },
  );

  return text;
}

export function Markdown({
  content,
  relatedTools = [],
  guide,
}: {
  content: string;
  relatedTools?: RelatedToolLink[];
  /** When set, inject contextual SVG visuals proportional to word count */
  guide?: GuideVisualMeta;
}) {
  const usedIds = new Map<string, number>();
  const withVisuals = guide
    ? applyGuideVisuals({ ...guide, body: content })
    : content;
  const prepared = preprocessShortcodes(withVisuals, relatedTools);

  const renderer = new marked.Renderer();
  renderer.heading = function ({ text, depth }: Tokens.Heading) {
    const plain = text.replace(/<[^>]+>/g, "");
    if (depth === 2) {
      const base = slugify(plain) || "section";
      const count = usedIds.get(base) ?? 0;
      usedIds.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return `<h2 id="${id}">${text}</h2>\n`;
    }
    return `<h${depth}>${text}</h${depth}>\n`;
  };

  const html = marked.parse(prepared, { renderer }) as string;
  return (
    <div className="prose-cm" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
