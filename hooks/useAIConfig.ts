"use client";

import { useState, useCallback, useEffect } from "react";
import type { AIConfig } from "@/types/ai-config";
import { DEFAULT_AI_CONFIG } from "@/types/ai-config";

const STORAGE_KEY = "sd-ai-config";

function loadConfig(): AIConfig {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) } as AIConfig;
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

function saveConfig(config: AIConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useAIConfig() {
  const [config, setConfigState] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setConfigState(loadConfig());
    setHydrated(true);
  }, []);

  const setConfig = useCallback((next: AIConfig) => {
    setConfigState(next);
    saveConfig(next);
  }, []);

  const isConfigured = hydrated && config.apiKey.trim().length > 0;

  return { config, setConfig, isConfigured, hydrated };
}
