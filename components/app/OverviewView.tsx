"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Bot, Boxes, ListChecks, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/ui/Panel";
import AddBar from "@/components/app/AddBar";
import { fmtTime, nowClock } from "@/lib/format";
import { agentColor } from "@/lib/agent-color";
import type { DashboardData } from "@/lib/db/types";

const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(nowClock());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-accent tabular-nums">{now ?? "--:--:--"}</span>;
}

export default function OverviewView({ data }: { data: DashboardData }) {
  const stats = [
    { label: "Projects", value: data.projects.filter((p) => p.status === "active").length, color: "text-accent" },
    { label: "Open Tasks", value: data.tasks.filter((t) => t.status !== "done").length, color: "text-ok" },
    { label: "Leads", value: data.opportunities.length, color: "text-warn" },
    { label: "Decisions", value: data.decisions.length, color: "text-accent-2" },
  ];

  const priorityProjects = [...data.projects]
    .filter((p) => p.status === "active")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 4);

  const inProgress = data.tasks.filter((t) => t.status === "doing").slice(0, 6);
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Overview</h1>
          <p className="hud-label mt-0.5">Personal Operating Center</p>
        </div>
        <Clock />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4">
            <div className={cn("text-3xl font-semibold tabular-nums", s.color)}>{s.value}</div>
            <div className="hud-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Priority projects" icon={<Boxes size={14} />}>
          {priorityProjects.length === 0 ? (
            <p className="text-sm text-muted">No active projects.</p>
          ) : (
            <ul className="space-y-3">
              {priorityProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between text-sm text-fg hover:text-accent"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="ml-2 shrink-0 font-mono text-xs text-muted">{p.progress}%</span>
                  </Link>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${p.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="In progress" icon={<Target size={14} />}>
          {inProgress.length === 0 ? (
            <p className="text-sm text-muted">Nothing in progress. Pick a task to start.</p>
          ) : (
            <ul className="space-y-2">
              {inProgress.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <Link href={`/tasks/${t.id}`} className="flex-1 truncate text-fg hover:text-accent">
                    {t.title}
                  </Link>
                  {t.project_id && (
                    <span className="shrink-0 text-xs text-muted">{projectName.get(t.project_id)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Quick capture" icon={<ListChecks size={14} />}>
          <AddBar kind="task" projects={data.projects} />
        </Panel>
      </div>

      <div className="mt-4">
        <Panel
          title="Agents"
          icon={<Bot size={14} />}
          action={
            <Link href="/agents" className="hud-label text-accent hover:underline">
              manage
            </Link>
          }
        >
          <div className="flex flex-wrap gap-2">
            {data.agents
              .filter((a) => a.enabled)
              .map((a) => (
                <Link
                  key={a.id}
                  href={`/agents/${a.id}`}
                  className={cn(
                    "rounded-md border border-line px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent/50",
                    agentColor(a.color),
                  )}
                >
                  {a.name}
                </Link>
              ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Chat and dispatch to agents arrives with the Claude engine (Step 3).
          </p>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Activity" icon={<Activity size={14} />}>
          {data.events.length === 0 ? (
            <p className="text-sm text-muted">No activity yet.</p>
          ) : (
            <ul className="space-y-2 font-mono text-xs">
              {data.events.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-muted">{fmtTime(e.created_at)}</span>
                  <span className="text-fg">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
