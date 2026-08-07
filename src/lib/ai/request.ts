import { z } from "zod";

export const MAX_MESSAGE_CHARS = 4_000;
export const MAX_MESSAGES = 40;

export const chatBodySchema = z.object({
  messages: z.array(z.unknown()).min(1).max(MAX_MESSAGES),
});

export function parseChatBody(json: unknown) {
  return chatBodySchema.safeParse(json);
}
