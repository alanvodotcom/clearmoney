import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  formatAiError,
  getChatModel,
  isAiConfigured,
} from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { checkRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { MAX_MESSAGE_CHARS, parseChatBody } from "@/lib/ai/request";
import { retrieveContext } from "@/lib/ai/retrieve";
import { calculatorTools } from "@/lib/ai/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function latestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    const parts = msg.parts ?? [];
    const text = parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n")
      .trim();
    if (text) return text;
  }
  return "";
}

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return Response.json(
      {
        error:
          "Chat is not configured. Set AI_GATEWAY_API_KEY (default), or AI_PROVIDER=anthropic|openai with the matching API key.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const limit = checkRateLimit(`chat:${ip}`);
  if (!limit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseChatBody(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Request must include a non-empty messages array." },
      { status: 400 },
    );
  }

  const messages = parsed.data.messages as UIMessage[];
  const userText = latestUserText(messages);

  if (!userText) {
    return Response.json(
      { error: "Latest user message must include text." },
      { status: 400 },
    );
  }

  if (userText.length > MAX_MESSAGE_CHARS) {
    return Response.json(
      { error: `Message too long (max ${MAX_MESSAGE_CHARS} characters).` },
      { status: 400 },
    );
  }

  try {
    const ctx = retrieveContext(userText);
    const system = buildSystemPrompt(ctx);

    const result = streamText({
      model: getChatModel(),
      system,
      messages: await convertToModelMessages(messages),
      tools: calculatorTools,
      stopWhen: isStepCount(5),
      maxRetries: 1,
      abortSignal: req.signal,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: formatAiError,
      }),
    });
  } catch (error) {
    console.error("[api/chat]", error);
    return Response.json(
      { error: formatAiError(error) },
      { status: 502 },
    );
  }
}
