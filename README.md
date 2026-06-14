# Nexus Command Center

Personal operating center for a solo non-coder founder. One place to run the work: projects,
decisions, tasks, research, opportunities, execution state, and handoffs, with Claude on call as the
execution backend. Built fresh in this repo. It is a tool for one owner, not a SaaS for others.

The UI is a Mission Control dashboard (dark neon theme with an animated particle core).

## Architecture

- Frontend: Next.js 16 (App Router) on Vercel, Tailwind 4, Three.js (particle core).
- Database: Supabase Postgres. Tables: projects, tasks, decisions, research, opportunities, runs,
  handoffs, events. Row Level Security is on and locked to the owner account.
- Auth: Supabase Auth, single user. A login wall protects the whole app.
- Engine (from Step 3): Claude via the Anthropic API (Messages API plus the Vercel AI SDK), with an
  engine seam to add the Agent SDK later for autonomous execution.
- Records: Git history, plus this README, ROADMAP.md, and CHANGELOG.md. The build itself is also
  tracked inside the app as tasks on the "Nexus Command Center" project (dogfooding).

## How it connects

Open the command center, sign in, see the current state. From Step 3, type a request: the supervisor
routes it to one of the 7 operating modes, Claude responds, writes the result plus an event into the
database, and you can rate it. Each major step ends with a copy-paste handoff.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from the example and fill in the values:
   ```bash
   cp .env.example .env.local
   ```
   Required now:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Optional: `ALLOWED_EMAIL` (restrict sign-in to one email). Later: `ANTHROPIC_API_KEY`.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and sign in to reach `/mission-control`.

## Security

- The anon/publishable key is public by design. Data is protected by Supabase Auth plus Row Level
  Security, which is locked to the owner account, so only the owner can read or write.
- No service_role secret is used by the app. All data access runs as the signed-in user.
- `proxy.ts` (Next.js 16 middleware) redirects unauthenticated requests to `/login`.

## Deploy

Hosted on Vercel. The `main` branch is production. Pushing to `main` triggers a new deployment.
Set the same environment variables in the Vercel project settings.

## Scripts

- `npm run dev` start the dev server
- `npm run build` production build (also type checks)
- `npm run lint` lint
- `npm run start` run the production build

## Status

See CHANGELOG.md for what is done and ROADMAP.md for what is planned. Current phase: foundation
hardening complete, next is the Claude engine.
