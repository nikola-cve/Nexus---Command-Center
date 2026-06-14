import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ActivityEvent,
  Agent,
  DashboardData,
  Decision,
  Opportunity,
  Project,
  Research,
  Task,
} from "@/lib/db/types";

export type ProjectDetail = {
  project: Project;
  tasks: Task[];
  decisions: Decision[];
  research: Research[];
  history: ActivityEvent[];
};

export type TaskDetail = { task: Task; project: Project | null; history: ActivityEvent[] };
export type DecisionDetail = {
  decision: Decision;
  project: Project | null;
  history: ActivityEvent[];
};

/** Everything the dashboard and section pages need. Null when not configured. */
export async function getDashboardData(): Promise<DashboardData | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();

  const [projects, tasks, decisions, opportunities, research, agents, events] = await Promise.all([
    sb.from("projects").select("*").order("created_at", { ascending: true }),
    sb.from("tasks").select("*").order("created_at", { ascending: true }),
    sb.from("decisions").select("*").order("created_at", { ascending: false }),
    sb.from("opportunities").select("*").order("created_at", { ascending: false }),
    sb.from("research").select("*").order("created_at", { ascending: false }),
    sb.from("agents").select("*").order("sort", { ascending: true }),
    sb.from("events").select("*").order("created_at", { ascending: false }).limit(12),
  ]);

  return {
    projects: (projects.data ?? []) as Project[],
    tasks: (tasks.data ?? []) as Task[],
    decisions: (decisions.data ?? []) as Decision[],
    opportunities: (opportunities.data ?? []) as Opportunity[],
    research: (research.data ?? []) as Research[],
    agents: (agents.data ?? []) as Agent[],
    events: (events.data ?? []) as ActivityEvent[],
  };
}

export async function getAgents(): Promise<Agent[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("agents").select("*").order("sort", { ascending: true });
  return (data ?? []) as Agent[];
}

export async function getAgentDetail(id: string): Promise<Agent | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("agents").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Agent | null;
}

export async function createAgent(input: { name: string; role: string }): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data: maxRow } = await sb
    .from("agents")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = ((maxRow?.sort as number) ?? 0) + 1;
  const { data, error } = await sb
    .from("agents")
    .insert({ name: input.name, role: input.role, system_prompt: "You are a helpful agent.", sort })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("agent", data.id, "Agent created");
}

export async function updateAgent(
  id: string,
  patch: { name?: string; role?: string; system_prompt?: string; color?: string; enabled?: boolean },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("agents")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent("agent", id, "Agent updated");
}

export async function deleteAgent(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("agents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();
  const { data: project } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) return null;

  const [tasks, decisions, research] = await Promise.all([
    sb.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: true }),
    sb.from("decisions").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    sb.from("research").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);

  const tasksData = (tasks.data ?? []) as Task[];
  const decisionsData = (decisions.data ?? []) as Decision[];
  const researchData = (research.data ?? []) as Research[];

  // History: events for this project and any of its child items (the "traces").
  const refs = [
    id,
    ...tasksData.map((t) => t.id),
    ...decisionsData.map((d) => d.id),
    ...researchData.map((r) => r.id),
  ];
  const { data: events } = await sb
    .from("events")
    .select("*")
    .in("ref", refs)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    project: project as Project,
    tasks: tasksData,
    decisions: decisionsData,
    research: researchData,
    history: (events ?? []) as ActivityEvent[],
  };
}

export async function getTaskDetail(id: string): Promise<TaskDetail | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();
  const { data: task } = await sb.from("tasks").select("*").eq("id", id).maybeSingle();
  if (!task) return null;
  const t = task as Task;
  const [project, events] = await Promise.all([
    t.project_id
      ? sb.from("projects").select("*").eq("id", t.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sb.from("events").select("*").eq("ref", id).order("created_at", { ascending: false }).limit(50),
  ]);
  return {
    task: t,
    project: (project.data ?? null) as Project | null,
    history: (events.data ?? []) as ActivityEvent[],
  };
}

