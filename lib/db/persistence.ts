import { createHash } from "crypto";
import type { ArchitectureBlueprint } from "@/types/architecture";
import { getDbPool } from "./client";

type PersistInput = {
  clerkUserId: string;
  prompt: string;
  blueprint: ArchitectureBlueprint;
  provider: string;
  model?: string;
  latencyMs: number;
  cacheHit: boolean;
  status: "success" | "timeout" | "rate_limited" | "schema_error" | "provider_error";
  errorCode?: string;
};

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function makeWorkspaceSlug(clerkUserId: string): string {
  const cleaned = clerkUserId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const suffix = hashValue(clerkUserId).slice(0, 12);
  return `personal-${cleaned.slice(0, 32)}-${suffix}`;
}

export async function persistGeneratedBlueprint(input: PersistInput): Promise<void> {
  const pool = getDbPool();
  if (!pool) return;

  const normalizedPrompt = normalizePrompt(input.prompt);
  const promptHash = hashValue(normalizedPrompt);
  const payloadJson = JSON.stringify(input.blueprint);
  const payloadHash = hashValue(payloadJson);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query<{ id: string }>(
      `
      insert into app_user (clerk_user_id)
      values ($1)
      on conflict (clerk_user_id)
      do update set updated_at = now()
      returning id
      `,
      [input.clerkUserId],
    );
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      throw new Error("Failed to resolve app_user id");
    }

    const workspaceSlug = makeWorkspaceSlug(input.clerkUserId);
    const workspaceResult = await client.query<{ id: string }>(
      `
      insert into workspace (slug, name, owner_user_id)
      values ($1, $2, $3)
      on conflict (slug)
      do update set updated_at = now()
      returning id
      `,
      [workspaceSlug, "Personal Workspace", userId],
    );
    const workspaceId = workspaceResult.rows[0]?.id;
    if (!workspaceId) {
      throw new Error("Failed to resolve workspace id");
    }

    await client.query(
      `
      insert into workspace_member (workspace_id, user_id, role, invited_by_user_id)
      values ($1, $2, 'owner', $2)
      on conflict (workspace_id, user_id)
      do update set role = excluded.role
      `,
      [workspaceId, userId],
    );

    const blueprintResult = await client.query<{ id: string }>(
      `
      insert into blueprint (workspace_id, created_by_user_id, external_id, title, prompt, summary, status)
      values ($1, $2, $3, $4, $5, $6, 'draft')
      on conflict (workspace_id, external_id)
      do update set
        title = excluded.title,
        prompt = excluded.prompt,
        summary = excluded.summary,
        updated_at = now()
      returning id
      `,
      [
        workspaceId,
        userId,
        input.blueprint.id,
        input.blueprint.title,
        input.prompt,
        input.blueprint.summary ?? null,
      ],
    );

    const blueprintId = blueprintResult.rows[0]?.id;
    if (!blueprintId) {
      throw new Error("Failed to resolve blueprint id");
    }

    const versionResult = await client.query<{ next_version: number }>(
      `
      select coalesce(max(version_no), 0) + 1 as next_version
      from blueprint_version
      where blueprint_id = $1
      `,
      [blueprintId],
    );
    const versionNo = versionResult.rows[0]?.next_version ?? 1;

    const insertedVersion = await client.query<{ id: string }>(
      `
      insert into blueprint_version (
        blueprint_id,
        version_no,
        schema_version,
        view_mode_default,
        payload,
        payload_hash,
        created_by_user_id,
        change_note
      ) values ($1, $2, 1, 'HLD', $3::jsonb, $4, $5, $6)
      on conflict (blueprint_id, payload_hash)
      do update set change_note = excluded.change_note
      returning id
      `,
      [
        blueprintId,
        versionNo,
        payloadJson,
        payloadHash,
        userId,
        "AI generation",
      ],
    );

    const versionId = insertedVersion.rows[0]?.id;
    if (versionId) {
      await client.query(
        `
        update blueprint
        set current_version_id = $2,
            updated_at = now()
        where id = $1
        `,
        [blueprintId, versionId],
      );
    }

    await client.query(
      `
      insert into generation_request (
        workspace_id,
        user_id,
        blueprint_id,
        provider,
        model,
        prompt_normalized_hash,
        prompt_chars,
        request_payload,
        response_payload,
        status,
        latency_ms,
        cache_hit,
        error_code
      )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8::jsonb,
        $9::jsonb,
        $10,
        $11,
        $12,
        $13
      )
      `,
      [
        workspaceId,
        userId,
        blueprintId,
        input.provider,
        input.model ?? null,
        promptHash,
        input.prompt.length,
        JSON.stringify({ prompt: input.prompt }),
        JSON.stringify({
          blueprintId: input.blueprint.id,
          title: input.blueprint.title,
          nodeCount: input.blueprint.nodes?.length ?? 0,
          edgeCount: input.blueprint.edges?.length ?? 0,
        }),
        input.status,
        input.latencyMs,
        input.cacheHit,
        input.errorCode ?? null,
      ],
    );

    await client.query("COMMIT");
  } catch {
    await client.query("ROLLBACK");
    throw new Error("Failed to persist generated blueprint");
  } finally {
    client.release();
  }
}
