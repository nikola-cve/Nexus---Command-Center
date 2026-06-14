"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createOpportunityAction,
  createProjectAction,
  createTaskAction,
  type ActionResult,
} from "@/app/actions";
import type { Project } from "@/lib/db/types";

type Tab = "project" | "task" | "opportunity";

const inputClass =
  "h-9 min-w-[160px] flex-1 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";
const selectClass =
  "h-9 rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none";

/** Quick add forms (project, task, opportunity) wired to server actions with toasts. */
export default function QuickAdd({ projects }: { projects: Project[] }) {
  const [tab, setTab] = useState<Tab>("project");
  const [pending, start] = useTransition();

  function submit(
    action: (fd: FormData) => Promise<ActionResult>,
    form: HTMLFormElement,
    successMsg: string,
  ) {
    const fd = new FormData(form);
    start(async () => {
      const r = await action(fd);
      if (r.ok) {
        toast.success(successMsg);
        form.reset();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["project", "task", "opportunity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors " +
              (tab === t ? "border-accent/50 text-accent" : "border-line text-muted")
            }
          >
            New {t}
          </button>
        ))}
      </div>

      {tab === "project" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(createProjectAction, e.currentTarget, "Project created");
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input name="name" required placeholder="Project name" className={inputClass} />
          <select name="priority" defaultValue="medium" className={selectClass}>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
          <SubmitButton pending={pending} />
        </form>
      )}

      {tab === "task" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(createTaskAction, e.currentTarget, "Task added");
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input name="title" required placeholder="Task title" className={inputClass} />
          <select name="projectId" defaultValue="" className={`${selectClass} max-w-[160px]`}>
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <SubmitButton pending={pending} />
        </form>
      )}

      {tab === "opportunity" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(createOpportunityAction, e.currentTarget, "Opportunity added");
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input name="title" required placeholder="Opportunity" className={inputClass} />
          <input name="nextAction" placeholder="Next action (optional)" className={inputClass} />
          <select name="potential" defaultValue="medium" className={selectClass}>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
          <SubmitButton pending={pending} />
        </form>
      )}
    </div>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="glow-cyan flex h-9 items-center gap-1.5 rounded-md border border-accent/50 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
    >
      <Plus size={14} /> {pending ? "..." : "Add"}
    </button>
  );
}
