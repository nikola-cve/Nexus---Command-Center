"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bot, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createDepartmentAction,
  createTeamAction,
  deleteDepartmentAction,
  deleteTeamAction,
  updateAgentAction,
  updateDepartmentAction,
  updateTeamAction,
  type ActionResult,
} from "@/app/actions";
import { agentColor } from "@/lib/agent-color";
import { deptIcon, DEPT_ICON_NAMES } from "@/lib/dept-icon";
import type { Agent, DepartmentWithTeams, TeamWithAgents } from "@/lib/db/types";

const COLORS = ["accent", "info", "ok", "accent-2", "warn", "danger", "plan"];

const inputClass =
  "h-9 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";

function modelShort(model: string): string {
  if (model.includes("opus")) return "Opus 4.8";
  if (model.includes("sonnet")) return "Sonnet 4.6";
  if (model.includes("haiku")) return "Haiku 4.5";
  if (model.includes("fable")) return "Fable 5";
  return model;
}

function run(
  start: (cb: () => void) => void,
  fn: () => Promise<ActionResult>,
  okMsg?: string,
) {
  start(async () => {
    const r = await fn();
    if (r.ok) {
      if (okMsg) toast.success(okMsg);
    } else toast.error(r.error);
  });
}

function AgentChip({ agent, teams }: { agent: Agent; teams: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-base/40 px-2.5 py-1.5">
      <Link
        href={`/agents/${agent.id}`}
        className="flex min-w-0 items-center gap-2 hover:text-accent"
        title={agent.role}
      >
        <Bot size={14} className={agentColor(agent.color)} />
        <span className="truncate text-sm font-medium text-fg">{agent.name}</span>
      </Link>
      <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
        {modelShort(agent.model)}
      </span>
      {agent.skills?.length > 0 && (
        <span className="hidden text-[10px] text-muted sm:inline">{agent.skills.length} skills</span>
      )}
      <select
        value={agent.team_id ?? ""}
        disabled={pending}
        onChange={(e) =>
          run(start, () => updateAgentAction(agent.id, { team_id: e.target.value || null }))
        }
        className="ml-auto h-7 max-w-[120px] rounded border border-line bg-surface/50 px-1 text-[11px] text-muted focus:outline-none"
        title="Move to team"
      >
        <option value="">Unassigned</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function TeamBlock({
  team,
  teams,
}: {
  team: TeamWithAgents;
  teams: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [desc, setDesc] = useState(team.description ?? "");
  const [pending, start] = useTransition();

  return (
    <div className="rounded-lg border border-line bg-surface/40 p-3">
      {editing ? (
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full ${inputClass}`} />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What this team owns"
            className={`w-full ${inputClass}`}
          />
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() =>
                run(
                  start,
                  async () => {
                    const r = await updateTeamAction(team.id, { name, description: desc });
                    if (r.ok) setEditing(false);
                    return r;
                  },
                  "Team saved",
                )
              }
              className="flex items-center gap-1 rounded-md border border-accent/50 px-2 py-1 text-xs text-accent hover:bg-accent/10"
            >
              <Check size={12} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-fg">{team.name}</div>
            {team.description && <div className="text-xs text-muted">{team.description}</div>}
          </div>
          <div className="flex shrink-0 gap-1">
            <button onClick={() => setEditing(true)} className="text-muted hover:text-fg" title="Edit team">
              <Pencil size={13} />
            </button>
            <button
              onClick={() =>
                run(start, () => deleteTeamAction(team.id), "Team deleted")
              }
              className="text-muted hover:text-danger"
              title="Delete team"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {team.agents.length === 0 ? (
          <p className="text-xs text-muted">No agents in this team yet.</p>
        ) : (
          team.agents.map((a) => <AgentChip key={a.id} agent={a} teams={teams} />)
        )}
      </div>
    </div>
  );
}

function AddTeam({ departmentId }: { departmentId: string }) {
  const [pending, start] = useTransition();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("departmentId", departmentId);
    run(
      start,
      async () => {
        const r = await createTeamAction(fd);
        if (r.ok) form.reset();
        return r;
      },
      "Team added",
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input name="name" required placeholder="New team" className={`flex-1 ${inputClass}`} />
      <button
        type="submit"
        disabled={pending}
        className="flex h-9 items-center gap-1 rounded-md border border-line px-2.5 text-xs text-muted hover:text-fg disabled:opacity-50"
      >
        <Plus size={13} /> Team
      </button>
    </form>
  );
}

function DepartmentCard({
  dept,
  teams,
}: {
  dept: DepartmentWithTeams;
  teams: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(dept.name);
  const [desc, setDesc] = useState(dept.description ?? "");
  const [color, setColor] = useState(dept.color);
  const [icon, setIcon] = useState(dept.icon ?? "Boxes");
  const [pending, start] = useTransition();
  const Icon = deptIcon(dept.icon);
  const agentCount = dept.teams.reduce((n, t) => n + t.agents.length, 0);

  return (
    <section className="panel p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface ${agentColor(dept.color)}`}>
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-fg">{dept.name}</h2>
            <p className="text-xs text-muted">
              {dept.teams.length} teams, {agentCount} agents
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => setEditing((v) => !v)} className="text-muted hover:text-fg" title="Edit department">
            <Pencil size={14} />
          </button>
          <button
            onClick={() =>
              run(start, () => deleteDepartmentAction(dept.id), "Department deleted")
            }
            className="text-muted hover:text-danger"
            title="Delete department"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {editing ? (
        <div className="mb-3 space-y-2 rounded-lg border border-line bg-surface/40 p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full ${inputClass}`} />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="What this department owns"
            className="w-full rounded-md border border-line bg-surface/50 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <select value={color} onChange={(e) => setColor(e.target.value)} className={inputClass}>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputClass}>
              {DEPT_ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              disabled={pending}
              onClick={() =>
                run(
                  start,
                  async () => {
                    const r = await updateDepartmentAction(dept.id, {
                      name,
                      description: desc,
                      color,
                      icon,
                    });
                    if (r.ok) setEditing(false);
                    return r;
                  },
                  "Department saved",
                )
              }
              className="flex items-center gap-1 rounded-md border border-accent/50 px-3 text-sm text-accent hover:bg-accent/10"
            >
              <Check size={13} /> Save
            </button>
          </div>
        </div>
      ) : (
        dept.description && <p className="mb-3 text-sm text-muted">{dept.description}</p>
      )}

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {dept.teams.map((t) => (
          <TeamBlock key={t.id} team={t} teams={teams} />
        ))}
      </div>
      <div className="mt-3">
        <AddTeam departmentId={dept.id} />
      </div>
    </section>
  );
}

export default function OrgManager({
  departments,
  unassigned,
}: {
  departments: DepartmentWithTeams[];
  unassigned: Agent[];
}) {
  const [pending, start] = useTransition();
  const teams = departments.flatMap((d) =>
    d.teams.map((t) => ({ id: t.id, name: `${d.name} / ${t.name}` })),
  );

  function addDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    run(
      start,
      async () => {
        const r = await createDepartmentAction(fd);
        if (r.ok) form.reset();
        return r;
      },
      "Department added",
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <form onSubmit={addDepartment} className="flex items-center gap-2">
          <input name="name" required placeholder="New department" className={`flex-1 ${inputClass}`} />
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center gap-1.5 rounded-md border border-accent/50 px-3 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            <Plus size={14} /> Department
          </button>
        </form>
      </section>

      {departments.map((d) => (
        <DepartmentCard key={d.id} dept={d} teams={teams} />
      ))}

      {unassigned.length > 0 && (
        <section className="panel p-4">
          <h2 className="hud-label mb-3">Unassigned agents</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unassigned.map((a) => (
              <AgentChip key={a.id} agent={a} teams={teams} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
