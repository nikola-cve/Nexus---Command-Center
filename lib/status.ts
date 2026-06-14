import type { Task } from "@/lib/db/types";

/** Operational status used across the Bridge map, inspector, and status bar. */
export type OpStatus = "idle" | "working" | "blocked" | "awaiting" | "done";

export const statusMeta: Record<OpStatus, { label: string; text: string; hex: string }> = {
  idle: { label: "Idle", text: "text-muted", hex: "#9398a8" },
  working: { label: "Working", text: "text-info", hex: "#4aa8ff" },
  blocked: { label: "Blocked", text: "text-danger", hex: "#f0616d" },
  awaiting: { label: "Awaiting", text: "text-warn", hex: "#e8b94a" },
  done: { label: "Done", text: "text-ok", hex: "#3ecf8e" },
};

/** Is a task blocked by an unfinished dependency? */
export function isBlocked(task: Task, doneIds: Set<string>): boolean {
  return task.status !== "done" && (task.depends_on ?? []).some((d) => !doneIds.has(d));
}

/** Derive an agent's live status from the tasks assigned to it. */
export function deriveAgentStatus(agentId: string, tasks: Task[]): OpStatus {
  const mine = tasks.filter((t) => t.assignee_agent_id === agentId);
  if (mine.length === 0) return "idle";
  const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
  if (mine.some((t) => t.status === "doing")) return "working";
  if (mine.some((t) => t.requires_approval && t.status !== "done")) return "awaiting";
  if (mine.some((t) => isBlocked(t, doneIds))) return "blocked";
  if (mine.every((t) => t.status === "done")) return "done";
  return "idle";
}
