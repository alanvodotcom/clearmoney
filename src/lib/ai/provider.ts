import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { gateway, type LanguageModel } from "ai";

export type AiProviderName = "gateway" | "anthropic" | "openai";

export function getAiProviderName(): AiProviderName {
  const raw = (process.env.AI_PROVIDER ?? "gateway").toLowerCase().trim();
  if (raw === "openai") return "openai";
  if (raw === "anthropic") return "anthropic";
  return "gateway";
}

export function isAiConfigured(): boolean {
  const provider = getAiProviderName();
  if (provider === "openai") {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
  }
  if (provider === "anthropic") {
    return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  }
  return Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
}

/**
 * Defaults favour Vercel AI Gateway free-tier models.
 * Claude / stronger models usually need paid Gateway credits.
 * @see https://vercel.com/ai-gateway/models?freeTier=true
 */
const DEFAULT_MODELS: Record<AiProviderName, string> = {
  gateway: "openai/gpt-4o-mini",
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4o-mini",
};

export function getChatModel(): LanguageModel {
  const provider = getAiProviderName();
  const modelId =
    process.env.AI_MODEL?.trim() || DEFAULT_MODELS[provider];

  if (provider === "openai") {
    return openai(modelId);
  }
  if (provider === "anthropic") {
    return anthropic(modelId);
  }
  return gateway(modelId);
}

/** Prefer the underlying Gateway / API message for clients. */
export function formatAiError(error: unknown): string {
  if (error == null) return "An unexpected error occurred.";
  if (typeof error === "string") return friendlyGatewayMessage(error);

  if (error instanceof Error) {
    const retry = error as Error & {
      lastError?: { message?: string };
      errors?: Array<{ message?: string }>;
    };
    const nested =
      retry.lastError?.message ||
      retry.errors?.[retry.errors.length - 1]?.message;
    return friendlyGatewayMessage(nested || error.message || "An unexpected error occurred.");
  }

  return "An unexpected error occurred.";
}

function friendlyGatewayMessage(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("rate-limited") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit")
  ) {
    return (
      "Vercel AI Gateway free-tier limit reached for this model. " +
      "Wait a few minutes and try again, or top up credits at " +
      "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dtop-up " +
      "(then you can also use models like anthropic/claude-sonnet-4.5)."
    );
  }
  if (lower.includes("do not have access to this model")) {
    return (
      "This model is not available on the AI Gateway free tier. " +
      "Set AI_MODEL=openai/gpt-4o-mini in .env.local, or top up Gateway credits " +
      "to use premium models."
    );
  }
  return message;
}

