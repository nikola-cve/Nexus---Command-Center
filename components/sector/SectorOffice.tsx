import { createElement } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, CircleDot, ShieldAlert, UserRound } from "lucide-react";
import { agentColor } from "@/lib/agent-color";
import { deptIcon } from "@/lib/dept-icon";
import { deriveAgentStatus, isBlocked, statusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Agent, DepartmentWithTeams, Task, TeamWithAgents } from "@/lib/db/types";

const taskStatusColor: Record<Task["status"], string> = {
  todo: "text-muted",
  doing: "text-info",
  done: "text-ok",
};

function AgentChip({ agent, tasks }: { agent: Agent; tasks: Task[] }) {
  const st = deriveAgentStatus(agent.id, tasks);
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 hover:border-accent/40"
    >
      <Bot size={14} className={agentColor(agent.color)} />
      <span className="text-sm font-medium text-fg">{agent.name}</span>
      <span className="telemetry rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-muted">
        {agent.model.replace("claude-", "")}
      </span>
      <span className={cn("node-dot ml-1 h-1.5 w-1.5", statusMeta[st].text)} title={statusMeta[st].label} />
    </Link>
  );
}

function TeamModule({
  team,
  agentsById,
  tasks,
}: {
  team: TeamWithAgents;
  agentsById: Map<string, Agent>;
  tasks: Task[];
}) {
  const agentIds = new Set(team.agents.map((a) => a.id));
  const teamTasks = tasks.filter(
    (t) => t.team_id === team.id || (t.assignee_agent_id && agentIds.has(t.assignee_agent_id)),
  );
  const done = teamTasks.filter((t) => t.status === "done").length;
  const pct = teamTasks.length ? Math.round((done / teamTasks.length) * 100) : 0;
  const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
  const lead = team.lead_agent_id ? agentsById.get(team.lead_agent_id) : null;

  return (
    <section className="panel p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-fg">{team.name}</h3>
          {team.description && <p className="text-xs text-muted">{team.description}</p>}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <UserRound size={12} /> {lead ? `Lead: ${lead.name}` : "No lead"}
        </div>
      </header>

      {team.agents.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {team.agents.map((a) => (
            <AgentChip key={a.id} agent={a} tasks={tasks} />
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="hud-label">Plan ({teamTasks.length})</span>
        <span className="telemetry text-muted">
          {done}/{teamTasks.length} done, {pct}%
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>

      {teamTasks.length === 0 ? (
        <p className="text-sm text-muted">No tasks yet. Assign tasks to this team in a project plan.</p>
      ) : (
        <ul className="space-y-1.5">
          {teamTasks.map((t) => {
            const blocked = isBlocked(t, doneIds);
            return (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5"
              >
                <CircleDot size={14} className={taskStatusColor[t.status]} />
                <Link href={`/tasks/${t.id}`} className="min-w-0 flex-1 truncate text-sm text-fg hover:text-accent">
                  {t.title}
                </Link>
                {t.requires_approval && t.status !== "done" && (
                  <ShieldAlert size={13} className="text-warn" aria-label="Awaiting approval" />
                )}
                {blocked && <span className="telemetry text-[10px] text-danger">blocked</span>}
                {t.assignee_agent_id && agentsById.get(t.assignee_agent_id) && (
                  <span className="telemetry text-[10px] text-muted">
                    {agentsById.get(t.assignee_agent_id)!.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function SectorOffice({
  dept,
  agents,
  tasks,
}: {
  dept: DepartmentWithTeams;
  agents: Agent[];
  tasks: Task[];
}) {
  const agentsById = new Map(agents.map((a) => [a.id, a]));
  const director = dept.lead_agent_id ? agentsById.get(dept.lead_agent_id) : null;
  const allAgents = dept.teams.flatMap((t) => t.agents);
  const agentIds = new Set(allAgents.map((a) => a.id));
  const sectorTasks = tasks.filter(
    (t) =>
      (t.assignee_agent_id && agentIds.has(t.assignee_agent_id)) ||
      dept.teams.some((tm) => tm.id === t.team_id),
  );
  const done = sectorTasks.filter((t) => t.status === "done").length;
  const pct = sectorTasks.length ? Math.round((done / sectorTasks.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link href="/bridge" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft size={14} /> Command Center
      </Link>

      <header className="panel mb-5 p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-2",
              agentColor(dept.color),
            )}
          >
            {createElement(deptIcon(dept.icon), { size: 22 })}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-fg">{dept.name}</h1>
            {dept.description && <p className="mt-0.5 text-sm text-muted">{dept.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <UserRound size={12} /> {director ? `Director: ${director.name}` : "No director"}
              </span>
              <span>{dept.teams.length} teams</span>
              <span>{allAgents.length} agents</span>
              <span className="telemetry">{done}/{sectorTasks.length} tasks, {pct}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {dept.teams.map((t) => (
          <TeamModule key={t.id} team={t} agentsById={agentsById} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