export async function getDecisionDetail(id: string): Promise<DecisionDetail | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createSupabaseServerClient();
  const { data: decision } = await sb.from("decisions").select("*").eq("id", id).maybeSingle();
  if (!decision) return null;
  const d = decision as Decision;
  const [project, events] = await Promise.all([
    d.project_id
      ? sb.from("projects").select("*").eq("id", d.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sb.from("events").select("*").eq("ref", id).order("created_at", { ascending: false }).limit(50),
  ]);
  return {
    decision: d,
    project: (project.data ?? null) as Project | null,
    history: (events.data ?? []) as ActivityEvent[],
  };
}

export type SearchItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function getSearchIndex(): Promise<SearchItem[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createSupabaseServerClient();
  const [p, t, d, r, o, a] = await Promise.all([
    sb.from("projects").select("id,name"),
    sb.from("tasks").select("id,title"),
    sb.from("decisions").select("id,decision"),
    sb.from("research").select("id,title"),
    sb.from("opportunities").select("id,title"),
    sb.from("agents").select("id,name,role"),
  ]);
  const items: SearchItem[] = [];
  for (const x of (p.data ?? []) as { id: string; name: string }[])
    items.push({ id: x.id, type: "Project", title: x.name, href: `/projects/${x.id}` });
  for (const x of (t.data ?? []) as { id: string; title: string }[])
    items.push({ id: x.id, type: "Task", title: x.title, href: `/tasks/${x.id}` });
  for (const x of (d.data ?? []) as { id: string; decision: string }[])
    items.push({ id: x.id, type: "Decision", title: x.decision, href: `/decisions/${x.id}` });
  for (const x of (r.data ?? []) as { id: string; title: string }[])
    items.push({ id: x.id, type: "Research", title: x.title, href: `/research` });
  for (const x of (o.data ?? []) as { id: string; title: string }[])
    items.push({ id: x.id, type: "Opportunity", title: x.title, href: `/opportunities` });
  for (const x of (a.data ?? []) as { id: string; name: string; role: string }[])
    items.push({ id: x.id, type: "Agent", title: x.name, subtitle: x.role, href: `/agents/${x.id}` });
  return items;
}

// ---- Mutations ----

export async function createProject(input: {
  name: string;
  priority: Project["priority"];
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("projects")
    .insert({ name: input.name, priority: input.priority })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("project", data.id, "Project created");
}

export async function createTask(input: {
  title: string;
  projectId: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("tasks")
    .insert({ title: input.title, project_id: input.projectId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("task", data.id, "Task created");
}

export async function createDecision(input: {
  decision: string;
  projectId: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("decisions")
    .insert({ decision: input.decision, project_id: input.projectId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("decision", data.id, "Decision logged");
}

export async function createOpportunity(input: {
  title: string;
  potential: Opportunity["potential"];
  nextAction: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("opportunities")
    .insert({ title: input.title, potential: input.potential, next_action: input.nextAction })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("opportunity", data.id, "Opportunity added");
}

export async function createResearch(input: {
  title: string;
  sourceUrl: string | null;
  summary: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("research")
    .insert({ title: input.title, source_url: input.sourceUrl, summary: input.summary })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("research", data.id, "Research saved");
}

export async function toggleTaskStatus(id: string, current: Task["status"]): Promise<void> {
  const next: Task["status"] = current === "todo" ? "doing" : current === "doing" ? "done" : "todo";
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ status: next }).eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent("task", id, `Status set to ${next}`);
}

export async function updateProjectMeta(
  id: string,
  patch: { priority?: Project["priority"]; status?: Project["status"] },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("projects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const what = patch.priority ? `priority ${patch.priority}` : patch.status ? `status ${patch.status}` : "details";
  await logEvent("project", id, `Updated ${what}`);
}

export async function updateProjectNotes(id: string, notes: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("projects")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent("project", id, "Updated description");
}

export async function updateTaskNotes(id: string, notes: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ notes }).eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent("task", id, "Updated notes");
}

export async function deleteTask(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProject(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOpportunity(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("opportunities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteResearch(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("research").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteDecision(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("decisions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createHandoff(scope: string, content: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("handoffs").insert({ scope, content });
  if (error) throw new Error(error.message);
}

async function logEvent(type: string, ref: string, message: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  await sb.from("events").insert({ type, ref, message });
}
