import OpenAI from "openai";
import { mapSchema } from "./schema.js";
import { logCall } from "./db.js";

const MAX_ATTEMPTS = 3;

const SYSTEM_PROMPT = `You write learning maps for programming topics. The reader is a complete beginner who starts today.
Return only one JSON object with exactly these keys:
prerequisites: array of short strings, what the reader must know first.
steps: array of objects with order (number starting at 1), title, why (one short sentence on why this step matters), minutes (estimated minutes as a whole number). Steps are in learning order.
first_project: one string describing a small first practice project.
common_mistakes: array of short strings.
Use plain words. Explain any technical word the first time you use it. Do not add any other keys or any text outside the JSON.`;

export class LlmDisabledError extends Error {}
export class LlmFailedError extends Error {}

export async function requestMap(topic, slug) {
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (process.env.LLM_ENABLED === "false" || !apiKey || !model) {
    throw new LlmDisabledError("llm disabled");
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL || undefined,
  });

  let lastError = "unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const started = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;
    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Topic: ${topic}` },
        ],
      });
      promptTokens = completion.usage?.prompt_tokens ?? 0;
      completionTokens = completion.usage?.completion_tokens ?? 0;
      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = mapSchema.parse(JSON.parse(raw));
      logCall({
        slug,
        model,
        attempt,
        ok: 1,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - started,
        error: null,
      });
      return parsed;
    } catch (err) {
      lastError = String(err?.message ?? err).slice(0, 300);
      logCall({
        slug,
        model,
        attempt,
        ok: 0,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - started,
        error: lastError,
      });
    }
  }

  throw new LlmFailedError(lastError);
}
