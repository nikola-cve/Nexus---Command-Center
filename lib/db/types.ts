/** Domain types for the Nexus Command Center, matching the Supabase schema. */

export type SystemStatus = "healthy" | "warning" | "error";

export type Project = {
  id: string;
  name: string;
  status: "active" | "paused" | "done";
  priority: "high" | "medium" | "low";
  progress: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "high" | "medium" | "low";
  due: string | null;
  notes: string | null;
  created_at: string;
  // Agentic org / plan fields (S1)
  phase_id: string | null;
  assignee_agent_id: string | null;
  team_id: string | null;
  depends_on: string[];
  start_date: string | null;
  sort: number;
  requires_approval: boolean;
};

export type Phase = {
  id: string;
  project_id: string;
  name: string;
  status: "todo" | "doing" | "done";
  sort: number;
  created_at: string;
};

export type Department = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  sort: number;
  created_at: string;
};

export type Team = {
  id: string;
  department_id: string | null;
  slug: string | null;
  name: string;
  description: string | null;
  sort: number;
  created_at: string;
};

export type DocumentType = "product_map" | "design" | "prd" | "note";

export type ProjectDocument = {
  id: string;
  project_id: string;
  type: DocumentType;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Decision = {
  id: string;
  project_id: string | null;
  decision: string;
  rationale: string | null;
  decided_on: string;
  created_at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  status: "new" | "exploring" | "validated" | "dropped";
  potential: "high" | "medium" | "low";
  next_action: string | null;
  created_at: string;
};

export type Research = {
  id: string;
  project_id: string | null;
  title: string;
  source_url: string | null;
  summary: string | null;
  tags: string[] | null;
  created_at: string;
};

export type ActivityEvent = {
  id: string;
  type: string;
  ref: string | null;
  message: string;
  created_at: string;
};

export type Agent = {
  id: string;
  key: string | null;
  name: string;
  role: string;
  system_prompt: string;
  color: string;
  enabled: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
  // Agentic org fields (S1)
  team_id: string | null;
  skills: string[];
  model: string;
  tools: string[];
};

/** Nested org structure for the Org screen: departments to teams to agents. */
export type TeamWithAgents = Team & { agents: Agent[] };
export type DepartmentWithTeams = Department & { teams: TeamWithAgents[] };
export type OrgTree = {
  departments: DepartmentWithTeams[];
  unassigned: Agent[];
};

/** A project plan: ordered phases, each with its ordered tasks. */
export type PhaseWithTasks = Phase & { tasks: Task[] };
export type ProjectPlan = {
  phases: PhaseWithTasks[];
  unphased: Task[];
};

export type DashboardData = {
  projects: Project[];
  tasks: Task[];
  decisions: Decision[];
  opportunities: Opportunity[];
  research: Research[];
  agents: Agent[];
  events: ActivityEvent[];
};
