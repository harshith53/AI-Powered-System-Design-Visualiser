"use client";

import { useState, useCallback } from "react";
import type { ArchitectureBlueprint } from "@/types/architecture";
import type { AIConfig } from "@/types/ai-config";

type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; blueprint: ArchitectureBlueprint }
  | { status: "error"; message: string };

export function useGenerateBlueprint() {
  const [state, setState] = useState<GenerateState>({ status: "idle" });

  const generate = useCallback(async (problem: string, aiConfig?: AIConfig) => {
    if (!problem.trim()) return;

    setState({ status: "loading" });

    // Use AbortController for request timeout (30s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem.trim(),
          // Only send config if user provided a key — avoid overriding env vars with empty string
          ...(aiConfig?.apiKey?.trim() ? { aiConfig } : {}),
        }),
        signal: controller.signal,
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as Record<string, unknown>).error)
            : "Something went wrong. Please try again.";
        setState({ status: "error", message });
        return;
      }

      const blueprint = (data as { blueprint: ArchitectureBlueprint }).blueprint;
      setState({ status: "success", blueprint });
    } catch (err) {
      const message = 
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error. Check your connection and try again.";
      setState({ status: "error", message });
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, generate, reset };
}
