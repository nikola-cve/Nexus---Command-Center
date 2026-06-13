/**
 * Placeholder data for Step 1 (the visible shell).
 * Replaced by real Supabase data in Step 2. Kept in one file so it is easy to delete later.
 */

export type SystemStatus = "healthy" | "warning" | "error";

export type Project = {
  id: string;
  name: string;
  status: "active" | "paused" | "done";
  priority: "high" | "medium" | "low";
  progress: number; // 0..100
};

export type Task = {
  id: string;
  title: string;
  project: string;
  status: "todo" | "doing" | "done";
};

export type Opportunity = {
  id: string;
  title: string;
  potential: "high" | "medium" | "low";
  nextAction: string;
};

export type ActivityEvent = {
  id: string;
  time: string;
  message: string;
  kind: "task" | "decision" | "run" | "system";
};

export type OperatingMode = {
  key: string;
  label: string;
  state: "idle" | "active" | "standby";
};

export const systemStatus: SystemStatus = "healthy";

export const projects: Project[] = [
  { id: "p1", name: "Nexus Command Center", status: "active", priority: "high", progress: 18 },
  { id: "p2", name: "Productized AI Service", status: "active", priority: "medium", progress: 40 },
  { id: "p3", name: "Content Engine", status: "paused", priority: "low", progress: 12 },
];

export const tasks: Task[] = [
  { id: "t1", title: "Approve Step 1 foundation", project: "Nexus Command Center", status: "doing" },
  { id: "t2", title: "Define data model", project: "Nexus Command Center", status: "todo" },
  { id: "t3", title: "Draft offer and pricing", project: "Productized AI Service", status: "todo" },
  { id: "t4", title: "Pick 3 target niches", project: "Productized AI Service", status: "doing" },
];

export const opportunities: Opportunity[] = [
  { id: "o1", title: "AI ops dashboards for SMBs", potential: "high", nextAction: "Validate demand" },
  { id: "o2", title: "Founder handoff templates", potential: "medium", nextAction: "Draft sample" },
];

export const activity: ActivityEvent[] = [
  { id: "a1", time: "now", message: "Mission Control shell initialized", kind: "system" },
  { id: "a2", time: "now", message: "Operating rules loaded from CLAUDE.md", kind: "system" },
  { id: "a3", time: "queued", message: "Waiting for Step 1 approval", kind: "task" },
];

export const operatingModes: OperatingMode[] = [
  { key: "founder", label: "Founder", state: "standby" },
  { key: "research", label: "Research", state: "standby" },
  { key: "product", label: "Product", state: "standby" },
  { key: "cto", label: "CTO", state: "active" },
  { key: "execution", label: "Execution", state: "standby" },
  { key: "sales", label: "Sales", state: "idle" },
  { key: "critic", label: "Critic", state: "standby" },
];
