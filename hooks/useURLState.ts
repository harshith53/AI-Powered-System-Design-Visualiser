"use client";

import { useEffect, useCallback } from "react";

const PARAM = "prompt";

/** Read ?prompt= on mount, returns the decoded value or null */
export function getPromptFromURL(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(PARAM);
    return val ? decodeURIComponent(val) : null;
  } catch {
    return null;
  }
}

/** Push ?prompt=<encoded> into the URL bar without a page reload */
export function setPromptInURL(prompt: string): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, encodeURIComponent(prompt));
    window.history.replaceState(null, "", url.toString());
  } catch {
    // ignore
  }
}

/** Remove ?prompt= from the URL bar */
export function clearPromptFromURL(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(PARAM);
    window.history.replaceState(null, "", url.toString());
  } catch {
    // ignore
  }
}

/**
 * On mount, reads ?prompt= and calls onPrompt if a value is present.
 * Thereafter, syncs the URL whenever currentPrompt changes.
 */
export function useURLState(
  currentPrompt: string,
  onPrompt: (prompt: string) => void,
) {
  // Read URL on first mount and auto-generate if ?prompt= is present
  useEffect(() => {
    const fromURL = getPromptFromURL();
    if (fromURL && fromURL !== currentPrompt) {
      onPrompt(fromURL);
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with the active prompt
  useEffect(() => {
    if (currentPrompt) {
      setPromptInURL(currentPrompt);
    }
  }, [currentPrompt]);

  /** Returns a shareable URL for the current prompt */
  const getShareURL = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, encodeURIComponent(currentPrompt));
    return url.toString();
  }, [currentPrompt]);

  return { getShareURL };
}
