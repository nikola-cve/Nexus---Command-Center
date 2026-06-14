"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, CircleDot, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteOpportunityAction,
  deleteProjectAction,
  deleteTaskAction,
  toggleTaskStatusAction,
  updateProjectMetaAction,
  type ActionResult,
} from "@/app/actions";
import { cn } from "@/lib/utils";
import type { Opportunity, Project, Task } from "@/lib/db/types";

const priorityColor: Record<string, string> = {
  high: "text-danger",
  medium: "text-warn",
  low: "text-muted",
};

function useAction() {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, successMsg?: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        if (successMsg) toast.success(successMsg);
      } else {
        toast.error(r.error);
      }
    });
  return [pending, run] as const;
}

const iconBtn =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted transition-colors hover:text-accent disabled:opacity-40";

export function TaskRow({ task, projectName }: { task: Task; projectName?: string }) {
  const [pending, run] = useAction();
  const done = task.status === "done";
  const StatusIcon = done ? CheckCircle2 : task.status === "doing" ? CircleDot : Circle;
  return (
    <li className="group flex items-center gap-2 text-sm">
      <button
        title="Cycle status (todo, doing, done)"
        disabled={pending}
        onClick={() => run(() => toggleTaskStatusAction(task.id, task.status))}
        className={cn(iconBtn, done ? "text-ok" : task.status === "doing" ? "text-accent" : "")}
      >
        <StatusIcon size={15} />
      </button>
      <span className={cn("flex-1 truncate", done ? "text-muted line-through" : "text-fg")}>
        {task.title}
      </span>
      {projectName && <span className="shrink-0 text-xs text-muted">{projectName}</span>}
      <button
        title="Delete task"
        disabled={pending}
        onClick={() => run(() => deleteTaskAction(task.id), "Task deleted")}
        className={cn(iconBtn, "opacity-70 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100")}
      >
        <Trash2 size={13} />
      </button>
    </li>
  );
}

export function ProjectRow({ project }: { project: Project }) {
  const [pending, run] = useAction();
  return (
    <li className="group">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex-1 truncate text-fg">{project.name}</span>
        <select
          value={project.priority}
          disabled={pending}
          onChange={(e) =>
            run(() =>
              updateProjectMetaAction(project.id, {
                priority: e.target.value as Project["priority"],
              }),
            )
          }
          className={cn(
            "h-6 rounded border border-line bg-surface/50 px-1 text-xs focus:outline-none",
            priorityColor[project.priority],
          )}
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <select
          value={project.status}
          disabled={pending}
          onChange={(e) =>
            run(() =>
              updateProjectMetaAction(project.id, {
                status: e.target.value as Project["status"],
              }),
            )
          }
          className="h-6 rounded border border-line bg-surface/50 px-1 text-xs text-muted focus:outline-none"
        >
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="done">done</option>
        </select>
        <button
          title="Delete project"
          disabled={pending}
          onClick={() => run(() => deleteProjectAction(project.id), "Project deleted")}
          className={cn(iconBtn, "opacity-70 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100")}
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
      </div>
    </li>
  );
}

export function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  const [pending, run] = useAction();
  return (
    <li className="group rounded-lg border border-line bg-surface/40 p-3">
      <div className="flex items-start gap-2">
        <span className="flex-1 text-sm text-fg">{opportunity.title}</span>
        <button
          title="Delete opportunity"
          disabled={pending}
          onClick={() => run(() => deleteOpportunityAction(opportunity.id), "Opportunity deleted")}
          className={cn(iconBtn, "opacity-70 hover:text-danger sm:opacity-0 sm:group-hover:opacity-100")}
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={cn("hud-label", priorityColor[opportunity.potential])}>
          {opportunity.potential} potential
        </span>
        {opportunity.next_action && (
          <span className="text-xs text-muted">{opportunity.next_action}</span>
        )}
      </div>
    </li>
  );
}
