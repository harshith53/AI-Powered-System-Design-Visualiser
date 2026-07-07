export interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>;
}
