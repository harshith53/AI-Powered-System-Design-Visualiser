import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { buildPrompt } from "@/lib/ai/prompt";
import { getProvider } from "@/lib/ai/client";
import { BlueprintSchema } from "@/lib/ai/schema";
import { getCached, setCached, cacheKey } from "@/lib/ai/cache";
import type { ArchitectureBlueprint } from "@/types/architecture";
import type { AIConfig } from "@/types/ai-config";

export const runtime = "nodejs";
export const maxDuration = 60;

function getClientIP(req: NextRequest): string {
  // Trust x-forwarded-for only in production behind a known proxy
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function errorResponse(
  message: string,
  code: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, code, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  // ── 0. Require auth ───────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  // ── 1. Validate Content-Type ──────────────────────────────────────────────
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return errorResponse("Content-Type must be application/json", "INVALID_CONTENT_TYPE", 400);
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", "INVALID_JSON", 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).problem !== "string"
  ) {
    return errorResponse('Missing required field "problem"', "MISSING_FIELD", 400);
  }

  const { problem: rawProblem, aiConfig } = body as {
    problem: string;
    aiConfig?: Partial<AIConfig>;
  };

  const problem = rawProblem.trim();
  if (!problem) {
    return errorResponse('"problem" must not be empty', "EMPTY_FIELD", 400);
  }

  // ── 3. Rate limit ─────────────────────────────────────────────────────────
  const ip = getClientIP(req);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return errorResponse("Rate limit exceeded", "RATE_LIMITED", 429, { retryAfterMs });
  }

  // ── 4. Cache lookup ───────────────────────────────────────────────────────
  const key = cacheKey(problem);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json(
      { blueprint: cached },
      { headers: { "X-Cache": "HIT" } },
    );
  }

  // ── 5. Build prompt ───────────────────────────────────────────────────────
  const { systemPrompt, userMessage, error: promptError } = buildPrompt(problem);
  if (promptError) {
    return errorResponse(promptError, "INVALID_INPUT", 400);
  }

  // ── 6. Call LLM ───────────────────────────────────────────────────────────
  let rawJson: string;
  try {
    const provider = getProvider(aiConfig);
    rawJson = await provider.generate(systemPrompt, userMessage);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const name = err instanceof Error ? err.name : "";
    console.error("[generate] LLM error:", msg);

    if (name === "ConfigError") {
      return errorResponse(msg, "CONFIG_ERROR", 500);
    }
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      return errorResponse("AI service timed out. Please try again.", "LLM_TIMEOUT", 504);
    }
    if (msg.includes("401") || msg.includes("Incorrect API key") || msg.includes("invalid_api_key")) {
      return errorResponse("Invalid API key. Check OPENAI_API_KEY in .env.local.", "CONFIG_ERROR", 500);
    }
    return errorResponse("Failed to generate architecture. Please try again.", "LLM_ERROR", 500);
  }

  // ── 7. Parse + validate ───────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    console.error("[generate] JSON parse failed. First 300 chars:", rawJson.slice(0, 300));
    return errorResponse("AI returned malformed JSON. Please try again.", "PARSE_ERROR", 500);
  }

  let result = BlueprintSchema.safeParse(parsed);

  // ── 7b. One-time retry if validation still fails after schema coercion ────
  if (!result.success) {
    const flat = result.error.flatten();
    console.warn("[generate] Zod validation failed on first attempt:", JSON.stringify(flat, null, 2));

    // Build a correction hint from the failing field paths
    const fieldErrors = Object.entries(flat.fieldErrors)
      .map(([path, msgs]) => `  • ${path}: ${(msgs ?? []).join(", ")}`)
      .join("\n");

    const retrySystemPrompt = `${systemPrompt}

CORRECTION REQUIRED — your previous response failed validation on these fields:
${fieldErrors || "  • (see format rules above)"}

Re-read the schema carefully and fix only those fields. Return the complete corrected JSON.`;

    try {
      const provider = getProvider(aiConfig);
      const retryRaw = await provider.generate(retrySystemPrompt, userMessage);
      const retryParsed = JSON.parse(retryRaw);
      result = BlueprintSchema.safeParse(retryParsed);
      if (!result.success) {
        console.error("[generate] Zod retry also failed:", result.error.flatten());
      }
    } catch (retryErr) {
      console.error("[generate] Retry LLM call failed:", retryErr);
      // fall through — the original result.success === false will be caught below
    }
  }

  if (!result.success) {
    const flat = result.error.flatten();
    const fieldSummary = Object.keys(flat.fieldErrors).join(", ");
    console.error("[generate] Final validation failure. Fields:", fieldSummary);
    return errorResponse(
      `AI response schema mismatch (fields: ${fieldSummary || "unknown"}). Please try again.`,
      "SCHEMA_ERROR",
      500,
    );
  }

  // ── 8. Attach prompt + cache + return ─────────────────────────────────────
  const blueprint: ArchitectureBlueprint = { ...result.data, prompt: problem } as unknown as ArchitectureBlueprint;
  setCached(key, blueprint);

  return NextResponse.json(
    { blueprint },
    { headers: { "X-Cache": "MISS" } },
  );
}
