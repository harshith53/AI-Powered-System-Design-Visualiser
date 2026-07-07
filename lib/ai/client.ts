import type { LLMProvider } from "./providers/types";
import { createOpenAIProvider } from "./providers/openai";
import type { AIConfig } from "@/types/ai-config";

export function getProvider(runtimeConfig?: Partial<AIConfig>): LLMProvider {
  const provider = runtimeConfig?.provider ?? process.env.AI_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
    case "openai-compatible":
      return createOpenAIProvider({
        apiKey: runtimeConfig?.apiKey,
        model: runtimeConfig?.model,
        baseURL: runtimeConfig?.baseURL,
      });
    default:
      console.warn(`Unknown provider "${provider}", falling back to openai`);
      return createOpenAIProvider({ apiKey: runtimeConfig?.apiKey });
  }
}
