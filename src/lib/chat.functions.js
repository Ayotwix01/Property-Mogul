import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

const FIXED_REPLY =
  "Got it — an agent will follow up shortly. Meanwhile, browse verified listings or ask me about any specific property.";

export const chatCompletion = createServerFn({ method: "POST" })
  .validator((data) => InputSchema.parse(data))
  .handler(async () => {
    return { reply };
  });