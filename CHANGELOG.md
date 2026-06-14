# Changelog

All notable changes to Nexus Command Center, newest first.

## Step 2.5: Foundation hardening

### 2.5a: Single-user auth
- Added Supabase Auth (email and password) with `@supabase/ssr`.
- `proxy.ts` (Next.js 16 middleware) redirects unauthenticated requests to `/login`.
- Login page, sign-in and sign-out actions, sign-out button in the header.
- Switched data access from the service_role key to the signed-in user session.
- Row Level Security locked to the owner account, so only the owner can read or write.
- Verified live: visiting `/mission-control` while signed out returns the login page.

### 2.5b: Documentation
- Added README.md (overview, architecture, setup, security), ROADMAP.md (vision, journey, feature
  map), and this CHANGELOG.md.

### 2.5c: In-app build tracking
- The build is tracked inside the app as tasks on the "Nexus Command Center" project, so progress is
  visible in Mission Control.

## Step 2: Data backbone
- Supabase Postgres schema: projects, tasks, decisions, research, opportunities, runs, handoffs,
  events. RLS enabled.
- Data layer and server actions (create project, task, decision).
- Mission Control wired to real data: Quick Add, Decision Log, Activity Feed.
- Graceful "Database not connected" screen when configuration is missing.

## Step 1: Foundation
- Next.js 16 (App Router, TypeScript, Tailwind 4) scaffold, built fresh.
- CLAUDE.md with the OPERATING CONTEXT V2 operating rules.
- Dark neon Mission Control theme.
- Mission Control shell with a Three.js particle core, system status, projects, operating modes,
  opportunities, tasks, and activity feed.
- Landing page. Deployed to Vercel.
