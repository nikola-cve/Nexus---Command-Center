"use client";

import { createElement, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, ExternalLink, Settings2 } from "lucide-react";
import { deptIcon } from "@/lib/dept-icon";
import { agentColor } from "@/lib/agent-color";
import { deriveAgentStatus, statusMeta, type OpStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Agent, DepartmentWithTeams, Task } from "@/lib/db/types";

type Sel = { kind: "agent"; id: string } | { kind: "department"; id: string } | null;

function Cluster({
  dept,
  tasks,
  selected,
  onSelect,
}: {
  dept: DepartmentWithTeams;
  tasks: Task[];
  selected: Sel;
  onSelect: (s: Sel) => void;
}) {
  const agents = dept.teams.flatMap((t) => t.agents);
  const n = Math.max(agents.length, 1);
  const deptActive = selected?.kind === "department" && selected.id === dept.id;

  return (
    <div className="panel relative aspect-square min-h-[230px] overflow-hidden p-3">
      <div className="telemetry absolute left-3 top-3 z-10 max-w-[70%] text-[11px] uppercase tracking-wider text-muted">
        {dept.name}
      </div>

      {/* orbit guides */}
      <div className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2" />
      <div className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-60" />

      {/* department core */}
      <button
        onClick={() => onSelect({ kind: "department", id: dept.id })}
        className={cn(
          "absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border bg-surface/70 backdrop-blur transition-transform hover:scale-105",
          deptActive ? "border-accent ring-2 ring-accent/40" : "border-white/10",
          agentColor(dept.color),
        )}
        title={dept.name}
      >
        {createElement(deptIcon(dept.icon), { size: 20 })}
      </button>

      {/* agent nodes on the orbit */}
      {agents.map((a, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = 31; // percent radius
        const left = 50 + r * Math.cos(angle);
        const top = 50 + r * Math.sin(angle);
        const st = deriveAgentStatus(a.id, tasks);
        const active = selected?.kind === "agent" && selected.id === a.id;
        const moving = st === "working" || st === "awaiting" || st === "blocked";
        return (
          <button
            key={a.id}
            onClick={() => onSelect({ kind: "agent", id: a.id })}
            style={{ left: `${left}%`, top: `${top}%` }}
            className={cn(
              "group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
            )}
            title={`${a.name} (${statusMeta[st].label})`}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border bg-surface/80 backdrop-blur transition-transform group-hover:scale-110",
                active ? "border-accent ring-2 ring-accent/40" : "border-white/12",
              )}
            >
              <Bot size={14} className={agentColor(a.color)} />
            </span>
            <span className={cn("node-dot h-1.5 w-1.5", statusMeta[st].text, moving && "node-pulse")} />
          </button>
        );
      })}

      {agents.length === 0 && (
        <span className="telemetry absolute bottom-3 left-3 text-[10px] text-muted">no agents</span>
      )}
    </div>
  );
}

function Inspector({
  sel,
  departments,
  tasks,
}: {
  sel: Sel;
  departments: DepartmentWithTeams[];
  tasks: Task[];
}) {
  const meta = useMemo(() => {
    const m = new Map<string, { agent: Agent; team: string; dept: string }>();
    for (const d of departments)
      for (const t of d.teams) for (const a of t.agents) m.set(a.id, { agent: a, team: t.name, dept: d.name });
    return m;
  }, [departments]);

  if (!sel) {
    return (
      <div className="space-y-3">
        <h3 className="hud-label">Legend</h3>
        <ul className="space-y-2 text-sm">
          {(Object.keys(statusMeta) as OpStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-2 text-muted">
              <span className={cn("node-dot h-2 w-2", statusMeta[s].text)} />
              {statusMeta[s].label}
            </li>
          ))}
        </ul>
        <p className="pt-2 text-xs text-muted">Select an agent or a department to inspect it.</p>
      </div>
    );
  }

  if (sel.kind === "department") {
    const d = departments.find((x) => x.id === sel.id);
    if (!d) return null;
    const agentCount = d.teams.reduce((n, t) => n + t.agents.length, 0);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn(agentColor(d.color))}>{createElement(deptIcon(d.icon), { size: 18 })}</span>
          <h3 className="text-base font-semibold text-fg">{d.name}</h3>
        </div>
        {d.description && <p className="text-sm text-muted">{d.description}</p>}
        <div className="telemetry text-[12px] text-muted">
          {d.teams.length} teams, {agentCount} agents
        </div>
        <div className="space-y-1">
          {d.teams.map((t) => (
            <div key={t.id} className="glass-inset px-3 py-2 text-sm">
              <div className="text-fg">{t.name}</div>
              <div className="telemetry text-[11px] text-muted">{t.agents.length} agents</div>
            </div>
          ))}
        </div>
        <Link href="/org" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
          Open in Organization <ExternalLink size={13} />
        </Link>
      </div>
    );
  }

  const info = meta.get(sel.id);
  if (!info) return null;
  const { agent, team, dept } = info;
  const st = deriveAgentStatus(agent.id, tasks);
  const mine = tasks.filter((t) => t.assignee_agent_id === agent.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bot size={18} className={agentColor(agent.color)} />
        <h3 className="text-base font-semibold text-fg">{agent.name}</h3>
        <span className={cn("node-dot ml-auto h-2 w-2", statusMeta[st].text)} title={statusMeta[st].label} />
      </div>
      <p className="text-sm text-muted">{agent.role}</p>
      <div className="telemetry flex flex-wrap gap-1.5 text-[11px]">
        <span className="glass-inset px-2 py-1">{dept} / {team}</span>
        <span className="glass-inset px-2 py-1">{agent.model.replace("claude-", "")}</span>
        <span className={cn("glass-inset px-2 py-1", statusMeta[st].text)}>{statusMeta[st].label}</span>
      </div>
      {agent.skills?.length > 0 && (
        <div>
          <div className="hud-label mb-1">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((s) => (
              <span key={s} className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-fg/80">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="hud-label mb-1">Tasks ({mine.length})</div>
        {mine.length === 0 ? (
          <p className="text-xs text-muted">No tasks assigned.</p>
        ) : (
          <ul className="space-y-1">
            {mine.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current text-muted" />
                <Link href={`/tasks/${t.id}`} className="truncate text-fg/85 hover:text-accent">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href={`/agents/${agent.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <Settings2 size={13} /> Configure agent
      </Link>
    </div>
  );
}

export default function BridgeView({
  departments,
  tasks,
}: {
  departments: DepartmentWithTeams[];
  tasks: Task[];
}) {
  const [sel, setSel] = useState<Sel>(null);
  const totalAgents = departments.reduce((n, d) => n + d.teams.reduce((m, t) => m + t.agents.length, 0), 0);
  const working = tasks.filter((t) => t.status === "doing").length;

  return (
    <div className="flex h-full flex-col xl:flex-row">
      <div className="min-w-0 flex-1 p-4 sm:p-6">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Bridge</h1>
          <p className="telemetry mt-1 text-[12px] text-muted">
            {departments.length} departments, {totalAgents} agents, {working} working
          </p>
        </header>
        {departments.length === 0 ? (
          <p className="text-sm text-muted">No organization yet. Add departments in Organization.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {departments.map((d) => (
              <Cluster key={d.id} dept={d} tasks={tasks} selected={sel} onSelect={setSel} />
            ))}
          </div>
        )}
      </div>

      <aside className="scroll-thin shrink-0 overflow-y-auto border-t border-white/10 p-4 xl:w-80 xl:border-l xl:border-t-0">
        <Inspector sel={sel} departments={departments} tasks={tasks} />
      </aside>
    </div>
  );
}
