import { describe, expect, it } from "vitest";
import type { LoadedArticle } from "@/lib/content/articles";
import {
  chunkArticle,
  formatRetrievedContext,
  retrieveContext,
} from "@/lib/ai/retrieve";
import {
  checkRateLimit,
  resetRateLimitBuckets,
} from "@/lib/ai/rate-limit";
import { parseChatBody } from "@/lib/ai/request";
import { calculatorTools } from "@/lib/ai/tools";

const sampleArticle: LoadedArticle = {
  title: "How to do a budget",
  description: "Build a simple budget that fits your pay cycle.",
  pillar: "banking-budgeting",
  hub: "budgeting",
  slug: "how-to-do-a-budget",
  updated: "2026-08-03",
  tags: ["budget", "spending"],
  relatedTools: ["budget-planner"],
  body: `Track money in and money out so choices are clearer.

## Start with your pay cycle

List income after tax for one fortnight or month.

## What to do next

- Open the budget planner tool
- Cut one optional cost this week
`,
  readingMinutes: 3,
  headings: [
    { id: "start-with-your-pay-cycle", text: "Start with your pay cycle" },
    { id: "what-to-do-next", text: "What to do next" },
  ],
};

describe("chunkArticle", () => {
  it("splits lead and H2 sections with href metadata", () => {
    const chunks = chunkArticle(sampleArticle);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]?.heading).toBe("Overview");
    expect(chunks.some((c) => c.heading === "Start with your pay cycle")).toBe(
      true,
    );
    expect(chunks[0]?.href).toBe(
      "/topics/banking-budgeting/budgeting/how-to-do-a-budget",
    );
  });
});

describe("retrieveContext", () => {
  it("returns guide chunks for a budgeting query", () => {
    const ctx = retrieveContext("how to do a budget and track spending");
    expect(ctx.chunks.length).toBeGreaterThan(0);
    expect(ctx.chunks[0]?.href).toMatch(/^\/topics\//);
  });

  it("surfaces tools for numerical queries", () => {
    const ctx = retrieveContext("calculate my mortgage repayment estimate");
    expect(ctx.matchingTools.length).toBeGreaterThan(0);
  });
});

describe("formatRetrievedContext", () => {
  it("handles empty retrieval", () => {
    const text = formatRetrievedContext({ chunks: [], matchingTools: [] });
    expect(text).toMatch(/No strongly matching/);
  });
});

describe("checkRateLimit", () => {
  it("allows then blocks after max requests", () => {
    resetRateLimitBuckets();
    const key = "test-ip";
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key, 20, 60_000).allowed).toBe(true);
    }
    expect(checkRateLimit(key, 20, 60_000).allowed).toBe(false);
  });
});

describe("parseChatBody", () => {
  it("rejects empty body and empty messages", () => {
    expect(parseChatBody({}).success).toBe(false);
    expect(parseChatBody({ messages: [] }).success).toBe(false);
  });

  it("accepts a messages array", () => {
    expect(parseChatBody({ messages: [{ role: "user" }] }).success).toBe(true);
  });
});

describe("calculatorTools", () => {
  const opts = {
    toolCallId: "t1",
    messages: [] as never[],
    abortSignal: new AbortController().signal,
    context: {},
  };

  it("gstBreakdown returns toolHref and numbers", async () => {
    const result = (await calculatorTools.gstBreakdown.execute!(
      { amount: 110, mode: "inclusive" },
      opts,
    )) as {
      toolHref: string;
      gst: number;
      exclusive: number;
    };
    expect(result.toolHref).toBe("/tools/gst");
    expect(result.gst).toBeCloseTo(10, 5);
    expect(result.exclusive).toBeCloseTo(100, 5);
  });

  it("estimateIncomeTax returns take-home fields", async () => {
    const result = (await calculatorTools.estimateIncomeTax.execute!(
      { taxableIncome: 90_000 },
      { ...opts, toolCallId: "t2" },
    )) as {
      toolHref: string;
      totalTax: number;
      approximateTakeHome: number;
    };
    expect(result.toolHref).toBe("/tools/income-tax");
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.approximateTakeHome).toBeLessThan(90_000);
  });
});
