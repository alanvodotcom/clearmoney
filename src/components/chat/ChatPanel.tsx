"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { ChatMarkdown } from "./ChatMarkdown";

const STARTERS = [
  "How do I start a simple budget?",
  "Estimate take-home pay on $90,000",
  "I think I've been scammed — what should I do?",
] as const;

function formatToolOutput(output: unknown): {
  summary: string;
  href?: string;
} {
  if (!output || typeof output !== "object") {
    return { summary: String(output ?? "") };
  }
  const obj = output as Record<string, unknown>;
  const href = typeof obj.toolHref === "string" ? obj.toolHref : undefined;
  const { toolHref: _h, estimatesOnly: _e, ...rest } = obj;
  const entries = Object.entries(rest)
    .filter(([, v]) => v == null || typeof v !== "object")
    .slice(0, 6)
    .map(([k, v]) => {
      if (typeof v === "number") {
        const formatted =
          Math.abs(v) >= 100
            ? v.toLocaleString("en-AU", {
                maximumFractionDigits: 0,
              })
            : v.toLocaleString("en-AU", { maximumFractionDigits: 2 });
        return `${k}: ${formatted}`;
      }
      return `${k}: ${String(v)}`;
    });
  return { summary: entries.join(" · ") || "Calculation complete", href };
}

function MessageParts({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        if (part.type === "text") {
          return <ChatMarkdown key={key} content={part.text} />;
        }

        if (isToolUIPart(part)) {
          const state = "state" in part ? part.state : undefined;
          const output =
            state === "output-available" && "output" in part
              ? part.output
              : undefined;
          const formatted = output ? formatToolOutput(output) : null;
          const toolName =
            "toolName" in part && typeof part.toolName === "string"
              ? part.toolName
              : part.type.replace(/^tool-/, "");

          return (
            <div
              key={key}
              className="mt-2 rounded-[var(--radius)] border border-border bg-accent-soft/50 px-3 py-2 text-xs text-foreground"
            >
              <p className="font-medium text-accent">
                {state === "output-available" || state === "output-error"
                  ? "Calculator result"
                  : `Running ${toolName}…`}
              </p>
              {formatted ? (
                <>
                  <p className="mt-1 text-muted">{formatted.summary}</p>
                  {formatted.href ? (
                    <Link
                      href={formatted.href}
                      className="mt-1 inline-block font-medium text-accent underline-offset-2 hover:underline"
                    >
                      Open full tool
                    </Link>
                  ) : null}
                </>
              ) : null}
              {state === "output-error" && "errorText" in part ? (
                <p className="mt-1 text-urgent">{String(part.errorText)}</p>
              ) : null}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

type ChatPanelProps = {
  onRequestClose: () => void;
};

export function ChatPanel({ onRequestClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, stop, setMessages, clearError } =
    useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      onError: (err) => {
        console.error("[chat]", err);
      },
    });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-display text-lg text-foreground">ClearMoney chat</p>
          <p className="text-xs text-muted">
            Guides + calculators. General information only.
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestClose}
          className="min-h-11 rounded-[var(--radius)] border border-border-strong px-3 text-sm text-foreground hover:bg-accent-soft"
          aria-label="Close chat"
        >
          Close
        </button>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Ask about budgeting, borrowing, super, scams, or run a quick
              estimate. For debt stress or scams, start at{" "}
              <Link href="/urgent" className="text-urgent underline-offset-2 hover:underline">
                Urgent help
              </Link>
              .
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => submitText(starter)}
                  className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-left text-sm text-foreground hover:border-accent hover:bg-accent-soft"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-6 rounded-[var(--radius)] bg-accent px-3 py-2 text-white"
                : "mr-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-foreground"
            }
          >
            {message.role === "user" ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.parts
                  .filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("\n")}
              </p>
            ) : (
              <MessageParts message={message} />
            )}
          </div>
        ))}

        {busy ? (
          <p className="text-xs text-muted" role="status">
            Thinking…
          </p>
        ) : null}

        {error ? (
          <div className="rounded-[var(--radius)] border border-urgent bg-urgent-soft px-3 py-2 text-sm text-urgent">
            <p>{error.message || "Something went wrong. Try again."}</p>
            <div className="mt-1 flex flex-wrap gap-3">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  clearError();
                  setMessages([]);
                }}
              >
                Clear chat
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submitText(input);
        }}
      >
        <label htmlFor="clearmoney-chat-input" className="sr-only">
          Message
        </label>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            id="clearmoney-chat-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitText(input);
              }
            }}
            placeholder="Ask about money…"
            className="min-h-11 flex-1 resize-none rounded-[var(--radius)] border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            disabled={busy}
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="min-h-11 self-end rounded-[var(--radius)] border border-border-strong px-3 text-sm hover:bg-accent-soft"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="min-h-11 self-end rounded-[var(--radius)] bg-accent px-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-[0.7rem] leading-snug text-muted">
          Estimates only. Not personal advice. Check current rates, fees, and ATO
          rules before you decide.
        </p>
      </form>
    </div>
  );
}
