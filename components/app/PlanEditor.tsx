"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  Lock,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPhaseAction,
  createTaskAction,
  deletePhaseAction,
  deleteTaskAction,
  updatePhaseAction,
  updateTaskPlanAction,
  type ActionResult,
} from "@/app/actions";
import { agentColor } from "@/lib/agent-color";
import type { Agent, PhaseWithTasks, Task, Team } from "@/lib/db/types";

const input =
  "h-8 rounded-md border border-line bg-surface/50 px-2 text-xs text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";

const statusColor: Record<Task["status"], string> = {
  todo: "text-muted",
  doing: "text-info",
  done: "text-ok",
};
const priorityColor: Record<Task["priority"], string> = {
  high: "text-danger",
  medium: "text-warn",
  low: "text-muted",
};

function run(start: (cb: () => void) => void, fn: () => Promise<ActionResult>, ok?: string) {
  start(async () => {
    const r = await fn();
    if (r.ok) {
      if (ok) toast.success(ok);
    } else toast.error(r.error);
  });
}

function TaskRow({
  task,
  agents,
  teams,
  siblings,
}: {
  task: Task;
  agents: Agent[];
  teams: Team[];
  siblings: Task[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const agent = agents.find((a) => a.id === task.assignee_agent_id);
  const deps = task.depends_on ?? [];

  function patch(p: Parameters<typeof updateTaskPlanAction>[1]) {
    run(start, () => updateTaskPlanAction(task.id, p));
  }

  return (
    <li className="rounded-lg border border-line bg-base/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() =>
            patch({ status: task.status === "done" ? "todo" : task.status === "todo" ? "doing" : "done" })
          }
          className={statusColor[task.status]}
          title={`Status: ${task.status}`}
        >
          <CircleDot size={15} />
        </button>
        <span className="min-w-0 flex-1 truncate text-sm text-fg">{task.title}</span>
        {task.requires_approval && (
          <ShieldAlert size={13} className="text-warn" aria-label="Requires human approval" />
        )}
        {deps.length > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted" title="Has dependencies">
            <Lock size={11} /> {deps.length}
          </span>
        )}
        {agent && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${agentColor(agent.color)}`} />
            {agent.name}
          </span>
        )}
        <span className={`text-[10px] ${priorityColor[task.priority]}`}>{task.priority}</span>
        <button onClick={() => setOpen((v) => !v)} className="text-muted hover:text-fg">
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-line px-3 py-2.5">
          <div className="flex flex-wrap gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Owner</span>
              <select
                value={task.assignee_agent_id ?? ""}
                onChange={(e) => patch({ assignee_agent_id: e.target.value || null })}
                className={input}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Team</span>
              <select
                value={task.team_id ?? ""}
                onChange={(e) => patch({ team_id: e.target.value || null })}
                className={input}
              >
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => patch({ priority: e.target.value as Task["priority"] })}
                className={input}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Start</span>
              <input
                type="date"
                defaultValue={task.start_date ?? ""}
                onChange={(e) => patch({ start_date: e.target.value || null })}
                className={input}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Due</span>
              <input
                type="date"
                defaultValue={task.due ?? ""}
                onChange={(e) => patch({ due: e.target.value || null })}
                className={input}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-muted">Depends on (waits for these to finish)</span>
            <select
              multiple
              value={deps}
              onChange={(e) =>
                patch({
                  depends_on: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
              className="min-h-[64px] rounded-md border border-line bg-surface/50 px-2 py-1 text-xs text-fg focus:outline-none"
            >
              {siblings
                .filter((s) => s.id !== task.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-fg">
              <input
                type="checkbox"
                checked={task.requires_approval}
                onChange={(e) => patch({ requires_approval: e.target.checked })}
                className="h-3.5 w-3.5 accent-yellow-500"
              />
              Requires my approval (human gate)
            </label>
            <button
              disabled={pending}
              onClick={() => run(start, () => deleteTaskAction(task.id), "Task deleted")}
              className="flex items-center gap-1 text-xs text-muted hover:text-danger"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddTask({ projectId, phaseId }: { projectId: string; phaseId: string }) {
  const [pending, start] = useTransition();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectId", projectId);
    fd.set("phaseId", phaseId);
    run(
      start,
      async () => {
        const r = await createTaskAction(fd);
        if (r.ok) form.reset();
        return r;
      },
      "Task added",
    );
  }
  return (
    <form onSubmit={onSubmit} className="mt-2 flex items-center gap-2">
      <input name="title" required placeholder="New task" className={`flex-1 ${input} h-9`} />
      <button
        type="submit"
        disabled={pending}
        className="flex h-9 items-center gap-1 rounded-md border border-line px-2.5 text-xs text-muted hover:text-fg disabled:opacity-50"
      >
        <Plus size={13} /> Task
      </button>
    </form>
  );
}

function PhaseBlock({
  phase,
  projectId,
  agents,
  teams,
  allTasks,
}: {
  phase: PhaseWithTasks;
  projectId: string;
  agents: Agent[];
  teams: Team[];
  allTasks: Task[];
}) {
  const [pending, start] = useTransition();
  const done = phase.tasks.filter((t) => t.status === "done").length;

  return (
    <section className="panel p-4">
      <header className="mb-3 flex items-center gap-2">
        <select
          value={phase.status}
          onChange={(e) =>
            run(start, () => updatePhaseAction(phase.id, { status: e.target.value as PhaseWithTasks["status"] }))
          }
          className="h-7 rounded border border-line bg-surface/50 px-1.5 text-[11px] text-muted focus:outline-none"
        >
          <option value="todo">todo</option>
          <option value="doing">doing</option>
          <option value="done">done</option>
        </select>
        <h3 className="text-sm font-semibold text-fg">{phase.name}</h3>
        <span className="text-[11px] text-muted">
          {done}/{phase.tasks.length}
        </span>
        <button
          disabled={pending}
          onClick={() => run(start, () => deletePhaseAction(phase.id), "Phase deleted")}
          className="ml-auto text-muted hover:text-danger"
          title="Delete phase"
        >
          <Trash2 size={14} />
        </button>
      </header>

      {phase.tasks.length > 0 && (
        <ul className="space-y-1.5">
          {phase.tasks.map((t) => (
            <TaskRow key={t.id} task={t} agents={agents} teams={teams} siblings={allTasks} />
          ))}
        </ul>
      )}
      <AddTask projectId={projectId} phaseId={phase.id} />
    </section>
  );
}

export default function PlanEditor({
  projectId,
  phases,
  unphased,
  agents,
  teams,
}: {
  projectId: string;
  phases: PhaseWithTasks[];
  unphased: Task[];
  agents: Agent[];
  teams: Team[];
}) {
  const [pending, start] = useTransition();
  const allTasks = [...phases.flatMap((p) => p.tasks), ...unphased];

  function addPhase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectId", projectId);
    run(
      start,
      async () => {
        const r = await createPhaseAction(fd);
        if (r.ok) form.reset();
        return r;
      },
      "Phase added",
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <form onSubmit={addPhase} className="flex items-center gap-2">
          <input name="name" required placeholder="New phase (e.g. Validation, Build, Launch)" className={`flex-1 ${input} h-9`} />
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center gap-1.5 rounded-md border border-accent/50 px-3 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            <Plus size={14} /> Phase
          </button>
        </form>
      </section>

      {phases.map((p) => (
        <PhaseBlock
          key={p.id}
          phase={p}
          projectId={projectId}
          agents={agents}
          teams={teams}
          allTasks={allTasks}
        />
      ))}

      {unphased.length > 0 && (
        <section className="panel p-4">
          <h3 className="hud-label mb-3">Not in a phase</h3>
          <ul className="space-y-1.5">
            {unphased.map((t) => (
              <TaskRow key={t.id} task={t} agents={agents} teams={teams} siblings={allTasks} />
            ))}
          </ul>
        </section>
      )}

      {phases.length === 0 && unphased.length === 0 && (
        <p className="text-sm text-muted">No phases yet. Add the first phase of the plan above.</p>
      )}
    </div>
  );
}
