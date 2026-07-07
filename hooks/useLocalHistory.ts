"use client";

import { useState, useCallback, useEffect } from "react";
import type { ArchitectureBlueprint } from "@/types/architecture";

export type HistoryEntry = {
  id: string;
  title: string;
  prompt: string;
  savedAt: number; // epoch ms
  blueprint: ArchitectureBlueprint;
};

const STORAGE_KEY = "sd-history";
const MAX_ENTRIES = 20;

function load(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useLocalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setHistory(load());
  }, []);

  const save = useCallback((blueprint: ArchitectureBlueprint) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: blueprint.id,
        title: blueprint.title,
        prompt: blueprint.prompt,
        savedAt: Date.now(),
        blueprint,
      };
      // Deduplicate by id, newest first, cap at MAX_ENTRIES
      const updated = [entry, ...prev.filter((e) => e.id !== blueprint.id)].slice(
        0,
        MAX_ENTRIES,
      );
      persist(updated);
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    persist([]);
    setHistory([]);
  }, []);

  return { history, save, remove, clear };
}
