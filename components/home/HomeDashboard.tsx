import { createElement } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Boxes, FileText, Lock, ShieldAlert, UserRound } from "lucide-react";
import { agentColor } from "@/lib/agent-color";
import { deptIcon } from "@/lib/dept-icon";
import { fmtTime } from "@/lib/format";
import { deriveAgentStatus, isBlocked } from "@/lib/status";
import { cn } from "@/lib/utils";
import type {
  ActivityEvent,
  Agent,
  DepartmentWithTeams,
  Project,
  ProjectDocument,
  Task,
} from "@/lib/db/types";

const docLabel: Record<string, string> = {
  product_map: "Product Map",
  design: "Design",
  prd: "PRD",
  note: "Note",
};

function Module({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Kpi({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <span className="hud-label">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</div>
    </div>
  );
}

function SectorCard({
  dept,
  agentsById,
  tasks,
}: {
  dept: DepartmentWithTeams;
  agentsById: Map<string, Agent>;
  tasks: Task[];
}) {
  const agents = dept.teams.flatMap((t) => t.agents);
  const agentIds = new Set(agents.map((a) => a.id));
  const sectorTasks = tasks.filter((t) => t.assignee_agent_id && agentIds.has(t.assignee_agent_id));
  const done = sectorTasks.filter((t) => t.status === "done").length;
  const pct = sectorTasks.length ? Math.round((done / sectorTasks.length) * 100) : 0;
  const director = dept.lead_agent_id ? agentsById.get(dept.lead_agent_id) : null;

  const working = agents.filter((a) => deriveAgentStatus(a.id, tasks) === "working").length;

  return (
    <Link href={`/sectors/${dept.id}`} className="panel panel-hover block p-4">
      <header className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2",
            agentColor(dept.color),
          )}
        >
          {createElement(deptIcon(dept.icon), { size: 18 })}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-fg">{dept.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted">
            <UserRound size={12} />
            {director ? director.name : "No director"}
          </p>
        </div>
        <ArrowRight size={16} className="ml-auto shrink-0 text-muted" />
      </header>

      <div className="mb-3 space-y-1">
        {dept.teams.map((t) => {
          const lead = t.lead_agent_id ? agentsById.get(t.lead_agent_id) : null;
          return (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              <span className="h-1 w-1 rounded-full bg-muted" />
              <span className="text-fg/80">{t.name}</span>
              {lead && <span className="text-muted">lead {lead.name}</span>}
              <span className="ml-auto telemetry text-[10px] text-muted">{t.agents.length}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted">
          {done}/{sectorTasks.length} tasks
        </span>
        <span className="flex items-center gap-2 telemetry">
          {working > 0 && <span className="text-info">{working} working</span>}
          <span className="text-muted">{pct}%</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}

export default function HomeDashboard({
  departments,
  agents,
  tasks,
  projects,
  events,
  documents,
}: {
  departments: DepartmentWithTeams[];
  agents: Agent[];
  tasks: Task[];
  projects: Project[];
  events: ActivityEvent[];
  documents: ProjectDocument[];
}) {
  const agentsById = new Map(agents.map((a) => [a.id, a]));
  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
  const working = tasks.filter((t) => t.status === "doing").length;
  const blocked = tasks.filter((t) => isBlocked(t, doneIds));
  const awaiting = tasks.filter((t) => t.requires_approval && t.status !== "done");

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Command Center</h1>
        <p className="text-sm text-muted">Every sector, plan, and gate at a glance.</p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Sectors" value={departments.length} dot="bg-accent" />
        <Kpi label="Agents" value={agents.length} dot="bg-accent-2" />
        <Kpi label="Working" value={working} dot="bg-info" />
        <Kpi label="Blocked" value={blocked.length} dot="bg-danger" />
        <Kpi label="Awaiting" value={awaiting.length} dot="bg-warn" />
        <Kpi label="Projects" value={projects.length} dot="bg-ok" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div>
          <h2 className="hud-label mb-2">Sectors</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {departments.map((d) => (
              <SectorCard key={d.id} dept={d} agentsById={agentsById} tasks={tasks} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Module title="Approval gates" icon={<ShieldAlert size={15} />}>
            {awaiting.length === 0 ? (
              <p className="text-sm text-muted">Nothing waiting on you.</p>
            ) : (
              <ul className="space-y-2">
                {awaiting.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <ShieldAlert size={13} className="shrink-0 text-warn" />
                    <Link href={`/tasks/${t.id}`} className="flex-1 truncate text-fg/85 hover:text-accent">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Module>

          <Module
            title="Projects"
            icon={<Boxes size={15} />}
            action={
              <Link href="/projects" className="hud-label text-accent hover:underline">
                all
              </Link>
            }
          >
            {projects.length === 0 ? (
              <p className="text-sm text-muted">No projects yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {projects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between text-sm text-fg hover:text-accent"
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="telemetry ml-2 shrink-0 text-xs text-muted">{p.progress}%</span>
                    </Link>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${p.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Module>

          <Module title="Problems" icon={<Lock size={15} />}>
            {blocked.length === 0 ? (
              <p className="text-sm text-muted">Nothing blocked.</p>
            ) : (
              <ul className="space-y-2">
                {blocked.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <Lock size={13} className="shrink-0 text-danger" />
                    <Link href={`/tasks/${t.id}`} className="flex-1 truncate text-fg/85 hover:text-accent">
                      {t.title}
                    </Link>
                    {t.project_id && (
                      <span className="telemetry text-[10px] text-muted">{projectName.get(t.project_id)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Module>

          <Module title="Library" icon={<FileText size={15} />}>
            {documents.length === 0 ? (
              <p className="text-sm text-muted">No documents yet.</p>
            ) : (
              <ul className="space-y-2">
                {documents.slice(0, 5).map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm">
                    <FileText size={13} className="shrink-0 text-accent-2" />
                    {d.project_id ? (
                      <Link
                        href={`/projects/${d.project_id}`}
                        className="flex-1 truncate text-fg/85 hover:text-accent"
                      >
                        {d.title || "Untitled"}
                      </Link>
                    ) : (
                      <span className="flex-1 truncate text-fg/85">{d.title || "Untitled"}</span>
                    )}
                    <span className="telemetry text-[10px] text-muted">{docLabel[d.type] ?? "Note"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Module>

          <Module title="Activity" icon={<Activity size={15} />}>
            {events.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="telemetry space-y-1.5 text-[11px]">
                {events.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-start gap-2">
                    <span className="shrink-0 text-muted/70">{fmtTime(e.created_at)}</span>
                    <span className="text-fg/80">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Module>
        </div>
      </div>
    </div>
  );
}
