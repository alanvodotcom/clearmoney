"use client";

import { marked, type Tokens } from "marked";
import { useMemo } from "react";

marked.setOptions({ gfm: true, breaks: true });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderChatMarkdown(content: string): string {
  const renderer = new marked.Renderer();

  // Do not allow raw HTML from the model into the DOM.
  renderer.html = ({ text }: Tokens.HTML) => escapeHtml(text);

  renderer.link = ({ href, title, text }: Tokens.Link) => {
    const safeHref = escapeHtml(href || "");
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    const isExternal = /^https?:\/\//i.test(href || "");
    const rel = isExternal ? ' rel="noopener noreferrer" target="_blank"' : "";
    return `<a href="${safeHref}"${titleAttr}${rel}>${text}</a>`;
  };

  return marked.parse(content, { renderer }) as string;
}

/** Compact GFM rendering for assistant chat bubbles. */
export function ChatMarkdown({ content }: { content: string }) {
  const html = useMemo(() => renderChatMarkdown(content), [content]);

  return (
    <div
      className="prose-cm prose-cm--chat"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
