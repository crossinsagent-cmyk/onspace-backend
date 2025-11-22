# OnSpace Clone — Backend

Minimal Node/Express backend for an OnSpace-style prompt-to-app generator.

## Features

- `/api/generate` endpoint
  - Takes `{ brief, model? }`
  - Calls OpenAI Chat Completions (or other provider later)
  - Enforces JSON schema via AJV
  - Best-effort saves project JSON into Supabase `projects` table
- JWT-based `requireAuth` middleware (prototype-friendly)
- Env-based configuration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- `PRIMARY_PROVIDER=openai`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Run locally:

```bash
npm run dev
```

4. Deploy on Render:
- Point Render web service to this repo
- Set env vars in Render dashboard to match your local `.env`.

## Notes

- Supabase schema expected:

```sql
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text,
  data jsonb not null,
  created_at timestamptz default now()
);
```
