-- Phase B: Neon Postgres initial schema
-- Apply with a SQL client against DATABASE_URL_DIRECT.

create extension if not exists pgcrypto;

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_app_user_active on app_user (clerk_user_id) where deleted_at is null;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type workspace_role as enum ('owner', 'admin', 'editor', 'viewer');
  end if;
end $$;

create table if not exists workspace (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references app_user(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists idx_workspace_owner on workspace (owner_user_id);

create table if not exists workspace_member (
  workspace_id uuid not null references workspace(id) on delete cascade,
  user_id uuid not null references app_user(id) on delete cascade,
  role workspace_role not null,
  invited_by_user_id uuid references app_user(id),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists idx_workspace_member_user on workspace_member (user_id);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'blueprint_status') then
    create type blueprint_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists blueprint (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspace(id) on delete cascade,
  created_by_user_id uuid not null references app_user(id),
  external_id text not null,
  title text not null,
  prompt text not null,
  summary text,
  tags text[] not null default '{}',
  status blueprint_status not null default 'draft',
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint chk_title_len check (char_length(title) between 1 and 200),
  constraint chk_prompt_len check (char_length(prompt) between 1 and 4000),
  unique (workspace_id, external_id)
);

create index if not exists idx_blueprint_workspace on blueprint (workspace_id, updated_at desc);
create index if not exists idx_blueprint_creator on blueprint (created_by_user_id, created_at desc);
create index if not exists idx_blueprint_status on blueprint (status);
create index if not exists idx_blueprint_tags_gin on blueprint using gin (tags);

create table if not exists blueprint_version (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references blueprint(id) on delete cascade,
  version_no integer not null,
  schema_version integer not null default 1,
  view_mode_default text,
  payload jsonb not null,
  payload_hash text not null,
  created_by_user_id uuid not null references app_user(id),
  created_at timestamptz not null default now(),
  change_note text,
  unique (blueprint_id, version_no)
);

create unique index if not exists uq_blueprint_version_hash on blueprint_version (blueprint_id, payload_hash);
create index if not exists idx_blueprint_version_recent on blueprint_version (blueprint_id, created_at desc);
create index if not exists idx_blueprint_payload_gin on blueprint_version using gin (payload jsonb_path_ops);

alter table blueprint
  drop constraint if exists fk_current_version;

alter table blueprint
  add constraint fk_current_version
  foreign key (current_version_id) references blueprint_version(id);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'generation_status') then
    create type generation_status as enum ('success', 'timeout', 'rate_limited', 'schema_error', 'provider_error');
  end if;
end $$;

create table if not exists generation_request (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspace(id),
  user_id uuid references app_user(id),
  blueprint_id uuid references blueprint(id),
  provider text not null,
  model text,
  prompt_normalized_hash text not null,
  prompt_chars integer not null,
  request_payload jsonb,
  response_payload jsonb,
  status generation_status not null,
  latency_ms integer,
  prompt_tokens integer,
  completion_tokens integer,
  cache_hit boolean not null default false,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists idx_genreq_user_time on generation_request (user_id, created_at desc);
create index if not exists idx_genreq_hash_time on generation_request (prompt_normalized_hash, created_at desc);
create index if not exists idx_genreq_status_time on generation_request (status, created_at desc);
