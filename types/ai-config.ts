export type AIProvider = "openai" | "openai-compatible";

export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "custom";

export type AIConfig = {
  provider: AIProvider;
  apiKey: string;
  model: AIModel | string;
  /** Base URL for self-hosted / OpenAI-compatible endpoints (Ollama, LM Studio, Groq, etc.) */
  baseURL?: string;
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4o",
  baseURL: "",
};

export const OPENAI_MODELS: { value: string; label: string }[] = [
  { value: "gpt-4o",       label: "GPT-4o (recommended)" },
  { value: "gpt-4o-mini",  label: "GPT-4o mini (faster, cheaper)" },
  { value: "gpt-4-turbo",  label: "GPT-4 Turbo" },
  { value: "custom",       label: "Custom model name…" },
];

export const COMPATIBLE_PRESETS: { label: string; baseURL: string; note: string }[] = [
  { label: "Ollama (local)",     baseURL: "http://localhost:11434/v1", note: "ollama run llama3" },
  { label: "LM Studio (local)",  baseURL: "http://localhost:1234/v1",  note: "Enable local server in LM Studio" },
  { label: "Groq (cloud)",       baseURL: "https://api.groq.com/openai/v1", note: "groq.com API key" },
  { label: "Together AI (cloud)", baseURL: "https://api.together.xyz/v1",   note: "together.ai API key" },
];
