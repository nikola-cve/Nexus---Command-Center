import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ActivityEvent,
  Agent,
  DashboardData,
  Decision,
  Department,
  DepartmentWithTeams,
  DocumentType,
  Opportunity,
  OrgTree,
  Phase,
  PhaseWithTasks,
  Project,
  ProjectDocument,
  ProjectPlan,
  Research,
  Task,
  Team,
  TeamWithAgents,
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
  patch: {
    name?: string;
    role?: string;
    system_prompt?: string;
    color?: string;
    enabled?: boolean;
    team_id?: string | null;
    model?: string;
    skills?: string[];
    tools?: string[];
  },
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
  phaseId?: string | null;
  teamId?: string | null;
  assigneeAgentId?: string | null;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("tasks")
    .insert({
      title: input.title,
      project_id: input.projectId,
      phase_id: input.phaseId ?? null,
      team_id: input.teamId ?? null,
      assignee_agent_id: input.assigneeAgentId ?? null,
    })
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

// ---- Organization (departments / teams / agents) ----

/** The full org tree: departments to teams to agents, plus any unassigned agents. */
export async function getOrgTree(): Promise<OrgTree> {
  if (!isSupabaseConfigured) return { departments: [], unassigned: [] };
  const sb = await createSupabaseServerClient();
  const [deps, teams, agents] = await Promise.all([
    sb.from("departments").select("*").order("sort", { ascending: true }),
    sb.from("teams").select("*").order("sort", { ascending: true }),
    sb.from("agents").select("*").order("sort", { ascending: true }),
  ]);
  const departments = (deps.data ?? []) as Department[];
  const teamRows = (teams.data ?? []) as Team[];
  const agentRows = (agents.data ?? []) as Agent[];

  const agentsByTeam = new Map<string, Agent[]>();
  for (const a of agentRows) {
    if (!a.team_id) continue;
    const list = agentsByTeam.get(a.team_id) ?? [];
    list.push(a);
    agentsByTeam.set(a.team_id, list);
  }
  const teamsByDept = new Map<string, TeamWithAgents[]>();
  for (const t of teamRows) {
    const withAgents: TeamWithAgents = { ...t, agents: agentsByTeam.get(t.id) ?? [] };
    if (!t.department_id) continue;
    const list = teamsByDept.get(t.department_id) ?? [];
    list.push(withAgents);
    teamsByDept.set(t.department_id, list);
  }
  const tree: DepartmentWithTeams[] = departments.map((d) => ({
    ...d,
    teams: teamsByDept.get(d.id) ?? [],
  }));
  const unassigned = agentRows.filter((a) => !a.team_id);
  return { departments: tree, unassigned };
}

export async function getTeams(): Promise<Team[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("teams").select("*").order("sort", { ascending: true });
  return (data ?? []) as Team[];
}

export async function createDepartment(input: { name: string }): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data: maxRow } = await sb
    .from("departments")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = ((maxRow?.sort as number) ?? 0) + 1;
  const { error } = await sb.from("departments").insert({ name: input.name, sort });
  if (error) throw new Error(error.message);
}

export async function updateDepartment(
  id: string,
  patch: { name?: string; description?: string; color?: string; icon?: string },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("departments").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteDepartment(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("departments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createTeam(input: { name: string; departmentId: string }): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data: maxRow } = await sb
    .from("teams")
    .select("sort")
    .eq("department_id", input.departmentId)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = ((maxRow?.sort as number) ?? 0) + 1;
  const { error } = await sb
    .from("teams")
    .insert({ name: input.name, department_id: input.departmentId, sort });
  if (error) throw new Error(error.message);
}

export async function updateTeam(
  id: string,
  patch: { name?: string; description?: string; department_id?: string | null },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("teams").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTeam(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Project plan (phases + tasks) ----

/** Ordered phases each with their ordered tasks, plus tasks not yet in a phase. */
export async function getProjectPlan(projectId: string): Promise<ProjectPlan> {
  if (!isSupabaseConfigured) return { phases: [], unphased: [] };
  const sb = await createSupabaseServerClient();
  const [phases, tasks] = await Promise.all([
    sb.from("phases").select("*").eq("project_id", projectId).order("sort", { ascending: true }),
    sb
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);
  const phaseRows = (phases.data ?? []) as Phase[];
  const taskRows = (tasks.data ?? []) as Task[];
  const byPhase = new Map<string, Task[]>();
  for (const t of taskRows) {
    if (!t.phase_id) continue;
    const list = byPhase.get(t.phase_id) ?? [];
    list.push(t);
    byPhase.set(t.phase_id, list);
  }
  const withTasks: PhaseWithTasks[] = phaseRows.map((p) => ({ ...p, tasks: byPhase.get(p.id) ?? [] }));
  const unphased = taskRows.filter((t) => !t.phase_id);
  return { phases: withTasks, unphased };
}

export async function createPhase(input: { projectId: string; name: string }): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data: maxRow } = await sb
    .from("phases")
    .select("sort")
    .eq("project_id", input.projectId)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = ((maxRow?.sort as number) ?? 0) + 1;
  const { error } = await sb
    .from("phases")
    .insert({ project_id: input.projectId, name: input.name, sort });
  if (error) throw new Error(error.message);
  await logEvent("project", input.projectId, `Phase added: ${input.name}`);
}

export async function updatePhase(
  id: string,
  patch: { name?: string; status?: Phase["status"]; sort?: number },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("phases").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePhase(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("phases").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Update the plan-level fields of a task (owner, dependencies, dates, gate, phase). */
export async function updateTaskPlan(
  id: string,
  patch: {
    phase_id?: string | null;
    assignee_agent_id?: string | null;
    team_id?: string | null;
    depends_on?: string[];
    start_date?: string | null;
    due?: string | null;
    priority?: Task["priority"];
    status?: Task["status"];
    requires_approval?: boolean;
    title?: string;
    sort?: number;
  },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("tasks").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent("task", id, "Task plan updated");
}

// ---- Documents (product map, design, PRD, notes) ----

export async function getDocuments(projectId: string): Promise<ProjectDocument[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ProjectDocument[];
}

export async function createDocument(input: {
  projectId: string;
  type: DocumentType;
  title: string;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("documents")
    .insert({ project_id: input.projectId, type: input.type, title: input.title })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (data) await logEvent("project", input.projectId, `Document created: ${input.title}`);
}

export async function updateDocument(
  id: string,
  patch: { title?: string; content?: string },
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("documents")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteDocument(id: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
