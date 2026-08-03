import { marked, type Tokens } from "marked";

marked.setOptions({ gfm: true, breaks: false });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function Markdown({ content }: { content: string }) {
  const usedIds = new Map<string, number>();

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

  const html = marked.parse(content, { renderer }) as string;
  return (
    <div className="prose-cm" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
