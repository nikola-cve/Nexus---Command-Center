import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ActivityEvent,
  DashboardData,
  Decision,
  Opportunity,
  Project,
  Task,
} from "@/lib/db/types";

/**
 * Fetch everything the Mission Control dashboard needs in parallel.
 * Returns null when Supabase is not configured yet, so the UI can show a
 * clear setup message instead of crashing. Runs as the signed-in user (RLS).
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();

  const [projects, tasks, decisions, opportunities, events] = await Promise.all([
    sb.from("projects").select("*").order("created_at", { ascending: true }),
    sb.from("tasks").select("*").order("created_at", { ascending: true }),
    sb.from("decisions").select("*").order("created_at", { ascending: false }),
    sb.from("opportunities").select("*").order("created_at", { ascending: false }),
    sb.from("events").select("*").order("created_at", { ascending: false }).limit(12),
  ]);

  return {
    projects: (projects.data ?? []) as Project[],
    tasks: (tasks.data ?? []) as Task[],
    decisions: (decisions.data ?? []) as Decision[],
    opportunities: (opportunities.data ?? []) as Opportunity[],
    events: (events.data ?? []) as ActivityEvent[],
  };
}

export async function createProject(input: {
  name: string;
  priority: Project["priority"];
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("projects").insert({
    name: input.name,
    priority: input.priority,
  });
  if (error) throw new Error(error.message);
  await logEvent("task", "project", `Project created: ${input.name}`);
}

export async function createTask(input: {
  title: string;
  projectId: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("tasks").insert({
    title: input.title,
    project_id: input.projectId,
  });
  if (error) throw new Error(error.message);
  await logEvent("task", "task", `Task added: ${input.title}`);
}

export async function createDecision(input: {
  decision: string;
  projectId: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("decisions").insert({
    decision: input.decision,
    project_id: input.projectId,
  });
  if (error) throw new Error(error.message);
  await logEvent("decision", "decision", `Decision logged: ${input.decision}`);
}

async function logEvent(type: string, ref: string, message: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  await sb.from("events").insert({ type, ref, message });
}
