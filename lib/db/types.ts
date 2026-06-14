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

export type DashboardData = {
  projects: Project[];
  tasks: Task[];
  decisions: Decision[];
  opportunities: Opportunity[];
  research: Research[];
  events: ActivityEvent[];
};
