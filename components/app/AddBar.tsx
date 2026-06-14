"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createDecisionAction,
  createOpportunityAction,
  createProjectAction,
  createResearchAction,
  createTaskAction,
  type ActionResult,
} from "@/app/actions";
import type { Project } from "@/lib/db/types";

type Kind = "project" | "task" | "opportunity" | "decision" | "research";

const input =
  "h-9 min-w-[150px] flex-1 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";
const select = "h-9 rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none";

const config: Record<
  Kind,
  { action: (fd: FormData) => Promise<ActionResult>; success: string }
> = {
  project: { action: createProjectAction, success: "Project created" },
  task: { action: createTaskAction, success: "Task added" },
  opportunity: { action: createOpportunityAction, success: "Opportunity added" },
  decision: { action: createDecisionAction, success: "Decision logged" },
  research: { action: createResearchAction, success: "Research saved" },
};

/** A single add form for one entity type, wired to its server action with toasts. */
export default function AddBar({ kind, projects = [] }: { kind: Kind; projects?: Project[] }) {
  const [pending, start] = useTransition();
  const { action, success } = config[kind];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const r = await action(fd);
      if (r.ok) {
        toast.success(success);
        form.reset();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      {kind === "project" && (
        <>
          <input name="name" required placeholder="Project name" className={input} />
          <select name="priority" defaultValue="medium" className={select}>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </>
      )}

      {kind === "task" && (
        <>
          <input name="title" required placeholder="Task title" className={input} />
          <select name="projectId" defaultValue="" className={`${select} max-w-[170px]`}>
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      )}

      {kind === "opportunity" && (
        <>
          <input name="title" required placeholder="Opportunity" className={input} />
          <input name="nextAction" placeholder="Next action (optional)" className={input} />
          <select name="potential" defaultValue="medium" className={select}>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </>
      )}

      {kind === "decision" && (
        <>
          <input name="decision" required placeholder="Decision" className={input} />
          <select name="projectId" defaultValue="" className={`${select} max-w-[170px]`}>
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      )}

      {kind === "research" && (
        <>
          <input name="title" required placeholder="Title" className={input} />
          <input name="sourceUrl" placeholder="Source URL (optional)" className={input} />
          <input name="summary" placeholder="Summary (optional)" className={input} />
        </>
      )}

      <button
        type="submit"
        disabled={pending}
        className="glow-cyan flex h-9 items-center gap-1.5 rounded-md border border-accent/50 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
      >
        <Plus size={14} /> {pending ? "..." : "Add"}
      </button>
    </form>
  );
}
