# Nexus Command Center: Roadmap

## Vision

An AI-powered operating system around one founder. A single command center that tracks projects,
decisions, tasks, research, opportunities, execution state, and handoffs, and dispatches real work to
Claude. The owner is the human in the loop: directs, confirms, decides. Claude investigates, plans,
builds, documents, and executes.

## User journey

1. Open the command center and sign in.
2. See the current state at a glance: active projects, open tasks, opportunities, recent decisions,
   activity.
3. Type a request in the command bar.
4. The supervisor routes it to the right operating mode (or modes).
5. Claude responds, and can write the result into the command center (a new task, a logged decision,
   saved research) plus an activity event.
6. Rate the result (thumbs up or down). Negative feedback becomes a lesson for next time.
7. At the end of a major step, generate a copy-paste handoff so work survives a reset.

## The 7 operating modes (specialized agents)

Founder, Research, Product Manager, CTO for non-coder, Execution Operator, Sales and Outreach,
Critic and Red Team. A JARVIS supervisor picks the right one for each request.

## Feature map by phase

### Phase 1: Foundation (done)
- Mission Control dashboard shell with the particle core.
- Supabase data backbone (projects, tasks, decisions, research, opportunities, runs, handoffs,
  events).
- Quick Add for projects and tasks. Decision Log. Activity Feed.

### Phase 1.5: Hardening (done)
- Single-user login (Supabase Auth) and Row Level Security locked to the owner.
- Documentation (README, ROADMAP, CHANGELOG) and in-app build tracking.

### Phase 2: Claude engine (next)
- Command bar wired to Claude (Messages API plus the Vercel AI SDK), streaming responses.
- The 7 modes as system prompts, with a router.
- Tool use so Claude can create or update projects, tasks, decisions, and research.
- Every request saved as a run.

### Phase 3: Memory, handoff, polish
- Experience memory: lessons from thumbs-down feedback influence the next run.
- Handoff generator (compact, copy-paste).
- One visual styling pass.

### Later (not scheduled)
- Agent SDK autonomous execution engine via the seam (Claude writes code, runs tasks), with a small
  long-running worker.
- Deeper per-project views, research capture from the web, analytics.
- External integrations.

## Current status

Phase 1 and Phase 1.5 are complete and deployed. Next action: Phase 2, the Claude engine, which needs
an `ANTHROPIC_API_KEY`.
