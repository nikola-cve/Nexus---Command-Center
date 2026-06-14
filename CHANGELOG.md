# Changelog

All notable changes to Nexus Command Center, newest first.

## Step D1: Design system (calm premium, Linear/Mercury direction)
- New token palette: near-black surfaces, one indigo accent, neutral grays, higher contrast.
- Killed the neon glow, busy grid, and loud all-caps HUD styling; restrained captions.
- Linear-style sidebar (neutral items, single accent for active, clean brand mark).
- Neutral, tabular KPI numbers; refined card and focus styles.

## Step 3.1: Design pass
- Removed the decorative particle sphere. Overview now shows useful content: Priority projects,
  In progress tasks, Quick capture, Agents, and Activity.
- Quieter background (dropped the busy grid and the magenta glow cliche), higher-contrast text for
  readability, cleaner spacing and typography.

## Step 3.0: Configurable agents
- Agents are now real, editable records in the database (the 7 operating modes seeded with real
  roles and system prompts), not static chips.
- New Agents section: list of agents, and an editable detail page (name, role, system prompt, color,
  enabled, delete). Create new agents too.
- These system prompts are what the Claude engine will use next.
- Overview now shows agents from the database, each linking to its editor.
- Note: the design skills the owner shared (impeccable, taste-skill) could not run in this sandbox
  (skill download returned HTTP 403; the impeccable detector needs a headless browser that cannot run
  as root here). Their published principles are being applied manually in the design pass.

## Step 2.9: Detail pages and history (traces)
- Project, task, and decision names are now clickable and open a detail page.
- Project detail shows its tasks, decisions, research, an editable description, progress, and a
  history of everything under it.
- Task detail shows status, project link, editable notes, and history. Decision detail shows
  rationale, project link, and history.
- Every create and change is now recorded against the item id, building a history trace per item.
- Clock and timestamps switched to Belgrade time.

## Step 2.8: UI restructure (navigation and sections)
- Left navigation with separate sections: Overview, Projects, Tasks, Decisions, Opportunities,
  Research, Plan. Each section has its own accent color.
- New Plan and Progress screen shows the roadmap, phases, and overall progress inside the app.
- Overview slimmed (stats, particle core, operating modes, activity).
- Research is now a real section (add, list, delete, clickable source links).
- Per-section add bars with toasts; shared Panel component; mobile-friendly nav.

## Step 2.7: Usability pass
- Tasks are now actionable: cycle status (todo, doing, done) and delete.
- Projects: change priority and status inline, and delete.
- Opportunities: add (new Quick Add tab) and delete.
- Toast notifications (sonner) on every action; server action errors are surfaced, not crashing.
- Tasks panel now shows all tasks (done dimmed and struck) so status can be toggled both ways.

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
