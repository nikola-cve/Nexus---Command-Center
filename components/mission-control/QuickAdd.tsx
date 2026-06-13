"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createProjectAction, createTaskAction } from "@/app/actions";
import type { Project } from "@/lib/db/types";

/** Quick add forms wired to server actions. Lets the user create real data. */
export default function QuickAdd({ projects }: { projects: Project[] }) {
  const [tab, setTab] = useState<"project" | "task">("project");

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(["project", "task"] as const).map((t) => (
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

      {tab === "project" ? (
        <form action={createProjectAction} className="flex flex-wrap items-center gap-2">
          <input
            name="name"
            required
            placeholder="Project name"
            className="h-9 min-w-[180px] flex-1 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          <select
            name="priority"
            defaultValue="medium"
            className="h-9 rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none"
          >
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
          <SubmitButton />
        </form>
      ) : (
        <form action={createTaskAction} className="flex flex-wrap items-center gap-2">
          <input
            name="title"
            required
            placeholder="Task title"
            className="h-9 min-w-[180px] flex-1 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          <select
            name="projectId"
            defaultValue=""
            className="h-9 max-w-[180px] rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="glow-cyan flex h-9 items-center gap-1.5 rounded-md border border-accent/50 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
    >
      <Plus size={14} /> Add
    </button>
  );
}
