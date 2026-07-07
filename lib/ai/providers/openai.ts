import OpenAI from "openai";
import type { LLMProvider } from "./types";

const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 30_000);
const MAX_RETRIES = Number(process.env.AI_MAX_RETRIES ?? 2);

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface OpenAIRuntimeConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

function buildClient(runtimeConfig?: OpenAIRuntimeConfig): OpenAI {
  const apiKey = runtimeConfig?.apiKey?.trim() || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ConfigError(
      "No API key configured. Open ⚙ Settings in the toolbar and add your key.",
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: runtimeConfig?.baseURL?.trim() || undefined,
    timeout: TIMEOUT_MS,
    maxRetries: MAX_RETRIES,
  });
}

export function createOpenAIProvider(runtimeConfig?: OpenAIRuntimeConfig): LLMProvider {
  return {
    async generate(systemPrompt: string, userMessage: string): Promise<string> {
      const client = buildClient(runtimeConfig);
      const model = runtimeConfig?.model?.trim() || "gpt-4o";

      const completion = await client.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("OpenAI returned an empty response");
      return content;
    },
  };
}

// Default singleton using env vars (for backwards compat)
export const openAIProvider: LLMProvider = createOpenAIProvider();
